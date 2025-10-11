import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white">
      <h1 className="text-4xl font-bold mb-4">404—Page Not Found</h1>
      <p className="text-lg mb-8">Sorry, the page you are looking for does not exist.</p>
      <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
        Return to home
      </Link>
    </div>
  )
}
