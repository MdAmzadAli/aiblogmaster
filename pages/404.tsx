import { SEOHead } from '../components/seo/seo-head';
import NotFound from '@/pages/not-found';

export default function Custom404() {
  return (
    <>
      <SEOHead
        title="404 - Page Not Found | AI Blog Platform"
        description="The page you're looking for doesn't exist. Explore our AI blog platform for automated content generation and SEO optimization tools."
        noIndex={true}
      />
      <NotFound />
    </>
  );
}