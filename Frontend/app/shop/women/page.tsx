"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Heart, Filter, Grid, List, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const womenProducts = [
  {
    id: 1,
    name: "Elegant Leather Handbag",
    price: 749,
    image: "/elegant-brown-leather-handbag.jpg",
    category: "Handbags",
    isNew: true,
    colors: ["Brown", "Black", "Burgundy"],
  },
  {
    id: 2,
    name: "Designer Crossbody Bag",
    price: 449,
    originalPrice: 599,
    image: "/luxury-brown-leather-crossbody-bag-for-women.jpg",
    category: "Handbags",
    colors: ["Brown", "Black", "Camel"],
  },
  {
    id: 3,
    name: "Classic Leather Pumps",
    price: 529,
    image: "/elegant-brown-leather-pumps-high-heels.jpg",
    category: "Shoes",
    colors: ["Brown", "Black", "Nude"],
  },
  {
    id: 4,
    name: "Luxury Tote Bag",
    price: 899,
    image: "/luxury-brown-leather-tote-bag-for-women.jpg",
    category: "Handbags",
    isNew: true,
    colors: ["Brown", "Black"],
  },
  {
    id: 5,
    name: "Leather Ankle Boots",
    price: 649,
    image: "/stylish-brown-leather-ankle-boots-for-women.jpg",
    category: "Shoes",
    colors: ["Brown", "Black", "Cognac"],
  },
  {
    id: 6,
    name: "Evening Clutch",
    price: 299,
    originalPrice: 399,
    image: "/elegant-brown-leather-evening-clutch-bag.jpg",
    category: "Handbags",
    colors: ["Brown", "Black", "Gold"],
  },
]

export default function WomenPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isLoading, setIsLoading] = useState(true)

  // Get unique categories
  const categories = ["All", ...Array.from(new Set(womenProducts.map(product => product.category)))]

  // Filter products based on selected category
  const filteredProducts = selectedCategory === "All" 
    ? womenProducts 
    : womenProducts.filter(product => product.category === selectedCategory)

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  // Simulate loading for seamless transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200) // Slightly longer for better UX
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50/30 dark:from-rose-950/20 dark:via-amber-900/10 dark:to-rose-950/20 flex items-center justify-center animate-in fade-in duration-500">
        <div className="text-center space-y-6">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-rose-800 dark:text-rose-200 mx-auto" />
          </div>
          <div className="space-y-2">
            <p className="text-rose-800 dark:text-rose-200 font-semibold text-lg">Loading Women's Collection</p>
            <p className="text-rose-600 dark:text-rose-400 text-sm">Curating elegant leather pieces...</p>
          </div>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-rose-600 dark:bg-rose-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-rose-600 dark:bg-rose-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-rose-600 dark:bg-rose-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <Header />

      <div className="bg-gradient-to-br from-background via-background to-background/50">
        {/* Hero Section */}
        <div className="relative h-[40vh] bg-gradient-to-r from-rose-900 via-amber-800 to-rose-900 overflow-hidden">
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-[url('/luxury-womens-leather-handbags-and-accessories-col.jpg')] bg-cover bg-center" />
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
                Women's Collection
              </h1>
              <p className="text-xl text-rose-100 mb-6 drop-shadow-lg">
                Exquisite leather pieces designed for the sophisticated woman
              </p>
              <div className="flex items-center gap-4 text-rose-200">
                <span className="text-sm font-medium">Elegant Design</span>
                <span className="w-1 h-1 bg-rose-300 rounded-full"></span>
                <span className="text-sm font-medium">Premium Craftsmanship</span>
                <span className="w-1 h-1 bg-rose-300 rounded-full"></span>
                <span className="text-sm font-medium">Timeless Style</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Filters and Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Women's Leather Goods</h2>
              <p className="text-muted-foreground">
                {filteredProducts.length} {selectedCategory === "All" ? "exclusive pieces" : `${selectedCategory.toLowerCase()} items`} available for request
              </p>
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={viewMode === "grid" ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent"}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={viewMode === "list" ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent"}
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3 mb-8">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`px-4 py-2 cursor-pointer transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "border-border text-foreground hover:bg-accent"
                }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category === "All" ? "All Items" : category}
              </Badge>
            ))}
          </div>

          {/* Products Grid */}
          <div className={`grid gap-8 ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          }`}>
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className={`group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-card/80 backdrop-blur-sm ${
                  viewMode === "list" ? "flex flex-row" : ""
                }`}
              >
                <div className={`relative overflow-hidden ${
                  viewMode === "list" ? "w-80 h-64 flex-shrink-0" : ""
                }`}>
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={400}
                    height={400}
                    className={`object-cover group-hover:scale-110 transition-transform duration-700 ${
                      viewMode === "list" ? "w-full h-full" : "w-full h-80"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.isNew && <Badge className="bg-pink-600 text-white shadow-lg">New</Badge>}
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

                <CardContent className={`p-6 ${viewMode === "list" ? "flex-1 flex flex-col justify-between" : ""}`}>
                  <div>
                    <div className="mb-3">
                      <Badge variant="outline" className="text-xs text-muted-foreground border-border">
                        {product.category}
                      </Badge>
                    </div>

                    <h3 className={`font-serif font-semibold text-foreground mb-2 group-hover:text-primary transition-colors ${
                      viewMode === "list" ? "text-xl" : "text-lg"
                    }`}>
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-3">
                      {product.originalPrice ? (
                        <>
                          <span className={`font-bold text-foreground ${viewMode === "list" ? "text-2xl" : "text-2xl"}`}>
                            ${product.price}
                          </span>
                          <span className="text-lg text-muted-foreground line-through">${product.originalPrice}</span>
                        </>
                      ) : (
                        <span className={`font-bold text-foreground ${viewMode === "list" ? "text-2xl" : "text-2xl"}`}>
                          ${product.price}
                        </span>
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
                                  : color === "Burgundy"
                                    ? "bg-red-900"
                                    : color === "Camel"
                                      ? "bg-amber-600"
                                      : color === "Nude"
                                        ? "bg-amber-200"
                                        : color === "Cognac"
                                          ? "bg-amber-700"
                                          : color === "Gold"
                                            ? "bg-yellow-600"
                                            : "bg-gray-400"
                            }`}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {viewMode === "list" && (
                    <div className="mt-4">
                      <Link href={`/product/${product.name.toLowerCase().replace(/\s+/g, "-")}`}>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          Request Availability
                        </Button>
                      </Link>
                    </div>
                  )}
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
