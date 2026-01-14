import { Metadata } from 'next'
import BusinessServices from '@/components/business/BusinessServices'
import BusinessSubscription from '@/components/business/BusinessSubscription'
import BusinessContact from '@/components/business/BusinessContact'

export const metadata: Metadata = {
  title: 'Zakelijke Bloemendiensten - Bloemen van De Gier',
  description: 'Professionele bloemendiensten voor bedrijven. Van kantoorplanten tot evenementen, wij verzorgen het voor u.',
}

export default function ZakelijkPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-primary-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Zakelijke Bloemendiensten
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Professionele bloemendiensten voor uw bedrijf. Van kantoorplanten tot evenementen, wij verzorgen het voor u.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary-200 rounded-full" />
                <span>Gratis advies</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary-200 rounded-full" />
                <span>Flexibele contracten</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary-200 rounded-full" />
                <span>Landelijke dekking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Business Services */}
        <BusinessServices />

        {/* Business Subscription */}
        <BusinessSubscription />

        {/* Contact Form */}
        <BusinessContact />
      </div>
    </div>
  )
}
