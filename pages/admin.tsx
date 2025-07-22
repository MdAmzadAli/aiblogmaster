import Head from 'next/head'
import dynamic from 'next/dynamic'

// Dynamically import the admin component to avoid SSR issues with React Query
const AdminApp = dynamic(() => import('../client/src/pages/admin'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading Admin Dashboard...</p>
      </div>
    </div>
  )
})

export default function AdminPage() {
  return (
    <>
      <Head>
        <title>Admin Dashboard - AI Blog Platform</title>
        <meta name="description" content="Manage your AI blog platform - create posts, configure automation, and analyze performance." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AdminApp />
    </>
  )
}