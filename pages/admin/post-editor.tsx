import { GetServerSideProps } from 'next';
import { SEOHead } from '../../components/seo/seo-head';
import PostEditor from '@/pages/post-editor';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

interface PostEditorPageProps {
  postId?: string;
}

export default function PostEditorPage({ postId }: PostEditorPageProps) {
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

  const pageTitle = postId ? "Edit Post | AI Blog Platform" : "Create New Post | AI Blog Platform";

  return (
    <>
      <SEOHead
        title={pageTitle}
        description="Create and edit blog posts with AI assistance, SEO optimization, and real-time preview."
        noIndex={true} // Don't index editor pages
      />
      <PostEditor />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  
  return {
    props: {
      postId: id ? String(id) : null,
    },
  };
};