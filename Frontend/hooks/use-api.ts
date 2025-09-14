import { useState, useEffect, useCallback } from 'react'
import { apiClient, ApiError } from '@/lib/api'
import { 
  User, 
  Product, 
  Order, 
  Wishlist, 
  Coupon, 
  Review, 
  ReviewStats,
  PaginatedResponse,
  ProductFilters,
  SearchFilters
} from '@/lib/types'

// Generic hook for API calls
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiCall()
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Auth hooks
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password)
      localStorage.setItem('auth_token', response.access_token)
      await fetchUser()
      return response
    } catch (error) {
      throw error
    }
  }

  const register = async (userData: {
    name: string
    email: string
    password: string
    phone?: string
  }) => {
    try {
      const response = await apiClient.register(userData)
      localStorage.setItem('auth_token', response.access_token)
      await fetchUser()
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setUser(null)
  }

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setLoading(false)
        return
      }
      
      const userData = await apiClient.getCurrentUser()
      setUser(userData)
    } catch (error) {
      localStorage.removeItem('auth_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    isSuperAdmin: user?.role === 'super_admin'
  }
}

// Product hooks
export function useProducts(filters?: ProductFilters & { page?: number; limit?: number }) {
  return useApi(
    () => apiClient.getProducts(filters),
    [JSON.stringify(filters)]
  )
}

export function useProduct(id: string) {
  return useApi(
    () => apiClient.getProduct(id),
    [id]
  )
}

export function useCategories() {
  return useApi(() => apiClient.getCategories())
}

// Search hooks
export function useSearch(query: string, filters?: Omit<SearchFilters, 'q'>) {
  const [results, setResults] = useState<PaginatedResponse<Product> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async () => {
    if (!query.trim()) {
      setResults(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const result = await apiClient.searchProducts(query, filters)
      setResults(result)
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Search failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [query, JSON.stringify(filters)])

  useEffect(() => {
    const timeoutId = setTimeout(search, 300) // Debounce search
    return () => clearTimeout(timeoutId)
  }, [search])

  return { results, loading, error, search }
}

export function useSearchSuggestions(query: string, limit = 10) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const fetchSuggestions = useCallback(async () => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      return
    }

    try {
      setLoading(true)
      const result = await apiClient.getSearchSuggestions(query, limit)
      setSuggestions(result)
    } catch (error) {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [query, limit])

  useEffect(() => {
    const timeoutId = setTimeout(fetchSuggestions, 200)
    return () => clearTimeout(timeoutId)
  }, [fetchSuggestions])

  return { suggestions, loading }
}

// Wishlist hooks
export function useWishlist() {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiClient.getWishlist()
      setWishlist(result)
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch wishlist'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const addToWishlist = async (productId: string) => {
    try {
      await apiClient.addToWishlist(productId)
      await fetchWishlist()
    } catch (error) {
      throw error
    }
  }

  const removeFromWishlist = async (productId: string) => {
    try {
      await apiClient.removeFromWishlist(productId)
      await fetchWishlist()
    } catch (error) {
      throw error
    }
  }

  const isInWishlist = (productId: string) => {
    return wishlist?.items.some(item => item.product_id === productId) || false
  }

  useEffect(() => {
    fetchWishlist()
  }, [])

  return {
    wishlist,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refetch: fetchWishlist
  }
}

// Order hooks
export function useOrders(page = 1, limit = 20) {
  return useApi(
    () => apiClient.getOrders(page, limit),
    [page, limit]
  )
}

export function useOrder(id: string) {
  return useApi(
    () => apiClient.getOrder(id),
    [id]
  )
}

// Coupon hooks
export function useCoupons(status?: string, page = 1, limit = 20) {
  return useApi(
    () => apiClient.getCoupons(status, page, limit),
    [status, page, limit]
  )
}

export function useCouponValidation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateCoupon = async (code: string, orderAmount: number) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiClient.validateCoupon(code, orderAmount)
      return result
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Coupon validation failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { validateCoupon, loading, error }
}

// Review hooks
export function useProductReviews(productId: string, page = 1, limit = 10, rating?: number) {
  return useApi(
    () => apiClient.getProductReviews(productId, page, limit, rating),
    [productId, page, limit, rating]
  )
}

export function useReviewCreation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createReview = async (reviewData: {
    product_id: string
    rating: number
    title?: string
    comment?: string
    images?: File[]
  }) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiClient.createReview(reviewData)
      return result
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to create review'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createReview, loading, error }
}

// Admin hooks
export function useAdminProducts(page = 1, limit = 20) {
  return useApi(
    () => apiClient.getAdminProducts(page, limit),
    [page, limit]
  )
}

export function useAdminRequests(page = 1, limit = 20) {
  return useApi(
    () => apiClient.getPendingRequests(page, limit),
    [page, limit]
  )
}

// File upload hook
export function useFileUpload() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = async (file: File, type: 'product' | 'review' | 'avatar' = 'product') => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiClient.uploadFile(file, type)
      return result
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'File upload failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { uploadFile, loading, error }
}
