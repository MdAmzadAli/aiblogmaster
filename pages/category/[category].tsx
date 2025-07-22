import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { SEOHead } from '../../components/seo/seo-head';
import { Post } from '@shared/schema';
import PostsList from '@/pages/posts-list';
import { useRouter } from 'next/router';

interface CategoryPageProps {
  posts: Post[];
  category: string;
  totalPages: number;
  currentPage: number;
}

interface CategoryQuery extends ParsedUrlQuery {
  category: string;
}

export default function CategoryPage({ posts, category, totalPages, currentPage }: CategoryPageProps) {
  const router = useRouter();
  
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <>
      <SEOHead
        title={`${formattedCategory} Articles | AI Blog Platform`}
        description={`Explore our comprehensive collection of ${formattedCategory.toLowerCase()} articles. Expert insights on AI, technology, and digital innovation.`}
        keywords={[category, "AI blog", "technology", "articles", "insights"]}
        canonical={`/category/${category}`}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {formattedCategory} Articles
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover expert insights and latest trends in {formattedCategory.toLowerCase()}
          </p>
        </div>
        <PostsList />
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : process.env.NEXT_PUBLIC_API_URL || '';

    const response = await fetch(`${baseUrl}/api/posts/categories`);
    const categories = response.ok ? await response.json() : [];

    const paths = categories.map((cat: any) => ({
      params: { category: cat.category.toLowerCase() },
    }));

    return {
      paths,
      fallback: 'blocking',
    };
  } catch (error) {
    console.error('Error generating category paths:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};

export const getStaticProps: GetStaticProps<CategoryPageProps, CategoryQuery> = async ({ params }) => {
  if (!params?.category) {
    return {
      notFound: true,
    };
  }

  try {
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : process.env.NEXT_PUBLIC_API_URL || '';

    const response = await fetch(`${baseUrl}/api/posts?category=${params.category}&status=published&page=1&limit=12`);
    
    if (!response.ok) {
      return {
        notFound: true,
      };
    }

    const data = await response.json();

    return {
      props: {
        posts: data.posts || [],
        category: params.category,
        totalPages: data.totalPages || 0,
        currentPage: 1,
      },
      revalidate: 300, // Revalidate every 5 minutes
    };
  } catch (error) {
    console.error('Error fetching category data:', error);
    return {
      notFound: true,
    };
  }
};