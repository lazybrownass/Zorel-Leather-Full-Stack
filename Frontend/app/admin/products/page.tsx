"use client"

import { useState, useEffect } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import Link from "next/link"
import Image from "next/image"
import { Search, Plus, Edit, Trash2, Eye, EyeOff, Loader2, Star, StarOff, MoreHorizontal, Filter, Download, Upload } from "lucide-react"
import { toast } from "sonner"
import { apiClient } from "@/lib/api"

export default function AdminProductsPage() {
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)

  // Load products and stats on component mount
  useEffect(() => {
    loadProducts()
    loadStats()
  }, [page, categoryFilter, statusFilter, sortBy, sortOrder])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (page === 1) {
        loadProducts()
      } else {
        setPage(1) // Reset to first page when searching
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', '20')
      params.append('sort_by', sortBy)
      params.append('sort_order', sortOrder)
      
      if (categoryFilter !== 'all') {
        // Map frontend categories to database categories
        const categoryMap: { [key: string]: string } = {
          'Men': 'jackets',
          'Women': 'shoes', 
          'Accessories': 'accessories'
        }
        params.append('category', categoryMap[categoryFilter] || categoryFilter)
      }
      if (statusFilter !== 'all') {
        params.append('is_active', statusFilter === 'active' ? 'true' : 'false')
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }
      
      const response = await apiClient.get(`/admin/products?${params.toString()}`)
      if (response) {
        setProducts(response.products || [])
        setTotalPages(response.total_pages || 1)
      }
    } catch (error) {
      console.error('Failed to load products:', error)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await apiClient.get('/admin/products/stats/summary')
      if (response) {
        setStats(response)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
      // Fallback to basic stats if endpoint doesn't exist
      setStats({
        total_products: products.length,
        active_products: products.filter(p => p.is_active).length,
        inactive_products: products.filter(p => !p.is_active).length,
        featured_products: products.filter(p => p.is_featured).length,
        low_stock_products: products.filter(p => p.stock_quantity <= p.low_stock_threshold).length,
        out_of_stock_products: products.filter(p => p.stock_quantity === 0).length
      })
    }
  }

  const handleDeleteProduct = async (product: any) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return
    
    try {
      await apiClient.delete(`/admin/products/${productToDelete.id}`)
      toast.success('Product deleted successfully')
      loadProducts()
      loadStats()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product')
    } finally {
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  const handleToggleStatus = async (product: any) => {
    try {
      await apiClient.put(`/admin/products/${product.id}/status`, { is_active: !product.is_active })
      toast.success(`Product ${product.is_active ? 'deactivated' : 'activated'} successfully`)
      loadProducts()
      loadStats()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update product status')
    }
  }

  const handleToggleFeatured = async (product: any) => {
    try {
      await apiClient.put(`/admin/products/${product.id}/featured`, { is_featured: !product.is_featured })
      toast.success(`Product ${product.is_featured ? 'unfeatured' : 'featured'} successfully`)
      loadProducts()
      loadStats()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update product featured status')
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        <Eye className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
        <EyeOff className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    )
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="font-serif text-3xl font-bold">Products</h1>
                <p className="text-muted-foreground">Manage your product catalog and inventory</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button asChild>
                  <Link href="/admin/products/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats Dashboard */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_products}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.active_products} active, {stats.inactive_products} inactive
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Featured Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.featured_products}</div>
                    <p className="text-xs text-muted-foreground">
                      Highlighted on homepage
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{stats.low_stock_products}</div>
                    <p className="text-xs text-muted-foreground">
                      Less than 10 units
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{stats.out_of_stock_products}</div>
                    <p className="text-xs text-muted-foreground">
                      No inventory available
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search products..." 
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Men">Jackets</SelectItem>
                      <SelectItem value="Women">Shoes</SelectItem>
                      <SelectItem value="Accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">Error loading products: {error}</p>
                <Button onClick={() => loadProducts()} className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <Image 
                        src={product.images?.[0] || "/placeholder.svg"} 
                        alt={product.name} 
                        fill 
                        className="object-cover" 
                      />
                      <div className="absolute top-3 left-3">{getStatusBadge(product.is_active)}</div>
                      <div className="absolute top-3 right-3 flex gap-1">
                        <Badge variant="outline" className="bg-white/90">
                          {product.is_featured ? "Featured" : "Standard"}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {product.category} • SKU: {product.sku}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {product.category}
                            </Badge>
                            {product.is_featured && (
                              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-lg">
                                {product.price ? formatCurrency(product.price, "USD") : "Request Price"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Cost: {product.cost ? formatCurrency(product.cost, "USD") : "Not set"} (Admin only)
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground">Created {formatDate(product.created_at)}</p>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-4">
                              <span className={`font-medium ${product.stock_quantity <= product.low_stock_threshold ? 'text-red-600' : 'text-green-600'}`}>
                                Stock: {product.stock_quantity} units
                              </span>
                              <span className="text-muted-foreground">
                                Low Stock: {product.low_stock_threshold}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-1">
                          <Button asChild variant="outline" size="sm" className="flex-1">
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleStatus(product)}
                            className={product.is_active ? "text-green-600" : "text-gray-600"}
                          >
                            {product.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleFeatured(product)}
                            className={product.is_featured ? "text-yellow-600" : "text-gray-600"}
                          >
                            {product.is_featured ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteProduct(product)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
              All associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
