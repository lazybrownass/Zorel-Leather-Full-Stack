// Image reference utility for Zorel Leather frontend
// Maps product categories and types to appropriate images

export interface ImageReference {
  src: string
  alt: string
  category?: string
}

// Available images in the public folder
export const AVAILABLE_IMAGES = {
  // Numbered images (1-18)
  'image-1': '/image-1.png',
  'image-2': '/image-2.png', 
  'image-3': '/image-3.png',
  'image-4': '/image-4.png',
  'image-5': '/image-5.png',
  'image-6': '/image-6.png',
  'image-7': '/image-7.png',
  'image-8': '/image-8.png',
  'image-10': '/image-10.jpg',
  'image-11': '/image-11.jpg',
  'image-12': '/image-12.jpg',
  'image-13': '/image-13.jpg',
  'image-14': '/image-14.jpg',
  'image-15': '/image-15.jpg',
  'image-16': '/image-16.jpg',
  'image-17': '/image-17.jpg',
  'image-18': '/image-18.jpg',
  
  // Descriptive images
  'designer-tote': '/designer-brown-leather-tote-bag.jpg',
  'evening-clutch': '/elegant-brown-leather-evening-clutch-bag.jpg',
  'handbag': '/elegant-brown-leather-handbag.jpg',
  'keychain': '/elegant-brown-leather-keychain-with-brass-hardware.jpg',
  'pumps': '/elegant-brown-leather-pumps-high-heels.jpg',
  'belt-buckle': '/handcrafted-brown-leather-belt-with-brass-buckle.jpg',
  'belt': '/handcrafted-brown-leather-belt.jpg',
  'accessories': '/leather-accessories-wallets-belts-and-small-goods.jpg',
  'passport-holder': '/leather-travel-document-passport-holder.jpg',
  'briefcase-detail': '/luxury-brown-leather-briefcase-detail-view.jpg',
  'briefcase-front': '/luxury-brown-leather-briefcase-front-view.jpg',
  'briefcase-interior': '/luxury-brown-leather-briefcase-interior-view.jpg',
  'briefcase-side': '/luxury-brown-leather-briefcase-side-view.jpg',
  'briefcase': '/luxury-brown-leather-briefcase.jpg',
  'crossbody-bag': '/luxury-brown-leather-crossbody-bag-for-women.jpg',
  'derby-shoes': '/luxury-brown-leather-derby-dress-shoes.jpg',
  'oxford-shoes': '/luxury-brown-leather-oxford-shoes.jpg',
  'tote-bag': '/luxury-brown-leather-tote-bag-for-women.jpg',
  'duffle-bag': '/luxury-brown-leather-travel-duffle-bag.jpg',
  'watch-strap': '/luxury-brown-leather-watch-strap.jpg',
  'mens-collection': '/luxury-mens-leather-goods-collection-hero-banner.jpg',
  'womens-collection': '/luxury-womens-leather-handbags-and-accessories-col.jpg',
  'mens-accessories': '/mens-leather-accessories-briefcase-and-shoes.jpg',
  'card-holder': '/minimalist-brown-leather-card-holder.jpg',
  'wallet': '/premium-brown-leather-wallet.png',
  'belt-collection': '/premium-leather-belt-collection.jpg',
  'ankle-boots': '/stylish-brown-leather-ankle-boots-for-women.jpg',
  'womens-accessories': '/womens-leather-handbags-and-accessories.jpg',
  
  // Placeholder images
  'placeholder': '/placeholder.jpg',
  'placeholder-logo': '/placeholder-logo.png',
  'placeholder-user': '/placeholder-user.jpg'
} as const

// Category-based image mapping
export const CATEGORY_IMAGES: Record<string, string[]> = {
  'handbags': [
    'handbag', 'tote-bag', 'crossbody-bag', 'evening-clutch', 'designer-tote'
  ],
  'bags': [
    'briefcase', 'duffle-bag', 'tote-bag', 'crossbody-bag'
  ],
  'shoes': [
    'pumps', 'derby-shoes', 'oxford-shoes', 'ankle-boots'
  ],
  'accessories': [
    'wallet', 'card-holder', 'keychain', 'watch-strap', 'belt', 'belt-buckle'
  ],
  'belts': [
    'belt', 'belt-buckle', 'belt-collection'
  ],
  'wallets': [
    'wallet', 'card-holder', 'passport-holder'
  ],
  'briefcases': [
    'briefcase', 'briefcase-front', 'briefcase-detail', 'briefcase-interior', 'briefcase-side'
  ],
  'travel': [
    'duffle-bag', 'passport-holder', 'briefcase'
  ]
}

