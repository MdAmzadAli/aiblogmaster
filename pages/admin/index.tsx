import { GetServerSideProps } from 'next';
import { SEOHead } from '../../components/seo/seo-head';
import AdminLayout from '@/pages/admin';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function AdminPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <SEOHead
        title="Admin Dashboard | AI Blog Platform"
        description="Manage your AI-powered blog with comprehensive analytics, content automation, and SEO optimization tools."
        noIndex={true} // Don't index admin pages
      />
      <AdminLayout />
    </>
  );
}

// Protect admin routes with server-side authentication check
export const getServerSideProps: GetServerSideProps = async (context) => {
  // You can add server-side auth validation here if needed
  // For now, we'll handle it client-side with useAuth
  return {
    props: {},
  };
};