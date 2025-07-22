import { GetStaticProps } from 'next';
import { SEOHead } from '../components/seo/seo-head';
import { Post } from '@shared/schema';
import PostsList from '@/pages/posts-list';
import { useState } from 'react';

interface BlogPageProps {
  posts: Post[];
  totalPages: number;
  categories: string[];
}

export default function BlogPage({ posts: initialPosts, totalPages, categories }: BlogPageProps) {
  return (
    <>
      <SEOHead
        title="Blog | AI Blog Platform - Latest AI & Technology Insights"
        description="Discover the latest insights on artificial intelligence, automation, technology trends, and digital transformation. Expert articles generated with advanced AI technology."
        keywords={["AI blog", "technology insights", "automation", "artificial intelligence", "tech trends", "digital transformation", "AI articles"]}
        canonical="/blog"
      />
      <PostsList />
    </>
  );
}

export const getStaticProps: GetStaticProps<BlogPageProps> = async () => {
  try {
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : process.env.NEXT_PUBLIC_API_URL || '';

    const [postsResponse, categoriesResponse] = await Promise.all([
      fetch(`${baseUrl}/api/posts?status=published&page=1&limit=12`),
      fetch(`${baseUrl}/api/posts/categories`)
    ]);

    const postsData = postsResponse.ok ? await postsResponse.json() : { posts: [], totalPages: 0 };
    const categoriesData = categoriesResponse.ok ? await categoriesResponse.json() : [];

    return {
      props: {
        posts: postsData.posts || [],
        totalPages: postsData.totalPages || 0,
        categories: categoriesData.map((cat: any) => cat.category) || [],
      },
      revalidate: 300, // Revalidate every 5 minutes for fresh content
    };
  } catch (error) {
    console.error('Error fetching blog data:', error);
    return {
      props: {
        posts: [],
        totalPages: 0,
        categories: [],
      },
      revalidate: 300,
    };
  }
};