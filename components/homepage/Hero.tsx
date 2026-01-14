import Link from 'next/link'
import Button from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
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
            Prachtige bloemen van{' '}
            <span className="text-primary-200">topkwaliteit</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white mb-8 leading-relaxed drop-shadow-md">
            Inkopers met kennis en gevoel voor bloemen en altijd hoge kwaliteitseisen. 
            Zij zorgen ervoor dat er elke dag de meest verse bloemen beschikbaar zijn 
            om vele boeketten te maken en de vazen te vullen.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/boeketten">
              <Button size="lg" className="group w-full sm:w-auto">
                Bekijk boeketten
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/rozen">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white/10 hover:border-white">
                Ontdek rozen
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-white drop-shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">9.1</span>
              <span>uit 4700+ reviews</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-white/60 rounded-full" />
            <div>7 dagen versgarantie</div>
            <div className="hidden sm:block w-1 h-1 bg-white/60 rounded-full" />
            <div>Bezorging in heel Nederland & België</div>
          </div>
        </div>
      </div>

    </section>
  )
}
