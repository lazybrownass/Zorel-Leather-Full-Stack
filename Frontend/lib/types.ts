// API Response Types
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'customer'
  phone?: string
  addresses: Address[]
  is_active: boolean
  created_at: string
}

export interface Address {
  street: string
  city: string
  state: string
  zip_code: string
  country: string
  is_default: boolean
}

export interface Product {
  id: string
  name: string
  description: string
  category: string
  subcategory?: string
  price?: number
  compare_price?: number
  cost_price?: number
  sku: string
  slug: string
  images: string[]
  tags: string[]
  specifications: Record<string, any>
  dimensions: {
    length?: number
    width?: number
    height?: number
    weight?: number
  }
  materials: string[]
  care_instructions: string[]
  status: 'active' | 'inactive' | 'draft'
  is_featured: boolean
  is_new: boolean
  is_on_sale: boolean
  stock_quantity: number
  low_stock_threshold: number
  rating: number
  review_count: number
  created_at: string
  updated_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  sku: string
  price?: number
  compare_price?: number
  stock_quantity: number
  attributes: Record<string, any>
  images: string[]
  is_default: boolean
  created_at: string
}

export interface WishlistItem {
  id: string
  product_id: string
  product: Product
  added_at: string
}

export interface Wishlist {
  id: string
  user_id: string
  items: WishlistItem[]
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  product_id: string
  product: Product
  quantity: number
  price: number
  notes?: string
}

export interface Order {
  id: string
  user_id: string
  order_number: string
  items: OrderItem[]
  subtotal: number
  tax_amount: number
  shipping_amount: number
  discount_amount: number
  total_amount: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  shipping_address: Address
  billing_address?: Address
  notes?: string
  tracking_number?: string
  estimated_delivery?: string
  created_at: string
  updated_at: string
}

export interface Coupon {
  id: string
  code: string
  name: string
  description: string
  type: 'percentage' | 'fixed_amount' | 'free_shipping'
  value: number
  minimum_order_amount?: number
  maximum_discount?: number
  usage_limit?: number
  used_count: number
  status: 'active' | 'inactive' | 'expired'
  valid_from: string
  valid_until?: string
  applicable_categories?: string[]
  applicable_products?: string[]
  created_at: string
}

export interface Review {
  id: string
  user_id: string
  product_id: string
  rating: number
  title?: string
  comment?: string
  images: string[]
  is_verified_purchase: boolean
  is_approved: boolean
  helpful_count: number
  created_at: string
}

export interface ReviewWithUser extends Review {
  user_name: string
  user_avatar?: string
}

export interface ReviewStats {
  average_rating: number
  total_reviews: number
  rating_distribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

export interface Notification {
  id: string
  user_id: string
  type: 'order_update' | 'product_available' | 'price_drop' | 'general'
  title: string
  message: string
  data?: Record<string, any>
  is_read: boolean
  created_at: string
}

export interface Page {
  id: string
  title: string
  slug: string
  content: string
  meta_title?: string
  meta_description?: string
  is_published: boolean
  created_at: string
  updated_at: string
}

// Form Types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  phone?: string
}

export interface ProductForm {
  name: string
  description: string
  category: string
  subcategory?: string
  price?: number
  compare_price?: number
  sku: string
  slug: string
  images: string[]
  tags: string[]
  specifications: Record<string, any>
  dimensions: {
    length?: number
    width?: number
    height?: number
    weight?: number
  }
  materials: string[]
  care_instructions: string[]
  status: 'active' | 'inactive' | 'draft'
  is_featured: boolean
  is_new: boolean
  is_on_sale: boolean
  stock_quantity: number
  low_stock_threshold: number
}

export interface OrderForm {
  items: Array<{
    product_id: string
    quantity: number
    notes?: string
  }>
  shipping_address: Address
  billing_address?: Address
  notes?: string
  coupon_code?: string
}

export interface ReviewForm {
  product_id: string
  rating: number
  title?: string
  comment?: string
  images?: File[]
}

// Filter and Search Types
export interface ProductFilters {
  category?: string
  subcategory?: string
  min_price?: number
  max_price?: number
  tags?: string[]
  materials?: string[]
  is_new?: boolean
  is_on_sale?: boolean
  is_featured?: boolean
  min_rating?: number
  in_stock?: boolean
}

export interface SearchFilters extends ProductFilters {
  q?: string
  sort_by?: 'name' | 'price' | 'rating' | 'created_at'
  sort_order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// API Response Types
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

// Cart/Request Types
export interface CartItem {
  id: string
  product_id: string
  product: Product
  quantity: number
  notes?: string
  added_at: string
}

export interface Cart {
  id: string
  user_id?: string
  items: CartItem[]
  created_at: string
  updated_at: string
}

// Admin Types
export interface AdminStats {
  total_products: number
  total_orders: number
  total_revenue: number
  total_customers: number
  pending_requests: number
  low_stock_products: number
}

export interface RequestStatus {
  id: string
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled'
  notes?: string
  updated_at: string
}

export interface AdminRequest {
  id: string
  name: string
  email: string
  date_of_birth?: string
  employee_id?: string
  status: 'pending' | 'approved' | 'rejected'
  requested_at: string
  reviewed_at?: string
  reviewed_by?: string
  rejection_reason?: string
}
