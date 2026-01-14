'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Er is iets misgegaan!</h2>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
        >
          Probeer opnieuw
        </button>
      </div>
    </div>
  )
}
