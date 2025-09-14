"use client"

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useAuth } from '@/hooks/use-api'
import { User, Product, CartItem } from '@/lib/types'

// State types
interface AppState {
  user: User | null
  cart: CartItem[]
  wishlist: string[] // Product IDs
  notifications: any[]
  theme: 'light' | 'dark' | 'system'
  loading: boolean
  error: string | null
}

// Action types
type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_ITEM'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_WISHLIST'; payload: string[] }
  | { type: 'ADD_TO_WISHLIST'; payload: string }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'SET_NOTIFICATIONS'; payload: any[] }
  | { type: 'ADD_NOTIFICATION'; payload: any }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

// Initial state
const initialState: AppState = {
  user: null,
  cart: [],
  wishlist: [],
  notifications: [],
  theme: 'system',
  loading: false,
  error: null,
}

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }
    
    case 'SET_CART':
      return { ...state, cart: action.payload }
    
    case 'ADD_TO_CART':
      const existingItem = state.cart.find(item => item.product_id === action.payload.product_id)
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.product_id === action.payload.product_id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        }
      }
      return { ...state, cart: [...state.cart, action.payload] }
    
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(item => item.id !== action.payload) }
    
    case 'UPDATE_CART_ITEM':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      }
    
    case 'CLEAR_CART':
      return { ...state, cart: [] }
    
    case 'SET_WISHLIST':
      return { ...state, wishlist: action.payload }
    
    case 'ADD_TO_WISHLIST':
      return { ...state, wishlist: [...state.wishlist, action.payload] }
    
    case 'REMOVE_FROM_WISHLIST':
      return { ...state, wishlist: state.wishlist.filter(id => id !== action.payload) }
    
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload }
    
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] }
    
    case 'REMOVE_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) }
    
    case 'SET_THEME':
      return { ...state, theme: action.payload }
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    default:
      return state
  }
}

// Context
const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

// Provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const { user, loading: authLoading } = useAuth()

  // Sync user from auth hook
  useEffect(() => {
    dispatch({ type: 'SET_USER', payload: user })
  }, [user])

  // Load cart from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        try {
          const cart = JSON.parse(savedCart)
          dispatch({ type: 'SET_CART', payload: cart })
        } catch (error) {
          console.error('Failed to parse cart from localStorage:', error)
        }
      }

      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system'
      if (savedTheme) {
        dispatch({ type: 'SET_THEME', payload: savedTheme })
      }
    }
  }, [])

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(state.cart))
    }
  }, [state.cart])

  // Save theme to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', state.theme)
    }
  }, [state.theme])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

// Convenience hooks
export function useCart() {
  const { state, dispatch } = useApp()
  
  const addToCart = (product: Product, quantity: number = 1, notes?: string) => {
    const cartItem: CartItem = {
      id: `${product.id}-${Date.now()}`,
      product_id: product.id,
      product,
      quantity,
      notes,
      added_at: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_TO_CART', payload: cartItem })
  }

  const removeFromCart = (itemId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId })
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
    } else {
      dispatch({ type: 'UPDATE_CART_ITEM', payload: { id: itemId, quantity } })
    }
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const getTotalItems = () => {
    return state.cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return state.cart.reduce((total, item) => {
      const price = item.product.price || 0
      return total + (price * item.quantity)
    }, 0)
  }

  return {
    cart: state.cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  }
}

export function useWishlist() {
  const { state, dispatch } = useApp()
  
  const addToWishlist = (productId: string) => {
    if (!state.wishlist.includes(productId)) {
      dispatch({ type: 'ADD_TO_WISHLIST', payload: productId })
    }
  }

  const removeFromWishlist = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId })
  }

  const isInWishlist = (productId: string) => {
    return state.wishlist.includes(productId)
  }

  return {
    wishlist: state.wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  }
}

export function useNotifications() {
  const { state, dispatch } = useApp()
  
  const addNotification = (notification: any) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification })
  }

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
  }

  return {
    notifications: state.notifications,
    addNotification,
    removeNotification,
  }
}

export function useTheme() {
  const { state, dispatch } = useApp()
  
  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    dispatch({ type: 'SET_THEME', payload: theme })
  }

  return {
    theme: state.theme,
    setTheme,
  }
}
