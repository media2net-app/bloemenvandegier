import { redirect } from 'next/navigation'
import Hero from '@/components/homepage/Hero'
import FeaturedProducts from '@/components/homepage/FeaturedProducts'
import CategoryGrid from '@/components/homepage/CategoryGrid'
import FeaturedBoeketten from '@/components/homepage/FeaturedBoeketten'
import ThursdayDeal from '@/components/homepage/ThursdayDeal'
import RozenSection from '@/components/homepage/RozenSection'
import USP from '@/components/homepage/USP'
import OccasionSelector from '@/components/homepage/OccasionSelector'
import DeliveryCalculator from '@/components/homepage/DeliveryCalculator'
import { getProductBySlug } from '@/lib/data/products'

const migrationGate =
  process.env.MIGRATION_GATE === 'true' || process.env.NODE_ENV === 'development'

function ShopHomePage() {
  const dealProduct = getProductBySlug('plukboeket-xl')

  return (
    <>
      <Hero />
      <OccasionSelector />
      <DeliveryCalculator />
      <FeaturedProducts />
      <CategoryGrid />
      <ThursdayDeal product={dealProduct || null} />
      <FeaturedBoeketten />
      <RozenSection />
      <USP />
    </>
  )
}

export default function HomePage() {
  if (migrationGate) {
    redirect('/login')
  }

  return <ShopHomePage />
}
