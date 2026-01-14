import type { Metadata } from 'next'
import { CheckCircle, ArrowRight, Zap, Shield, TrendingUp, Clock, Users, Code } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Offerte - WooCommerce Migratie naar Maatwerk Webshop',
  description: 'Professionele migratie van WooCommerce naar een maatwerk webshop. Kies uit eenmalige betaling of maandelijks percentage van omzet.',
}

const features = [
  {
    icon: Zap,
    title: 'Snelle migratie',
    description: 'Vloeiende overgang zonder downtime voor je webshop',
  },
  {
    icon: Shield,
    title: 'Data veiligheid',
    description: 'Alle producten, klanten en bestellingen veilig overgezet',
  },
  {
    icon: TrendingUp,
    title: 'Betere prestaties',
    description: 'Snellere laadtijden en betere gebruikerservaring',
  },
  {
    icon: Code,
    title: 'Maatwerk oplossing',
    description: 'Volledig op maat gemaakt voor jouw specifieke behoeften',
  },
  {
    icon: Users,
    title: 'Ondersteuning',
    description: 'Volledige ondersteuning tijdens en na de migratie',
  },
  {
    icon: Clock,
    title: 'Snelle implementatie',
    description: 'Migratie binnen 4-6 weken afgerond',
  },
]

const includedServices = [
  'Volledige migratie van alle producten en data',
  'Overzetten van klantgegevens en bestelgeschiedenis',
  'Integratie van betalingssystemen',
  'SEO-optimalisatie en behoud van rankings',
  'Responsive design voor alle apparaten',
  'Admin dashboard voor beheer',
  'Training voor je team',
  '3 maanden technische ondersteuning',
  'Huidige functionaliteiten behouden',
  'Nieuwe features en verbeteringen',
]

export default function OffertePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              WooCommerce Migratie naar Maatwerk Webshop
            </h1>
            <p className="text-xl text-primary-100 mb-8 leading-relaxed">
              Maak de overstap van WooCommerce naar een volledig maatwerk webshop, 
              speciaal ontworpen voor jouw bloemenwinkel. Sneller, moderner en volledig op maat.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
                <feature.icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Pricing Options */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              Kies je pakket
            </h2>
            <p className="text-lg text-gray-600">
              Twee flexibele opties voor jouw migratie
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Option 1: One-time payment */}
            <Card className="p-8 border-2 border-gray-200 hover:border-primary-500 transition-colors">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Optie 1</h3>
                <p className="text-gray-600 mb-4">Eenmalige investering</p>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-primary-600">€15.000</span>
                  <span className="text-gray-600 ml-2">eenmalig</span>
                </div>
                <p className="text-sm text-gray-600">
                  Excl. BTW • 50% vooraf en 50% bij oplevering (live zetten)
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {includedServices.map((service, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{service}</span>
                  </div>
                ))}
              </div>

              <Button className="w-full" size="lg" asChild>
                <Link href="/contact">
                  Vraag offerte aan
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </Card>

            {/* Option 2: Monthly percentage */}
            <Card className="p-8 border-2 border-primary-500 relative">
              <div className="absolute top-4 right-4 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Populair
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Optie 2</h3>
                <p className="text-gray-600 mb-4">Flexibel maandelijks</p>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-primary-600">2%</span>
                  <span className="text-gray-600 ml-2">van omzet</span>
                </div>
                <p className="text-sm text-gray-600">
                  Per maand • Minimaal €500/maand
                </p>
              </div>

              <div className="bg-primary-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Voorbeeld:</strong>
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• €25.000 omzet/maand = €500/maand</li>
                  <li>• €50.000 omzet/maand = €1.000/maand</li>
                  <li>• €100.000 omzet/maand = €2.000/maand</li>
                </ul>
              </div>

              <div className="space-y-3 mb-8">
                {includedServices.map((service, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{service}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3 pt-2 border-t border-gray-200">
                  <CheckCircle className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 font-semibold">
                    Continue updates en ondersteuning
                  </span>
                </div>
              </div>

              <Button className="w-full" size="lg" asChild>
                <Link href="/contact">
                  Vraag offerte aan
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </Card>
          </div>

          {/* Comparison */}
          <Card className="p-8 mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Vergelijking
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900">Optie 1</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900">Optie 2</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4 text-gray-700">Migratie</td>
                    <td className="py-4 px-4 text-center">
                      <CheckCircle className="h-5 w-5 text-primary-600 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <CheckCircle className="h-5 w-5 text-primary-600 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4 text-gray-700">Alle features</td>
                    <td className="py-4 px-4 text-center">
                      <CheckCircle className="h-5 w-5 text-primary-600 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <CheckCircle className="h-5 w-5 text-primary-600 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4 text-gray-700">3 maanden support</td>
                    <td className="py-4 px-4 text-center">
                      <CheckCircle className="h-5 w-5 text-primary-600 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <CheckCircle className="h-5 w-5 text-primary-600 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4 text-gray-700">Continue updates</td>
                    <td className="py-4 px-4 text-center text-gray-400">—</td>
                    <td className="py-4 px-4 text-center">
                      <CheckCircle className="h-5 w-5 text-primary-600 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4 text-gray-700">Ongoing support</td>
                    <td className="py-4 px-4 text-center text-gray-400">—</td>
                    <td className="py-4 px-4 text-center">
                      <CheckCircle className="h-5 w-5 text-primary-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-gray-700 font-semibold">Betaling</td>
                    <td className="py-4 px-4 text-center text-gray-700">Eenmalig</td>
                    <td className="py-4 px-4 text-center text-gray-700">Maandelijks</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* CTA Section */}
          <Card className="p-8 bg-gradient-to-br from-primary-500 to-primary-600 text-white text-center">
            <h3 className="text-3xl font-serif font-bold mb-4">
              Klaar om te migreren?
            </h3>
            <p className="text-lg text-primary-100 mb-6 max-w-2xl mx-auto">
              Neem contact met ons op voor een persoonlijk gesprek en een gedetailleerde offerte 
              op maat voor jouw webshop.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                size="lg"
                className="bg-white text-primary-600 hover:bg-primary-50 border-white"
                asChild
              >
                <Link href="/contact">
                  Neem contact op
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                className="bg-white text-primary-600 hover:bg-primary-50"
                asChild
              >
                <Link href="tel:+31612345678">
                  Bel direct: 06 12 34 56 78
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
