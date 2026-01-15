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

export default function HomePage() {
  // Get plukboeket XL product for Thursday deal
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
