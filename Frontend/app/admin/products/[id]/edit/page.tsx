"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const [loading, setLoading] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    cost: "",
    sku: "",
    materials: "",
    status: "active",
    is_featured: false,
    is_new: false,
    is_on_sale: false,
    stock_quantity: 0,
    low_stock_threshold: 5,
    images: [] as string[]
  })

  useEffect(() => {
    if (productId) {
      loadProduct()
    }
  }, [productId])

  const loadProduct = async () => {
    try {
      setLoadingProduct(true)
      const response = await apiClient.get(`/admin/products/${productId}`)
      if (response) {
        setFormData({
          name: response.name || "",
          description: response.description || "",
          category: response.category || "",
          price: response.price?.toString() || "",
          cost: response.cost?.toString() || "",
          sku: response.sku || "",
          materials: response.materials || "",
          status: response.is_active ? "active" : "inactive",
          is_featured: response.is_featured || false,
          is_new: response.is_new || false,
          is_on_sale: response.is_on_sale || false,
          stock_quantity: response.stock_quantity || 0,
          low_stock_threshold: response.low_stock_threshold || 5,
          images: response.images || []
        })
      }
    } catch (error) {
      console.error("Error loading product:", error)
      toast.error("Failed to load product")
      router.push("/admin/products")
    } finally {
      setLoadingProduct(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const productData = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        stock_quantity: parseInt(formData.stock_quantity.toString()),
        low_stock_threshold: parseInt(formData.low_stock_threshold.toString()),
        is_active: formData.status === "active"
      }

      await apiClient.put(`/admin/products/${productId}`, productData)
      toast.success("Product updated successfully!")
      router.push("/admin/products")
    } catch (error: any) {
      toast.error(error.message || "Failed to update product")
    } finally {
      setLoading(false)
    }
  }

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          {/* Back Navigation */}
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/admin/products">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Link>
          </Button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Save className="w-8 h-8 text-primary mr-3" />
              <h1 className="text-4xl font-serif font-bold">Edit Product</h1>
            </div>
            <p className="text-lg text-muted-foreground">Update product information for ZOREL LEATHER</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="productName">Product Name</Label>
                    <Input 
                      id="productName" 
                      placeholder="e.g., Premium Leather Briefcase"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="productCategory">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Men">Men's Collection</SelectItem>
                        <SelectItem value="Women">Women's Collection</SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="productDescription">Description</Label>
                    <Textarea
                      id="productDescription"
                      placeholder="Detailed product description..."
                      className="min-h-[120px]"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="productPrice">Price ($)</Label>
                      <Input 
                        id="productPrice" 
                        type="number" 
                        placeholder="299"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="productCost">Cost ($) - Admin Only</Label>
                      <Input 
                        id="productCost" 
                        type="number" 
                        placeholder="150"
                        value={formData.cost}
                        onChange={(e) => handleInputChange('cost', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="productSku">SKU</Label>
                      <Input 
                        id="productSku" 
                        placeholder="ZL-BF-001"
                        value={formData.sku}
                        onChange={(e) => handleInputChange('sku', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="productMaterial">Material</Label>
                    <Input 
                      id="productMaterial" 
                      placeholder="e.g., Full-grain Italian leather"
                      value={formData.materials}
                      onChange={(e) => handleInputChange('materials', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stockQuantity">Stock Quantity</Label>
                      <Input 
                        id="stockQuantity" 
                        type="number" 
                        placeholder="10"
                        value={formData.stock_quantity}
                        onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                      <Input 
                        id="lowStockThreshold" 
                        type="number" 
                        placeholder="5"
                        value={formData.low_stock_threshold}
                        onChange={(e) => handleInputChange('low_stock_threshold', parseInt(e.target.value) || 5)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Product Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Featured Product</h3>
                      <p className="text-sm text-muted-foreground">Display this product prominently on the homepage</p>
                    </div>
                    <Switch 
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">New Arrival</h3>
                      <p className="text-sm text-muted-foreground">Mark this product as a new arrival</p>
                    </div>
                    <Switch 
                      checked={formData.is_new}
                      onCheckedChange={(checked) => handleInputChange('is_new', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">On Sale</h3>
                      <p className="text-sm text-muted-foreground">Mark this product as being on sale</p>
                    </div>
                    <Switch 
                      checked={formData.is_on_sale}
                      onCheckedChange={(checked) => handleInputChange('is_on_sale', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Active</h3>
                      <p className="text-sm text-muted-foreground">Make this product visible to customers</p>
                    </div>
                    <Switch 
                      checked={formData.status === 'active'}
                      onCheckedChange={(checked) => handleInputChange('status', checked ? 'active' : 'inactive')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {loading ? "Updating Product..." : "Update Product"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/products">Cancel</Link>
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
