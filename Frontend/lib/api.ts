// API Configuration and Client
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1'
const API_URL = `${API_BASE_URL}/api/${API_VERSION}`

// Types for API responses
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }

  get errorCode(): string {
    return this.response?.error?.code || 'UNKNOWN_ERROR'
  }

  get isValidationError(): boolean {
    return this.status === 422 || this.errorCode === 'VALIDATION_ERROR'
  }

  get isUnauthorized(): boolean {
    return this.status === 401 || this.errorCode === 'UNAUTHORIZED'
  }

  get isForbidden(): boolean {
    return this.status === 403 || this.errorCode === 'FORBIDDEN'
  }

  get isNotFound(): boolean {
    return this.status === 404 || this.errorCode === 'NOT_FOUND'
  }

  get isConflict(): boolean {
    return this.status === 409 || this.errorCode === 'CONFLICT'
  }

  get validationErrors(): any[] {
    // Handle FastAPI validation errors
    if (this.status === 422 && this.response?.detail) {
      if (Array.isArray(this.response.detail)) {
        return this.response.detail
      }
    }
    // Handle custom validation error format
    if (this.status === 422 && this.response?.error?.details) {
      if (Array.isArray(this.response.error.details)) {
        return this.response.error.details
      }
    }
    return this.response?.error?.details || []
  }
}

// HTTP Client
class ApiClient {
  private baseURL: string
  private defaultHeaders: HeadersInit

  constructor() {
    this.baseURL = API_URL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const token = this.getAuthToken()

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    }

    console.log("API Request:", {
      url,
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body ? JSON.parse(config.body as string) : undefined
    })

    try {
      const response = await fetch(url, config)
      
      console.log("API Response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.log("API Error Response:", errorData)
        if (errorData.error?.details) {
          console.log("Validation Error Details:", errorData.error.details)
        }
        
        // Extract error message from structured backend response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        
        // Handle FastAPI validation errors
        if (response.status === 422 && errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Multiple validation errors
            const firstError = errorData.detail[0]
            errorMessage = firstError.msg || `Validation error: ${firstError.loc?.join('.')}`
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail
          }
        } else if (errorData.error?.details && Array.isArray(errorData.error.details)) {
          // Handle custom validation error format
          const firstError = errorData.error.details[0]
          errorMessage = firstError.message || firstError.msg || `Validation error: ${firstError.field || 'unknown field'}`
        } else if (errorData.error) {
          errorMessage = errorData.error.message || errorMessage
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.detail) {
          errorMessage = errorData.detail
        }
        
        throw new ApiError(
          errorMessage,
          response.status,
          errorData
        )
      }

