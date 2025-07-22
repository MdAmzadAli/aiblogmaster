import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
})

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  : 'http://localhost:5000'

// Default fetch function for React Query
export async function apiRequest(url: string, options: RequestInit = {}) {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
  
  const response = await fetch(fullUrl, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  // Handle empty responses
  const text = await response.text()
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch (error) {
    return text
  }
}

// Query key factory for consistent cache keys
export const queryKeys = {
  posts: {
    all: ['posts'] as const,
    lists: () => [...queryKeys.posts.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.posts.lists(), { filters }] as const,
    details: () => [...queryKeys.posts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.posts.details(), id] as const,
    featured: () => [...queryKeys.posts.all, 'featured'] as const,
    category: (category: string) => [...queryKeys.posts.all, 'category', category] as const,
  },
  admin: {
    all: ['admin'] as const,
    posts: () => [...queryKeys.admin.all, 'posts'] as const,
    analytics: () => [...queryKeys.admin.all, 'analytics'] as const,
    settings: () => [...queryKeys.admin.all, 'settings'] as const,
    automation: () => [...queryKeys.admin.all, 'automation'] as const,
  },
  categories: {
    all: ['categories'] as const,
  },
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
  },
}