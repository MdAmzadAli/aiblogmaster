import { useEffect } from 'react';

interface FontOptimizationProps {
  fonts?: Array<{
    family: string;
    weights: string[];
    display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  }>;
}

export function FontOptimization({ fonts = [] }: FontOptimizationProps) {
  useEffect(() => {
    // Preload critical fonts
    const defaultFonts = [
      {
        family: 'Inter',
        weights: ['400', '500', '600', '700'],
        display: 'swap' as const
      },
      ...fonts
    ];

    defaultFonts.forEach(font => {
      font.weights.forEach(weight => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        link.href = `https://fonts.gstatic.com/s/${font.family.toLowerCase()}/v29/${font.family.toLowerCase()}-${weight}.woff2`;
        
        document.head.appendChild(link);
      });

      // Add font face CSS
      const style = document.createElement('style');
      style.textContent = font.weights.map(weight => `
        @font-face {
          font-family: '${font.family}';
          font-style: normal;
          font-weight: ${weight};
          font-display: ${font.display};
          src: url('https://fonts.gstatic.com/s/${font.family.toLowerCase()}/v29/${font.family.toLowerCase()}-${weight}.woff2') format('woff2');
        }
      `).join('');
      
      document.head.appendChild(style);
    });
  }, [fonts]);

  return null; // This component doesn't render anything
}

// CSS Variables for font optimization
export const fontOptimizationCSS = `
  :root {
    --font-inter: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-mono: 'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
  }

  /* Font loading optimization */
  @media (prefers-reduced-motion: no-preference) {
    * {
      font-variation-settings: 'wght' 400;
    }
  }

  /* Prevent layout shift during font loading */
  body {
    font-family: var(--font-inter);
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Critical font loading fallbacks */
  .font-loading {
    font-family: system-ui, -apple-system, sans-serif;
  }

  .font-loaded {
    font-family: var(--font-inter);
  }
`;