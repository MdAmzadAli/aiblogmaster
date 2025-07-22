import Head from 'next/head'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, RefreshCw } from 'lucide-react'

export default function Custom500() {
  return (
    <>
      <Head>
        <title>Server Error - AI Blog Platform</title>
        <meta name="description" content="We're experiencing technical difficulties. Please try again later or browse our AI-generated articles." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto text-center px-4">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">500</h1>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Server Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              We're experiencing some technical difficulties. Our AI systems are working to resolve the issue. 
              Please try again in a few moments.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              If the problem persists, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}