      const data = await response.json()
      console.log("API Response Data:", data)
      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      )
    }
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    // Check for admin token first, then regular auth token
    return localStorage.getItem('admin_token') || localStorage.getItem('auth_token')
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request<{ access_token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: {
    name: string
    username: string
    email: string
    password: string
    phone?: string
  }) {
    console.log("API Client - Register request:", {
      url: `${this.baseURL}/auth/register`,
      data: { ...userData, password: "[HIDDEN]" }
    })
    
    return this.request<{ access_token: string; token_type: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getCurrentUser() {
    return this.request<any>('/auth/me')
  }

  // Admin auth methods
  async adminLogin(email: string, password: string) {
    return this.request<{ access_token: string; token_type: string; user: any }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  // Generic HTTP methods
  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Product methods
  async getProducts(params?: {
    category?: string
    page?: number
    limit?: number
    search?: string
    sort_by?: string
    sort_order?: 'asc' | 'desc'
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const queryString = searchParams.toString()
    return this.request<PaginatedResponse<any>>(`/products${queryString ? `?${queryString}` : ''}`)
  }

  async getProduct(id: string) {
    return this.request<any>(`/products/${id}`)
  }

  async getProductBySlug(slug: string) {
    return this.request<any>(`/products/slug/${slug}`)
  }

  async getCategories() {
    const response = await this.request<{categories: string[]}>('/products/categories')
    return response.categories
  }

  // Search methods
  async searchProducts(query: string, filters?: {
    category?: string
    min_price?: number
    max_price?: number
    tags?: string
    is_new?: boolean
    is_on_sale?: boolean
    min_rating?: number
    sort_by?: string
    sort_order?: 'asc' | 'desc'
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams({ q: query })
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    return this.request<PaginatedResponse<any>>(`/search/products?${searchParams.toString()}`)
  }

  async getSearchSuggestions(query: string, limit = 10) {
    return this.request<string[]>(`/search/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`)
  }

  // Wishlist methods
  async getWishlist() {
    return this.request<any>('/wishlist')
  }

  async addToWishlist(productId: string) {
    return this.request<{ message: string }>(`/wishlist/add/${productId}`, {
      method: 'POST',
    })
  }

  async removeFromWishlist(productId: string) {
    return this.request<{ message: string }>(`/wishlist/remove/${productId}`, {
      method: 'DELETE',
    })
  }

  // Order/Request methods
  async createOrder(orderData: {
    customer_name: string
    customer_email: string
    customer_phone?: string
    items: Array<{
      product_id: string
      quantity: number
      price: number
    }>
    shipping_address: any
    shipping_cost: number
    notes?: string
  }) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  }

  async getOrders(page = 1, limit = 20) {
    return this.request<PaginatedResponse<any>>(`/orders?page=${page}&limit=${limit}`)
  }

  async getOrder(id: string) {
    return this.request<any>(`/orders/${id}`)
  }

  // Coupon methods
  async getCoupons(status?: string, page = 1, limit = 20) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
    if (status) params.append('status', status)
    
    return this.request<PaginatedResponse<any>>(`/coupons?${params.toString()}`)
  }

  async validateCoupon(code: string, orderAmount: number) {
    return this.request<any>('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, order_amount: orderAmount }),
    })
  }

  // Review methods
  async getProductReviews(productId: string, page = 1, limit = 10, rating?: number) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
    if (rating) params.append('rating', rating.toString())
    
    return this.request<PaginatedResponse<any>>(`/reviews/product/${productId}?${params.toString()}`)
  }

  async createReview(reviewData: {
    product_id: string
    rating: number
    title?: string
    comment?: string
    images?: File[]
  }) {
    const formData = new FormData()
    formData.append('product_id', reviewData.product_id)
    formData.append('rating', reviewData.rating.toString())
    if (reviewData.title) formData.append('title', reviewData.title)
    if (reviewData.comment) formData.append('comment', reviewData.comment)
    
    if (reviewData.images) {
      reviewData.images.forEach((image) => {
        formData.append('images', image)
      })
    }

    return this.request<any>('/reviews', {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: formData,
    })
  }

  // File upload methods
  async uploadFile(file: File, type: 'product' | 'review' | 'avatar' = 'product') {
    const formData = new FormData()
    formData.append('file', file)

    const endpoint = type === 'product' ? '/upload/product-images' :
                    type === 'review' ? '/upload/review-images' :
                    '/upload/avatar'

    return this.request<any>(endpoint, {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData
      },
      body: formData,
    })
  }

  // Admin methods
  async getAdminProducts(page = 1, limit = 20) {
    return this.request<PaginatedResponse<any>>(`/admin/products?page=${page}&limit=${limit}`)
  }

  async createProduct(productData: any) {
    return this.request<any>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    })
  }

  async updateProduct(id: string, productData: any) {
    return this.request<any>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    })
  }

  async deleteProduct(id: string) {
    return this.request<{ message: string }>(`/admin/products/${id}`, {
      method: 'DELETE',
    })
  }

  async getPendingRequests(page = 1, limit = 20) {
    return this.request<{requests: any[], total: number, page: number, limit: number, total_pages: number}>(`/admin-requests?page=${page}&limit=${limit}`)
  }

  async getProductRequests(page = 1, limit = 20, status?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    if (status && status !== 'all') {
      params.append('status', status)
    }
    return this.request<any[]>(`/admin/requests?${params.toString()}`)
  }

  async updateRequestStatus(id: string, status: string, notes?: string) {
    return this.request<any>(`/admin-requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    })
  }

  // Admin Request methods
  async createAdminRequest(requestData: {
    name: string
    email: string
    date_of_birth?: Date | null
    employee_id?: string
    admin_username: string
    admin_password: string
  }) {
    return this.request<{ message: string }>('/admin-requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
  }

  async getAdminRequests(page = 1, limit = 20) {
    return this.request<{requests: any[], total: number, page: number, limit: number, total_pages: number}>(`/admin-requests?page=${page}&limit=${limit}`)
  }

  async approveAdminRequest(id: string) {
    return this.request<{ message: string }>(`/admin-requests/${id}/approve`, {
      method: 'POST',
    })
  }

  async rejectAdminRequest(id: string, reason?: string) {
    return this.request<{ message: string }>(`/admin-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  // Payment methods
  async createPaymentIntent(orderId: string) {
    return this.request<{ client_secret: string; payment_intent_id: string }>(`/payments/create-payment-intent/${orderId}`, {
      method: 'POST',
    })
  }

  async confirmPayment(orderId: string) {
    return this.request<{ message: string }>(`/payments/confirm-payment/${orderId}`, {
      method: 'POST',
    })
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient()

// Utility functions
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token)
  }
}

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
  }
}

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}
