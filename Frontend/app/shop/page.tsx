"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Filter, Search, Loader2 } from "lucide-react"
import { useProducts, useCategories } from "@/hooks/use-api"
import { ProductFilters } from "@/lib/types"

export default function ShopPage() {
  const [filters, setFilters] = useState<ProductFilters & { page?: number; limit?: number }>({
    page: 1,
    limit: 20
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [sortBy, setSortBy] = useState("featured")
  const [isLoading, setIsLoading] = useState(true)

  const { data: productsResponse, loading: productsLoading, error: productsError } = useProducts(filters)
  const { data: categories, loading: categoriesLoading } = useCategories()
  
  // Ensure categories is always an array
  const categoriesList = Array.isArray(categories) ? categories : []

  const products = productsResponse?.data || []
  const totalProducts = productsResponse?.total || 0

  const priceRanges = ["Under $100", "$100 - $300", "$300 - $500", "$500+"]

  // Simulate loading for seamless transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setFilters(prev => ({ ...prev, search: query, page: 1 }))
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setFilters(prev => ({ 
      ...prev, 
      category: category === "All" ? undefined : category,
      page: 1 
    }))
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    const [sortBy, sortOrder] = sort.split('-')
    setFilters(prev => ({ 
      ...prev, 
      sort_by: sortBy,
      sort_order: sortOrder as 'asc' | 'desc',
      page: 1 
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50/50 dark:from-amber-950/20 dark:via-amber-900/10 dark:to-amber-950/20 flex items-center justify-center animate-in fade-in duration-500">
        <div className="text-center space-y-6">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-amber-800 dark:text-amber-200 mx-auto" />
          </div>
          <div className="space-y-2">
            <p className="text-amber-800 dark:text-amber-200 font-semibold text-lg">Loading Shop</p>
            <p className="text-amber-600 dark:text-amber-400 text-sm">Discovering premium leather goods...</p>
          </div>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-amber-600 dark:bg-amber-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-amber-600 dark:bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-amber-600 dark:bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <Header />

      {/* Page Header */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="font-serif text-4xl font-bold text-amber-900 dark:text-amber-100 mb-4">Premium Leather Collection</h1>
            <p className="text-lg text-amber-700 dark:text-amber-300 max-w-2xl mx-auto luxury-text">
              Discover our complete range of handcrafted leather goods. Each piece is made to order with the finest
              materials and traditional techniques.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif text-lg font-semibold text-amber-900 dark:text-amber-100 mb-4">Search</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <Input 
                    placeholder="Search products..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif text-lg font-semibold text-amber-900 dark:text-amber-100 mb-4">Categories</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="all" 
                      checked={selectedCategory === ""}
                      onCheckedChange={() => handleCategoryChange("All")}
                    />
                    <label htmlFor="all" className="text-sm font-medium text-amber-800 dark:text-amber-200 cursor-pointer">
                      All
                    </label>
                  </div>
                  {categoriesLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-amber-600 dark:text-amber-400" />
                    </div>
                  ) : (
                    categoriesList.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox 
                          id={category} 
                          checked={selectedCategory === category}
                          onCheckedChange={() => handleCategoryChange(category)}
                        />
                        <label htmlFor={category} className="text-sm font-medium text-amber-800 dark:text-amber-200 cursor-pointer">
                          {category}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif text-lg font-semibold text-amber-900 dark:text-amber-100 mb-4">Price Range</h3>
                <div className="space-y-3">
                  {priceRanges.map((range) => (
                    <div key={range} className="flex items-center space-x-2">
                      <Checkbox id={range} />
                      <label htmlFor={range} className="text-sm font-medium text-amber-800 dark:text-amber-200 cursor-pointer">
                        {range}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {/* Sort and Filter Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <p className="text-amber-700 dark:text-amber-300">Showing {totalProducts} products</p>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="lg:hidden bg-transparent">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600 dark:text-amber-400" />
              </div>
            ) : productsError ? (
              <div className="text-center py-12">
                <p className="text-red-600">Error loading products: {productsError}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-amber-700 dark:text-amber-300">No products found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Load More */}
                {productsResponse && productsResponse.total_pages > 1 && (
                  <div className="text-center mt-12">
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                    >
                      Load More Products
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}
