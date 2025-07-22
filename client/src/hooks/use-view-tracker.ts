import { useEffect } from 'react';

export function useViewTracker(postId: number, slug: string) {
  useEffect(() => {
    // Track page view
    const trackView = async () => {
      try {
        await fetch(`/api/posts/${slug}/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postId }),
        });
      } catch (error) {
        console.error('Failed to track view:', error);
      }
    };

    // Track view after a short delay to avoid bots
    const timer = setTimeout(trackView, 2000);

    return () => clearTimeout(timer);
  }, [postId, slug]);
}