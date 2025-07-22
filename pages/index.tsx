import { GetStaticProps } from 'next';
import { SEOHead } from '../components/seo/seo-head';
import { useAuth } from '@/hooks/useAuth';
import Home from '@/pages/home';
import Landing from '@/pages/landing';
import { Post } from '@shared/schema';

interface IndexPageProps {
  featuredPosts: Post[];
  totalPosts: number;
}

export default function IndexPage({ featuredPosts, totalPosts }: IndexPageProps) {
  const { isAuthenticated } = useAuth();
  
  return (
    <>
      <SEOHead
        title="AI Blog Platform - Automated Content Creation & SEO Optimization"
        description="Revolutionary AI-powered blog platform featuring automated content generation, comprehensive analytics, and SEO optimization tools. Create high-quality blog posts effortlessly with our advanced AI technology."
        keywords={["AI blogging", "automated content generation", "SEO optimization", "blog platform", "content creation", "artificial intelligence", "blog management"]}
      />
      {isAuthenticated ? <Home /> : <Landing />}
    </>
  );
}

export const getStaticProps: GetStaticProps<IndexPageProps> = async () => {
  try {
    // In development, API calls need to use full URL
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : process.env.NEXT_PUBLIC_API_URL || '';
    
    const [featuredResponse, totalResponse] = await Promise.all([
      fetch(`${baseUrl}/api/posts/featured`),
      fetch(`${baseUrl}/api/posts/count`)
    ]);

    const featuredPosts = featuredResponse.ok ? await featuredResponse.json() : [];
    const totalData = totalResponse.ok ? await totalResponse.json() : { count: 0 };

    return {
      props: {
        featuredPosts,
        totalPosts: totalData.count,
      },
      revalidate: 60, // Revalidate every minute for fresh content
    };
  } catch (error) {
    console.error('Error fetching static props:', error);
    return {
      props: {
        featuredPosts: [],
        totalPosts: 0,
      },
      revalidate: 60,
    };
  }
};