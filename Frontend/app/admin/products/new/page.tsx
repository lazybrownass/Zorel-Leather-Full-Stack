"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { ArrowLeft, Plus, Upload, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import { useFileUpload } from "@/hooks/use-api"
import { toast } from "sonner"

export default function NewProductPage() {
  const router = useRouter()
  const { uploadFile, loading: uploadLoading } = useFileUpload()
  const [loading, setLoading] = useState(false)
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (files: FileList) => {
    try {
      const uploadPromises = Array.from(files).map(file => uploadFile(file, 'product'))
      const results = await Promise.all(uploadPromises)
      const imageUrls = results.map(result => result.url)
      setFormData(prev => ({ ...prev, images: [...prev.images, ...imageUrls] }))
      toast.success("Images uploaded successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to upload images")
    }
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
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        tags: [],
        specifications: {},
        dimensions: {},
        care_instructions: []
      }

      await apiClient.createProduct(productData)
      toast.success("Product created successfully!")
      router.push("/admin/products")
    } catch (error: any) {
      toast.error(error.message || "Failed to create product")
    } finally {
      setLoading(false)
    }
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
              <Plus className="w-8 h-8 text-primary mr-3" />
              <h1 className="text-4xl font-serif font-bold">Add New Product</h1>
            </div>
            <p className="text-lg text-muted-foreground">Create a new product listing for ZOREL LEATHER</p>
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

                  <div>
                    <Label htmlFor="productColors">Available Colors</Label>
                    <Input id="productColors" placeholder="e.g., Brown, Black, Cognac" />
                  </div>

                  <div>
                    <Label htmlFor="productSizes">Available Sizes</Label>
                    <Input id="productSizes" placeholder="e.g., Small, Medium, Large" />
                  </div>

                  <div>
                    <Label htmlFor="productDimensions">Dimensions</Label>
                    <Input id="productDimensions" placeholder="e.g., 15&quot; x 11&quot; x 4&quot;" />
                  </div>

                  <div>
                    <Label htmlFor="productWeight">Weight</Label>
                    <Input id="productWeight" placeholder="e.g., 2.5 lbs" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Upload Product Images</h3>
                    <p className="text-sm text-muted-foreground mb-4">Drag and drop images here, or click to browse</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      disabled={uploadLoading}
                    >
                      {uploadLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Choose Files
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recommended: High-quality images (1200x1200px minimum), multiple angles, lifestyle shots
                  </p>
                </div>
              </CardContent>
            </Card>

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
                {loading ? "Creating Product..." : "Create Product"}
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
