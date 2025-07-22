import Head from 'next/head'
import Link from 'next/link'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Search, Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>Page Not Found - AI Blog Platform</title>
        <meta name="description" content="The page you're looking for doesn't exist. Browse our AI blog articles instead." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navigation />
        
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="mb-8">
            <div className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">
              404
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Page Not Found
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="space-y-4 mb-8">
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
              
              <Button variant="ghost" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>
              Looking for something specific? Try searching our{' '}
              <Link href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline">
                blog articles
              </Link>{' '}
              or visit our{' '}
              <Link href="/admin" className="text-blue-600 dark:text-blue-400 hover:underline">
                admin dashboard
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  )
}