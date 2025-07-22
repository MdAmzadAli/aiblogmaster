import { useEffect, useState } from 'react';

interface CriticalCSSProps {
  children: React.ReactNode;
}

export function CriticalCSS({ children }: CriticalCSSProps) {
  const [nonCriticalLoaded, setNonCriticalLoaded] = useState(false);

  useEffect(() => {
    // Load non-critical CSS after initial render
    const loadNonCriticalCSS = () => {
      // Create link element for non-critical styles
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/src/styles/non-critical.css';
      link.onload = () => {
        setNonCriticalLoaded(true);
        // Remove defer-load class from elements
        document.querySelectorAll('.defer-load').forEach(el => {
          el.classList.add('loaded');
        });
      };
      
      // Add to head after a small delay to prioritize critical rendering
      setTimeout(() => {
        document.head.appendChild(link);
      }, 100);
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(loadNonCriticalCSS);
    } else {
      setTimeout(loadNonCriticalCSS, 1);
    }
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Inline critical CSS */
          :root {
            --background: hsl(0, 0%, 100%);
            --foreground: hsl(20, 14.3%, 4.1%);
            --primary: hsl(207, 90%, 54%);
            --primary-foreground: hsl(211, 100%, 99%);
            --hero-gradient-from: hsl(207, 90%, 54%);
            --hero-gradient-to: hsl(272, 100%, 55%);
          }
          
          body {
            margin: 0;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            background-color: var(--background);
            color: var(--foreground);
          }
          
          .hero-gradient {
            background: linear-gradient(135deg, var(--hero-gradient-from), var(--hero-gradient-to));
          }
          
          .defer-load {
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
          }
          
          .defer-load.loaded {
            opacity: 1;
          }
        `
      }} />
      {children}
    </>
  );
}