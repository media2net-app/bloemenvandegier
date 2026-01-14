import { Metadata } from 'next'
import SubscriptionWizard from '@/components/subscription/SubscriptionWizard'

export const metadata: Metadata = {
  title: 'Bloemenabonnement - Wekelijkse verse bloemen',
  description: 'Kies je favoriete bloemenabonnement en ontvang wekelijks verse bloemen thuisbezorgd. Kies de grootte en het type boeket dat bij jou past.',
}

export default function AbonnementenPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Bloemenabonnement
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ontvang wekelijks verse bloemen thuisbezorgd. Kies de grootte en het type boeket dat perfect bij jou past.
          </p>
        </div>

        {/* Subscription Wizard */}
        <SubscriptionWizard />
      </div>
    </div>
  )
}
