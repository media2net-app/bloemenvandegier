'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

export default function Hero() {
  const { t } = useI18n()
  
  return (
    <section 
      className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(/hero.jpg)',
      }}
    >
      {/* Groene gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/50 to-primary-500/10" />
      
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-lg">
            {t('homepage.hero.title')}{' '}
            <span className="text-primary-200">{t('homepage.hero.titleHighlight')}</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white mb-8 leading-relaxed drop-shadow-md">
            {t('homepage.hero.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/boeketten">
              <Button size="lg" className="group w-full sm:w-auto">
                {t('homepage.hero.ctaViewBouquets')}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/rozen">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white/10 hover:border-white">
                {t('homepage.hero.ctaDiscoverRoses')}
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-white drop-shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">9.1</span>
              <span>{t('homepage.hero.rating')}</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-white/60 rounded-full" />
            <div>{t('homepage.hero.guarantee')}</div>
            <div className="hidden sm:block w-1 h-1 bg-white/60 rounded-full" />
            <div>{t('homepage.hero.delivery')}</div>
          </div>
        </div>
      </div>

    </section>
  )
}
