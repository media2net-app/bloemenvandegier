import Hero from '@/components/homepage/Hero'
import FeaturedProducts from '@/components/homepage/FeaturedProducts'
import CategoryGrid from '@/components/homepage/CategoryGrid'
import FeaturedBoeketten from '@/components/homepage/FeaturedBoeketten'
import RozenSection from '@/components/homepage/RozenSection'
import USP from '@/components/homepage/USP'

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <CategoryGrid />
      <FeaturedBoeketten />
      <RozenSection />
      <USP />
    </>
  )
}
