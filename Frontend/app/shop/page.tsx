import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Filter, Search } from "lucide-react"

export default function ShopPage() {
  const products = [
    {
      id: 1,
      name: "Executive Leather Briefcase",
      category: "Men",
      price: "Request Price",
      image: "/luxury-brown-leather-briefcase.jpg",
      slug: "executive-leather-briefcase",
      availability: "Check with seller after request",
    },
    {
      id: 2,
      name: "Elegant Handbag Collection",
      category: "Women",
      price: "Request Price",
      image: "/elegant-brown-leather-handbag.jpg",
      slug: "elegant-handbag-collection",
      availability: "Check with seller after request",
    },
    {
      id: 3,
      name: "Premium Leather Wallet",
      category: "Accessories",
      price: "Request Price",
      image: "/premium-brown-leather-wallet.png",
      slug: "premium-leather-wallet",
      availability: "Check with seller after request",
    },
    {
      id: 4,
      name: "Luxury Oxford Shoes",
      category: "Men",
      price: "Request Price",
      image: "/luxury-brown-leather-oxford-shoes.jpg",
      slug: "luxury-oxford-shoes",
      availability: "Check with seller after request",
    },
    {
      id: 5,
      name: "Designer Tote Bag",
      category: "Women",
      price: "Request Price",
      image: "/designer-brown-leather-tote-bag.jpg",
      slug: "designer-tote-bag",
      availability: "Check with seller after request",
    },
    {
      id: 6,
      name: "Leather Belt Collection",
      category: "Accessories",
      price: "Request Price",
      image: "/premium-leather-belt-collection.jpg",
      slug: "leather-belt-collection",
      availability: "Check with seller after request",
    },
  ]

  const categories = ["All", "Men", "Women", "Accessories"]
  const priceRanges = ["Under $100", "$100 - $300", "$300 - $500", "$500+"]

  return (
    <div className="min-h-screen">
      <Header />

      {/* Page Header */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="font-serif text-4xl font-bold mb-4">Premium Leather Collection</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto luxury-text">
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
                <h3 className="font-serif text-lg font-semibold mb-4">Search</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search products..." className="pl-10" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif text-lg font-semibold mb-4">Categories</h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox id={category} />
                      <label htmlFor={category} className="text-sm font-medium cursor-pointer">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif text-lg font-semibold mb-4">Price Range</h3>
                <div className="space-y-3">
                  {priceRanges.map((range) => (
                    <div key={range} className="flex items-center space-x-2">
                      <Checkbox id={range} />
                      <label htmlFor={range} className="text-sm font-medium cursor-pointer">
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
              <p className="text-muted-foreground">Showing {products.length} products</p>
              <div className="flex gap-2">
                <Select defaultValue="featured">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="lg:hidden bg-transparent">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Products
              </Button>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}