// Get image for a specific product
export function getProductImage(productId: string, category?: string, imageIndex: number = 0): string {
  // First, try to get images from the numbered series based on product ID
  const imageKeys = Object.keys(AVAILABLE_IMAGES).filter(key => key.startsWith('image-'))
  
  // Use product ID to determine which image to use
  const hash = productId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  const imageIndexFromHash = Math.abs(hash) % imageKeys.length
  const selectedImageKey = imageKeys[imageIndexFromHash]
  
  return AVAILABLE_IMAGES[selectedImageKey as keyof typeof AVAILABLE_IMAGES] || '/placeholder.jpg'
}

// Get images for a specific category
export function getCategoryImages(category: string): string[] {
  const categoryKey = category.toLowerCase().replace(/\s+/g, '-')
  const imageKeys = CATEGORY_IMAGES[categoryKey] || []
  
  return imageKeys.map(key => AVAILABLE_IMAGES[key as keyof typeof AVAILABLE_IMAGES]).filter(Boolean)
}

// Get random image for a category
export function getRandomCategoryImage(category: string): string {
  const images = getCategoryImages(category)
  if (images.length === 0) {
    // Fallback to numbered images
    const imageKeys = Object.keys(AVAILABLE_IMAGES).filter(key => key.startsWith('image-'))
    const randomIndex = Math.floor(Math.random() * imageKeys.length)
    const selectedImageKey = imageKeys[randomIndex]
    return AVAILABLE_IMAGES[selectedImageKey as keyof typeof AVAILABLE_IMAGES] || '/placeholder.jpg'
  }
  
  const randomIndex = Math.floor(Math.random() * images.length)
  return images[randomIndex]
}

// Get hero banner images
export function getHeroImages(): string[] {
  return [
    AVAILABLE_IMAGES['mens-collection'],
    AVAILABLE_IMAGES['womens-collection'],
    AVAILABLE_IMAGES['mens-accessories'],
    AVAILABLE_IMAGES['womens-accessories']
  ]
}

// Get featured product images
export function getFeaturedImages(): string[] {
  return [
    AVAILABLE_IMAGES['briefcase'],
    AVAILABLE_IMAGES['handbag'],
    AVAILABLE_IMAGES['derby-shoes'],
    AVAILABLE_IMAGES['wallet'],
    AVAILABLE_IMAGES['belt'],
    AVAILABLE_IMAGES['tote-bag']
  ]
}

// Utility to get all available images
export function getAllImages(): string[] {
  return Object.values(AVAILABLE_IMAGES)
}

// Utility to get images by type
export function getImagesByType(type: 'png' | 'jpg' | 'all' = 'all'): string[] {
  if (type === 'all') {
    return getAllImages()
  }
  
  return Object.values(AVAILABLE_IMAGES).filter(image => 
    image.toLowerCase().endsWith(type)
  )
}

// Generate image reference for product
export function generateProductImageReference(product: {
  id: string
  name: string
  category?: string
  images?: string[]
}): ImageReference {
  // If product already has images, use the first one
  if (product.images && product.images.length > 0) {
    return {
      src: product.images[0],
      alt: product.name,
      category: product.category
    }
  }
  
  // Generate image based on category or fallback to numbered images
  const src = product.category 
    ? getRandomCategoryImage(product.category)
    : getProductImage(product.id, product.category)
    
  return {
    src,
    alt: product.name,
    category: product.category
  }
}

// Preload images for better performance
export function preloadImages(imageUrls: string[]): Promise<void[]> {
  return Promise.all(
    imageUrls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = reject
        img.src = url
      })
    })
  )
}

export default AVAILABLE_IMAGES
