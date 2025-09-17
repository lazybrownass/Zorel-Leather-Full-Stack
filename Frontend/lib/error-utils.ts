import { ApiError } from './api'

/**
 * Get user-friendly error message from API error
 */
export function getUserFriendlyErrorMessage(error: any): string {
  if (error instanceof ApiError) {
    // Handle specific error codes
    if (error.errorCode === 'INVALID_CREDENTIALS') {
      return error.message
    }
    
    if (error.errorCode === 'ACCOUNT_DEACTIVATED') {
      return error.message
    }
    
    if (error.errorCode === 'AUTHENTICATION_FAILED') {
      return "Authentication failed. Please try again."
    }
    
    // Handle specific error types
    if (error.isUnauthorized) {
      return "Please log in to continue"
    }
    
    if (error.isForbidden) {
      return "You don't have permission to perform this action"
    }
    
    if (error.isNotFound) {
      return "The requested resource was not found"
    }
    
    if (error.isConflict) {
      return "This resource already exists"
    }
    
    if (error.isValidationError) {
      const validationErrors = error.validationErrors
      if (validationErrors && validationErrors.length > 0) {
        const firstError = validationErrors[0]
        // Handle FastAPI validation error format
        if (firstError.msg) {
          return `Please check your input: ${firstError.msg}`
        } else if (firstError.message) {
          return `Please check your input: ${firstError.message}`
        } else if (firstError.field) {
          return `Please check your input: ${firstError.field} ${firstError.message || 'is invalid'}`
        }
      }
      return "Please check your input and try again"
    }
    
    // Return the specific error message from the backend
    return error.message
  }
  
  // Handle network errors
  if (error.message?.includes('fetch')) {
    return "Unable to connect to the server. Please check your internet connection and try again."
  }
  
  // Handle timeout errors
  if (error.message?.includes('timeout')) {
    return "The request timed out. Please try again."
  }
  
  // Default fallback
  return error.message || "An unexpected error occurred. Please try again."
}

/**
 * Get error title based on error type
 */
export function getErrorTitle(error: any): string {
  if (error instanceof ApiError) {
    if (error.isUnauthorized) {
      return "Authentication Required"
    }
    
    if (error.isForbidden) {
      return "Access Denied"
    }
    
    if (error.isNotFound) {
      return "Not Found"
    }
    
    if (error.isConflict) {
      return "Conflict"
    }
    
    if (error.isValidationError) {
      return "Validation Error"
    }
    
    return "Error"
  }
  
  return "Error"
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  if (error instanceof ApiError) {
    // Don't retry client errors (4xx) except for 408 (timeout) and 429 (rate limit)
    if (error.status >= 400 && error.status < 500) {
      return error.status === 408 || error.status === 429
    }
    
    // Retry server errors (5xx)
    return error.status >= 500
  }
  
  // Retry network errors
  return error.message?.includes('fetch') || error.message?.includes('timeout')
}

/**
 * Get retry delay in milliseconds
 */
export function getRetryDelay(attempt: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s
  return Math.min(1000 * Math.pow(2, attempt), 16000)
}
