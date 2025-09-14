import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Heart, Filter, Grid, List, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const menProducts = [
  {
    id: 1,
    name: "Executive Leather Briefcase",
    price: 899,
    originalPrice: 1199,
    image: "/luxury-brown-leather-briefcase.jpg",
    category: "Bags",
    isNew: true,
    colors: ["Brown", "Black", "Cognac"],
  },
  {
    id: 2,
    name: "Classic Oxford Shoes",
    price: 649,
    image: "/luxury-brown-leather-oxford-shoes.jpg",
    category: "Shoes",
    colors: ["Brown", "Black"],
  },
  {
    id: 3,
    name: "Premium Leather Wallet",
    price: 189,
    image: "/premium-brown-leather-wallet.png",
    category: "Accessories",
    colors: ["Brown", "Black", "Navy"],
  },
  {
    id: 4,
    name: "Luxury Travel Duffle",
    price: 1299,
    image: "/luxury-brown-leather-travel-duffle-bag.jpg",
    category: "Bags",
    isNew: true,
    colors: ["Brown", "Black"],
  },
  {
    id: 5,
    name: "Handcrafted Belt",
    price: 149,
    image: "/handcrafted-brown-leather-belt.jpg",
    category: "Accessories",
    colors: ["Brown", "Black", "Cognac"],
  },
  {
    id: 6,
    name: "Derby Dress Shoes",
    price: 599,
    image: "/luxury-brown-leather-derby-dress-shoes.jpg",
    category: "Shoes",
    colors: ["Brown", "Black"],
  },
]

export default function MenPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50/50">
        {/* Hero Section */}
        <div className="relative h-[40vh] bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 overflow-hidden">
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-[url('/luxury-mens-leather-goods-collection-hero-banner.jpg')] bg-cover bg-center" />
          <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl">
              <div className="mb-4">
                <Link href="/shop">
                  <Button variant="ghost" className="text-white hover:bg-white/20 p-2">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Shop
                  </Button>
                </Link>
              </div>

              <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4 drop-shadow-2xl">
                Men's Collection
              </h1>
              <p className="text-xl text-amber-100 mb-6 drop-shadow-lg">
                Sophisticated leather goods crafted for the modern gentleman
              </p>
              <div className="flex items-center gap-4 text-amber-200">
                <span className="text-sm font-medium">Premium Quality</span>
                <span className="w-1 h-1 bg-amber-300 rounded-full"></span>
                <span className="text-sm font-medium">Handcrafted Excellence</span>
                <span className="w-1 h-1 bg-amber-300 rounded-full"></span>
                <span className="text-sm font-medium">Timeless Design</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Filters and Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Men's Leather Goods</h2>
              <p className="text-muted-foreground">{menProducts.length} exclusive pieces available for request</p>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="border-border text-foreground hover:bg-accent bg-transparent"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <div className="flex border border-border rounded-lg overflow-hidden">
                <Button variant="ghost" size="sm" className="bg-accent text-foreground">
                  <Grid className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-accent">
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Badge variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2">
              All Items
            </Badge>
            <Badge variant="outline" className="border-border text-foreground hover:bg-accent px-4 py-2 cursor-pointer">
              Bags
            </Badge>
            <Badge variant="outline" className="border-border text-foreground hover:bg-accent px-4 py-2 cursor-pointer">
              Shoes
            </Badge>
            <Badge variant="outline" className="border-border text-foreground hover:bg-accent px-4 py-2 cursor-pointer">
              Accessories
            </Badge>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {menProducts.map((product) => (
              <Card
                key={product.id}
                className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-card/80 backdrop-blur-sm"
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.isNew && <Badge className="bg-primary text-primary-foreground shadow-lg">New</Badge>}
                    {product.originalPrice && (
                      <Badge variant="destructive" className="shadow-lg">
                        Sale
                      </Badge>
                    )}
                  </div>

                  {/* Wishlist Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white hover:bg-white/30 opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>

                  {/* Quick Actions */}
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                    <Link href={`/product/${product.name.toLowerCase().replace(/\s+/g, "-")}`}>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg backdrop-blur-md">
                        Request Availability
                      </Button>
                    </Link>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="mb-3">
                    <Badge variant="outline" className="text-xs text-muted-foreground border-border">
                      {product.category}
                    </Badge>
                  </div>

                  <h3 className="font-serif font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    {product.originalPrice ? (
                      <>
                        <span className="text-2xl font-bold text-foreground">${product.price}</span>
                        <span className="text-lg text-muted-foreground line-through">${product.originalPrice}</span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-foreground">${product.price}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Available in:</span>
                    <div className="flex gap-1">
                      {product.colors.map((color) => (
                        <div
                          key={color}
                          className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                            color === "Brown"
                              ? "bg-amber-800"
                              : color === "Black"
                                ? "bg-gray-900"
                                : color === "Cognac"
                                  ? "bg-amber-600"
                                  : color === "Navy"
                                    ? "bg-blue-900"
                                    : "bg-gray-400"
                          }`}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="border-border text-foreground hover:bg-accent px-8 bg-transparent"
            >
              Load More Products
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
