import Head from 'next/head'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Page Not Found - AI Blog Platform</title>
        <meta name="description" content="The page you're looking for doesn't exist. Browse our AI-generated articles and tutorials instead." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/404`} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto text-center px-4">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Sorry, the page you're looking for doesn't exist or has been moved. 
              Let's get you back on track with our AI-powered content.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/blog">
                <Search className="w-4 h-4 mr-2" />
                Browse Articles
              </Link>
            </Button>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Popular Categories:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link 
                href="/category/ai"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full transition-colors"
              >
                AI
              </Link>
              <Link 
                href="/category/tutorials"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full transition-colors"
              >
                Tutorials
              </Link>
              <Link 
                href="/category/tech"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full transition-colors"
              >
                Technology
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}