import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4">404</h2>
        <p className="text-xl mb-8">Pagina niet gevonden</p>
        <Button asChild>
          <Link href="/">
            Terug naar homepage
          </Link>
        </Button>
      </div>
    </div>
  )
}
