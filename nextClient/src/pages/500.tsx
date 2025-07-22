import Head from 'next/head'
import Link from 'next/link'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

export default function ServerErrorPage() {
  return (
    <>
      <Head>
        <title>Server Error - AI Blog Platform</title>
        <meta name="description" content="Something went wrong on our servers. We're working to fix it." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navigation />
        
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="mb-8">
            <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Something went wrong
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              We're experiencing some technical difficulties. Our team has been notified and is working to fix this issue.
            </p>
          </div>

          <div className="space-y-4 mb-8">
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
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>
              If this problem persists, please contact our support team or try accessing our{' '}
              <Link href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline">
                blog articles
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  )
}