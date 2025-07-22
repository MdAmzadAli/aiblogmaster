import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { SEOHead } from '../../components/seo/seo-head';
import { Post, PostAnalytics } from '@shared/schema';
import PostPage from '@/pages/post';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface PostPageProps {
  post: Post;
  analytics: PostAnalytics | null;
  relatedPosts: Post[];
}

interface PostSlugQuery extends ParsedUrlQuery {
  slug: string;
}

export default function PostSlugPage({ post, analytics, relatedPosts }: PostPageProps) {
  const router = useRouter();
  
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  // Extract first paragraph for description
  const getExcerpt = (content: string) => {
    const firstParagraph = content.split('\n')[0];
    return firstParagraph.replace(/[#*]/g, '').trim().substring(0, 160);
  };

  return (
    <>
      <SEOHead
        title={`${post.title} | AI Blog Platform`}
        description={post.metaDescription || getExcerpt(post.content)}
        keywords={post.keywords || ["AI blog", "technology", "automation"]}
        image={post.featuredImage || "/og-image.jpg"}
        article={{
          publishedTime: post.publishedAt || post.createdAt,
          modifiedTime: post.updatedAt,
          author: "AI Blog Platform",
          section: post.category,
          tags: post.keywords || []
        }}
      />
      <PostPage />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : process.env.NEXT_PUBLIC_API_URL || '';
    
    const response = await fetch(`${baseUrl}/api/posts/published`);
    const posts = response.ok ? await response.json() : [];

    const paths = posts.map((post: Post) => ({
      params: { slug: post.slug },
    }));

    return {
      paths,
      fallback: 'blocking', // Enable ISR for new posts
    };
  } catch (error) {
    console.error('Error generating static paths:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};

export const getStaticProps: GetStaticProps<PostPageProps, PostSlugQuery> = async ({ params }) => {
  if (!params?.slug) {
    return {
      notFound: true,
    };
  }

  try {
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : process.env.NEXT_PUBLIC_API_URL || '';

    const [postResponse, analyticsResponse] = await Promise.all([
      fetch(`${baseUrl}/api/posts/by-slug/${params.slug}`),
      fetch(`${baseUrl}/api/posts/${params.slug}/analytics`)
    ]);

    if (!postResponse.ok) {
      return {
        notFound: true,
      };
    }

    const post = await postResponse.json();
    const analytics = analyticsResponse.ok ? await analyticsResponse.json() : null;

    // Fetch related posts based on category
    const relatedResponse = await fetch(`${baseUrl}/api/posts/related/${post.id}?category=${post.category}&limit=3`);
    const relatedPosts = relatedResponse.ok ? await relatedResponse.json() : [];

    return {
      props: {
        post,
        analytics,
        relatedPosts,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return {
      notFound: true,
    };
  }
};