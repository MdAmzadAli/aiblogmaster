import { SEOHead } from '../components/seo/seo-head';
import Link from 'next/link';

export default function Custom500() {
  return (
    <>
      <SEOHead
        title="500 - Server Error | AI Blog Platform"
        description="Something went wrong on our end. Please try again later."
        noIndex={true}
      />
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-800">500</h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
            Internal Server Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-md">
            Something went wrong on our end. We're working to fix it. Please try again later.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </>
  );
}