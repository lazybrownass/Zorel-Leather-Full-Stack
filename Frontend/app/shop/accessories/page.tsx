"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Filter, Grid, List, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const accessoryProducts = [
  {
    id: 1,
    name: "Premium Leather Wallet",
    price: 189,
    image: "/premium-brown-leather-wallet.png",
    category: "Wallets",
    colors: ["Brown", "Black", "Navy"],
  },
  {
    id: 2,
    name: "Handcrafted Leather Belt",
    price: 149,
    originalPrice: 199,
    image: "/handcrafted-brown-leather-belt-with-brass-buckle.jpg",
    category: "Belts",
    colors: ["Brown", "Black", "Cognac"],
  },
  {
    id: 3,
    name: "Luxury Watch Strap",
    price: 89,
    image: "/luxury-brown-leather-watch-strap.jpg",
    category: "Watch Straps",
    isNew: true,
    colors: ["Brown", "Black", "Tan"],
  },
  {
    id: 4,
    name: "Leather Card Holder",
    price: 79,
    image: "/minimalist-brown-leather-card-holder.jpg",
    category: "Wallets",
    colors: ["Brown", "Black", "Burgundy"],
  },
  {
    id: 5,
    name: "Travel Document Holder",
    price: 129,
    image: "/leather-travel-document-passport-holder.jpg",
    category: "Travel",
    colors: ["Brown", "Black"],
  },
  {
    id: 6,
    name: "Leather Keychain",
    price: 39,
    originalPrice: 59,
    image: "/elegant-brown-leather-keychain-with-brass-hardware.jpg",
    category: "Keychains",
    colors: ["Brown", "Black", "Tan", "Navy"],
  },
  {
    id: 7,
    name: "Phone Case",
    price: 99,
    image: "/leather-accessories-wallets-belts-and-small-goods.jpg",
    category: "Tech",
    isNew: true,
    colors: ["Brown", "Black"],
  },
  {
    id: 8,
    name: "Leather Gloves",
    price: 199,
    image: "/mens-leather-accessories-briefcase-and-shoes.jpg",
    category: "Gloves",
    colors: ["Brown", "Black", "Cognac"],
  },
  {
    id: 9,
    name: "Premium Belt Collection",
    price: 179,
    image: "/premium-leather-belt-collection.jpg",
    category: "Belts",
    colors: ["Brown", "Black", "Cognac", "Tan"],
  },
  {
    id: 10,
    name: "Leather Crossbody Bag",
    price: 249,
    image: "/luxury-brown-leather-crossbody-bag-for-women.jpg",
    category: "Bags",
    isNew: true,
    colors: ["Brown", "Black", "Cognac"],
  },
  {
    id: 11,
    name: "Travel Duffle Bag",
    price: 399,
    image: "/luxury-brown-leather-travel-duffle-bag.jpg",
    category: "Travel",
    colors: ["Brown", "Black"],
  },
  {
    id: 12,
    name: "Evening Clutch",
    price: 159,
    image: "/elegant-brown-leather-evening-clutch-bag.jpg",
    category: "Bags",
    colors: ["Brown", "Black", "Burgundy"],
  },
]

export default function AccessoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Get unique categories
  const categories = ["All", ...Array.from(new Set(accessoryProducts.map(product => product.category)))]

  // Filter products based on selected category
  const filteredProducts = selectedCategory === "All" 
    ? accessoryProducts 
    : accessoryProducts.filter(product => product.category === selectedCategory)

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50">
      <Header />
      <div className="container mx-auto px-4 pt-6">
        <Button asChild variant="ghost" className="mb-4 text-foreground hover:bg-accent">
          <Link href="/shop">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <div className="relative h-[40vh] bg-gradient-to-r from-amber-900 via-orange-800 to-amber-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-[url('/leather-accessories-wallets-belts-and-small-goods.jpg')] bg-cover bg-center" />
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4 drop-shadow-2xl">
              Accessories Collection
            </h1>
            <p className="text-xl text-amber-100 mb-6 drop-shadow-lg">
              Fine leather accessories to complement your sophisticated lifestyle
            </p>
            <div className="flex items-center gap-4 text-amber-200">
              <span className="text-sm font-medium">Artisan Crafted</span>
              <span className="w-1 h-1 bg-amber-300 rounded-full"></span>
              <span className="text-sm font-medium">Premium Materials</span>
              <span className="w-1 h-1 bg-amber-300 rounded-full"></span>
              <span className="text-sm font-medium">Attention to Detail</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
                        <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Leather Accessories</h2>
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
        <div className={`grid gap-6 ${
          viewMode === "grid" 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" 
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
                viewMode === "list" ? "w-64 h-48 flex-shrink-0" : ""
              }`}>
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  width={300}
                  height={300}
                  className={`object-cover group-hover:scale-110 transition-transform duration-700 ${
                    viewMode === "list" ? "w-full h-full" : "w-full h-64"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.isNew && <Badge className="bg-orange-600 text-white shadow-lg text-xs">New</Badge>}
                  {product.originalPrice && (
                    <Badge variant="destructive" className="shadow-lg text-xs">
                      Sale
                    </Badge>
                  )}
                </div>

                {/* Wishlist Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white hover:bg-white/30 opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <Heart className="w-3 h-3" />
                </Button>

                {/* Quick Actions */}
                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                  <Link href={`/product/${product.name.toLowerCase().replace(/\s+/g, "-")}`}>
                    <Button
                      size="sm"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg backdrop-blur-md text-xs"
                    >
                      Request Availability
                    </Button>
                  </Link>
                </div>
              </div>

              <CardContent className={`p-4 ${viewMode === "list" ? "flex-1 flex flex-col justify-between" : ""}`}>
                <div>
                  <div className="mb-2">
                    <Badge variant="outline" className="text-xs text-muted-foreground border-border">
                      {product.category}
                    </Badge>
                  </div>

                  <h3 className={`font-serif font-semibold text-foreground mb-2 group-hover:text-primary transition-colors ${
                    viewMode === "list" ? "text-xl" : "text-base"
                  }`}>
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    {product.originalPrice ? (
                      <>
                      <span className={`font-bold text-foreground ${viewMode === "list" ? "text-xl" : "text-lg"}`}>
                        ${product.price}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                    </>
                  ) : (
                    <span className={`font-bold text-foreground ${viewMode === "list" ? "text-xl" : "text-lg"}`}>
                      ${product.price}
                    </span>
                  )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Colors:</span>
                    <div className="flex gap-1">
                      {product.colors.slice(0, 3).map((color) => (
                        <div
                          key={color}
                          className={`w-3 h-3 rounded-full border border-white shadow-sm ${
                            color === "Brown"
                              ? "bg-amber-800"
                              : color === "Black"
                                ? "bg-gray-900"
                                : color === "Cognac"
                                  ? "bg-amber-600"
                                  : color === "Navy"
                                    ? "bg-blue-900"
                                    : color === "Burgundy"
                                      ? "bg-red-900"
                                      : color === "Tan"
                                        ? "bg-amber-500"
                                        : "bg-gray-400"
                          }`}
                          title={color}
                        />
                      ))}
                      {product.colors.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{product.colors.length - 3}</span>
                      )}
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
      <Footer />
    </div>
  )
}
