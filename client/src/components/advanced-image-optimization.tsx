import { useState, useRef, useEffect } from 'react';

interface AdvancedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  loading?: 'lazy' | 'eager';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  webpFallback?: boolean;
  avifSupport?: boolean;
}

export function AdvancedImage({
  src,
  alt,
  width,
  height,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  loading = 'lazy',
  objectFit = 'cover',
  webpFallback = true,
  avifSupport = true
}: AdvancedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate optimized image URLs (simulating Next.js image optimization)
  const generateOptimizedSrc = (baseSrc: string, width?: number, format?: string) => {
    if (baseSrc.includes('unsplash.com') || baseSrc.includes('pixabay.com')) {
      const params = new URLSearchParams();
      if (width) params.set('w', width.toString());
      if (quality !== 75) params.set('q', quality.toString());
      if (format) params.set('fm', format);
      
      return `${baseSrc}${baseSrc.includes('?') ? '&' : '?'}${params.toString()}`;
    }
    return baseSrc;
  };

  // Generate srcSet for responsive images
  const generateSrcSet = () => {
    if (!width) return '';
    
    const formats = [];
    if (avifSupport) formats.push('avif');
    if (webpFallback) formats.push('webp');
    formats.push('jpg');

    const widths = [width / 2, width, width * 1.5, width * 2].filter(w => w > 0);
    
    return widths.map(w => 
      `${generateOptimizedSrc(src, Math.round(w))} ${Math.round(w)}w`
    ).join(', ');
  };

  // Detect format support
  const detectFormatSupport = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    // Test AVIF support
    if (avifSupport) {
      try {
        const avifDataURL = canvas.toDataURL('image/avif');
        if (avifDataURL.startsWith('data:image/avif')) {
          setCurrentSrc(generateOptimizedSrc(src, width, 'avif'));
          return;
        }
      } catch (e) {
        // AVIF not supported
      }
    }

    // Test WebP support
    if (webpFallback) {
      try {
        const webpDataURL = canvas.toDataURL('image/webp');
        if (webpDataURL.startsWith('data:image/webp')) {
          setCurrentSrc(generateOptimizedSrc(src, width, 'webp'));
          return;
        }
      } catch (e) {
        // WebP not supported
      }
    }

    // Fallback to original format
    setCurrentSrc(generateOptimizedSrc(src, width));
  };

  useEffect(() => {
    if (webpFallback || avifSupport) {
      detectFormatSupport();
    }
  }, [src, width, webpFallback, avifSupport]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!priority && loading === 'lazy' && imgRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
              }
            }
          });
        },
        { rootMargin: '50px' }
      );

      observer.observe(imgRef.current);
      return () => observer.disconnect();
    }
  }, [priority, loading]);

  const handleLoad = () => {
    setIsLoaded(true);
    // Track image load performance
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'image_loaded', {
        event_category: 'performance',
        event_label: alt,
        value: performance.now()
      });
    }
  };

  const handleError = () => {
    setHasError(true);
    console.warn(`Failed to load image: ${alt}`);
  };

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 dark:bg-gray-800 flex items-center justify-center ${className}`}
        style={{ 
          width: width ? `${width}px` : 'auto', 
          height: height ? `${height}px` : 'auto',
          aspectRatio: width && height ? `${width}/${height}` : 'auto'
        }}
      >
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder while loading */}
      {!isLoaded && placeholder === 'blur' && (
        <div className="absolute inset-0">
          {blurDataURL ? (
            <img
              src={blurDataURL}
              alt=""
              className="w-full h-full object-cover filter blur-sm scale-105"
              aria-hidden="true"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
          )}
        </div>
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={priority || loading === 'eager' ? currentSrc : undefined}
        data-src={!priority && loading === 'lazy' ? currentSrc : undefined}
        alt={alt}
        width={width}
        height={height}
        srcSet={generateSrcSet()}
        sizes={sizes}
        loading={priority ? 'eager' : loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } w-full h-full`}
        style={{
          objectFit,
          aspectRatio: width && height ? `${width}/${height}` : 'auto'
        }}
        // SEO and accessibility attributes
        decoding={priority ? 'sync' : 'async'}
        {...(priority && { fetchPriority: 'high' as const })}
      />

      {/* Loading indicator */}
      {!isLoaded && placeholder === 'empty' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}

// Image optimization utilities
export const imageOptimization = {
  // Generate blur placeholder
  generateBlurDataURL: (width: number = 10, height: number = 10) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, 'rgb(229, 231, 235)');
      gradient.addColorStop(1, 'rgb(156, 163, 175)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
    
    return canvas.toDataURL();
  },

  // Calculate responsive sizes
  generateSizes: (breakpoints: Array<{ breakpoint: number; width: string }>) => {
    return breakpoints
      .map(bp => `(max-width: ${bp.breakpoint}px) ${bp.width}`)
      .join(', ');
  },

  // Preload critical images
  preloadImage: (src: string, priority: boolean = false) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    if (priority) link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
  }
};