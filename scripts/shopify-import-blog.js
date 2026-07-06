#!/usr/bin/env node
/**
 * Importeer WordPress blogposts naar Shopify blog (handle: nieuws).
 *
 * Usage:
 *   node --env-file=.env scripts/shopify-import-blog.js
 *   node --env-file=.env scripts/shopify-import-blog.js --dry-run
 */

const fs = require('fs')
const path = require('path')
const { getCredentials } = require('./lib/shopify-auth')
const { shopifyGraphql, delay } = require('./lib/shopify-client')

const ROOT = path.join(__dirname, '..')
const POSTS_INPUT = path.join(ROOT, 'data/import/wc-api/posts.json')
const REPORT = path.join(ROOT, 'data/import/shopify-blog-report.json')
const BLOG_HANDLE = 'nieuws'

const dryRun = process.argv.includes('--dry-run')

function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function getOrCreateBlog(credentials) {
  const existing = await shopifyGraphql(
    `query {
      blogs(first: 1, query: "handle:${BLOG_HANDLE}") {
        nodes { id handle title }
      }
    }`,
    {},
    credentials
  )

  if (existing.blogs.nodes[0]) return existing.blogs.nodes[0]

  const created = await shopifyGraphql(
    `mutation($blog: BlogCreateInput!) {
      blogCreate(blog: $blog) {
        blog { id handle title }
        userErrors { field message }
      }
    }`,
    { blog: { handle: BLOG_HANDLE, title: 'Nieuws' } },
    credentials
  )

  const result = created.blogCreate
  if (result.userErrors?.length) {
    throw new Error(result.userErrors.map((e) => e.message).join('; '))
  }
  return result.blog
}

async function loadExistingArticles(blogId, credentials) {
  const byHandle = new Map()
  let cursor = null

  while (true) {
    const data = await shopifyGraphql(
      `query($blogId: ID!, $cursor: String) {
        blog(id: $blogId) {
          articles(first: 100, after: $cursor) {
            pageInfo { hasNextPage endCursor }
            nodes { id handle title }
          }
        }
      }`,
      { blogId, cursor },
      credentials
    )

    data.blog.articles.nodes.forEach((article) => byHandle.set(article.handle, article))
    if (!data.blog.articles.pageInfo.hasNextPage) break
    cursor = data.blog.articles.pageInfo.endCursor
    await delay(100)
  }

  return byHandle
}

async function createArticle(blogId, post, credentials) {
  const title = post.title?.rendered || post.slug
  const bodyHtml = post.content?.rendered || ''
  const summaryHtml = post.excerpt?.rendered || stripHtml(bodyHtml).slice(0, 300)

  const data = await shopifyGraphql(
    `mutation($article: ArticleCreateInput!) {
      articleCreate(article: $article) {
        article { id handle title }
        userErrors { field message }
      }
    }`,
    {
      article: {
        blogId,
        title,
        handle: post.slug,
        body: bodyHtml,
        summary: summaryHtml,
        isPublished: post.status === 'publish',
        author: { name: 'Bloemen van De Gier' },
        tags: post.tags?.length ? post.tags.map(String) : undefined,
      },
    },
    credentials
  )

  const result = data.articleCreate
  if (result.userErrors?.length) {
    const msg = result.userErrors.map((e) => e.message).join('; ')
    if (msg.includes('already been taken') || msg.includes('already exists')) {
      return { skipped: true }
    }
    throw new Error(msg)
  }
  return { created: true, article: result.article }
}

async function main() {
  if (!fs.existsSync(POSTS_INPUT)) {
    throw new Error(`Posts niet gevonden. Draai eerst: npm run wc:fetch-all\nPad: ${POSTS_INPUT}`)
  }

  const posts = JSON.parse(fs.readFileSync(POSTS_INPUT, 'utf-8')).filter((p) => p.status === 'publish')
  const credentials = await getCredentials()

  console.log(`Blogposts: ${posts.length}`)
  if (dryRun) {
    posts.forEach((p) => console.log(`  - ${p.slug}`))
    return
  }

  const blog = await getOrCreateBlog(credentials)
  console.log(`Blog: ${blog.handle} (${blog.id})`)

  const existingArticles = await loadExistingArticles(blog.id, credentials)
  console.log(`Bestaande artikelen: ${existingArticles.size}`)

  const report = {
    startedAt: new Date().toISOString(),
    blogHandle: BLOG_HANDLE,
    blogId: blog.id,
    total: posts.length,
    created: 0,
    skipped: 0,
    errors: [],
    results: [],
  }

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i]
    process.stdout.write(`[${i + 1}/${posts.length}] ${post.slug}...`)

    try {
      const existing = existingArticles.get(post.slug)
      if (existing) {
        report.skipped++
        report.results.push({ slug: post.slug, status: 'exists', id: existing.id })
        console.log(' bestaat al')
        continue
      }

      const result = await createArticle(blog.id, post, credentials)
      if (result.skipped) {
        report.skipped++
        report.results.push({ slug: post.slug, status: 'skipped' })
        console.log(' overgeslagen')
      } else {
        report.created++
        report.results.push({ slug: post.slug, status: 'created', id: result.article.id })
        console.log(' aangemaakt')
      }
    } catch (error) {
      report.errors.push({ slug: post.slug, error: error.message })
      report.results.push({ slug: post.slug, status: 'error', error: error.message })
      console.log(` fout: ${error.message}`)
    }

    await delay(300)
  }

  report.finishedAt = new Date().toISOString()
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2))

  console.log(`\nKlaar. Aangemaakt: ${report.created}, overgeslagen: ${report.skipped}, fouten: ${report.errors.length}`)
  console.log(`Rapport: ${REPORT}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
