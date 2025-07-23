import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <div className="hero-gradient text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 animate-fade-in-up leading-tight">
            AI-Powered Blog Platform
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl lg:max-w-3xl mx-auto animate-fade-in-up px-4" style={{ animationDelay: '0.2s' }}>
            Discover insights powered by artificial intelligence. Our AI creates SEO-optimized content automatically, delivering fresh perspectives weekly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 animate-fade-in-up px-4" style={{ animationDelay: '0.4s' }}>
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 transition-colors shadow-lg w-full sm:w-auto text-sm sm:text-base"
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
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-colors w-full sm:w-auto text-sm sm:text-base"
            >
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
