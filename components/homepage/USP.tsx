import { CheckCircle, Flower, Users, Shield } from 'lucide-react'

const usps = [
  {
    icon: Flower,
    title: 'Meer bloemen voor je geld',
    description: 'Omdat we niet aangesloten zitten in een netwerk met andere bloemisten maar alleen onze eigen boeketten verkopen en versturen, staan we geen commissie af over de boeketten.',
  },
  {
    icon: Shield,
    title: '7 dagen versgarantie',
    description: 'Elke betaalde cent zit in het boeket wat je bestelt en ben jij door heel Nederland verzekerd van de kwaliteit die je van ons gewend bent.',
  },
  {
    icon: Users,
    title: 'Ervaren bloembinders',
    description: 'De bloembinders van De Gier Bloemen weten als de beste hoe je met al deze verse bloemen, de mooiste creaties maakt. Met passie voor het vak.',
  },
  {
    icon: CheckCircle,
    title: 'Kwaliteit & Ervaring',
    description: 'Inkopers met kennis en gevoel voor bloemen en altijd hoge kwaliteitseisen. Elke dag de meest verse bloemen beschikbaar.',
  },
]

export default function USP() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
            Kwaliteit | Ervaring | Zekerheid
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Gegarandeerd meer bloemen voor je geld
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {usps.map((usp, index) => {
            const Icon = usp.icon
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {usp.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {usp.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
