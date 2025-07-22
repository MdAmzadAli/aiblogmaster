import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <div className="hero-gradient text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in-up">
            AI-Powered Blog Platform - Automated SEO Content Generation
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Discover insights powered by artificial intelligence. Our AI creates SEO-optimized content automatically, delivering fresh perspectives weekly.
          </p>
          <div className="flex justify-center space-x-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 transition-colors shadow-lg"
              onClick={() => {
                const postsSection = document.querySelector('#latest-posts');
                if (postsSection) {
                  postsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Latest Posts
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-colors"
            >
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
