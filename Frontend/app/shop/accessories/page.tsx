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
    image: "/placeholder.svg?height=400&width=400",
    category: "Tech",
    isNew: true,
    colors: ["Brown", "Black"],
  },
  {
    id: 8,
    name: "Leather Gloves",
    price: 199,
    image: "/placeholder.svg?height=400&width=400",
    category: "Gloves",
    colors: ["Brown", "Black", "Cognac"],
  },
]

export default function AccessoriesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50/30">
      <div className="container mx-auto px-4 pt-6">
        <Button asChild variant="ghost" className="mb-4 text-amber-800 hover:bg-amber-50">
          <Link href="/shop">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <div className="relative h-[40vh] bg-gradient-to-r from-amber-900 via-orange-800 to-amber-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200')] bg-cover bg-center" />
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
            <h2 className="text-2xl font-serif font-bold text-amber-900 mb-2">Leather Accessories</h2>
            <p className="text-amber-700">{accessoryProducts.length} exclusive pieces available for request</p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="border-amber-200 text-amber-800 hover:bg-amber-50 bg-transparent"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <div className="flex border border-amber-200 rounded-lg overflow-hidden">
              <Button variant="ghost" size="sm" className="bg-amber-100 text-amber-800">
                <Grid className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-amber-600 hover:bg-amber-50">
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Badge variant="default" className="bg-amber-800 hover:bg-amber-900 text-white px-4 py-2">
            All Items
          </Badge>
          <Badge
            variant="outline"
            className="border-amber-300 text-amber-800 hover:bg-amber-50 px-4 py-2 cursor-pointer"
          >
            Wallets
          </Badge>
          <Badge
            variant="outline"
            className="border-amber-300 text-amber-800 hover:bg-amber-50 px-4 py-2 cursor-pointer"
          >
            Belts
          </Badge>
          <Badge
            variant="outline"
            className="border-amber-300 text-amber-800 hover:bg-amber-50 px-4 py-2 cursor-pointer"
          >
            Watch Straps
          </Badge>
          <Badge
            variant="outline"
            className="border-amber-300 text-amber-800 hover:bg-amber-50 px-4 py-2 cursor-pointer"
          >
            Travel
          </Badge>
          <Badge
            variant="outline"
            className="border-amber-300 text-amber-800 hover:bg-amber-50 px-4 py-2 cursor-pointer"
          >
            Tech
          </Badge>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {accessoryProducts.map((product) => (
            <Card
              key={product.id}
              className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-sm"
            >
              <div className="relative overflow-hidden">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
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
                      className="w-full bg-amber-800 hover:bg-amber-900 text-white shadow-lg backdrop-blur-md text-xs"
                    >
                      Request Availability
                    </Button>
                  </Link>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="mb-2">
                  <Badge variant="outline" className="text-xs text-amber-700 border-amber-300">
                    {product.category}
                  </Badge>
                </div>

                <h3 className="font-serif font-semibold text-base text-amber-900 mb-2 group-hover:text-amber-800 transition-colors">
                  {product.name}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  {product.originalPrice ? (
                    <>
                      <span className="text-lg font-bold text-amber-800">${product.price}</span>
                      <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-amber-800">${product.price}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-700">Colors:</span>
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
                      <span className="text-xs text-amber-600">+{product.colors.length - 3}</span>
                    )}
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
            className="border-amber-300 text-amber-800 hover:bg-amber-50 px-8 bg-transparent"
          >
            Load More Products
          </Button>
        </div>
      </div>
    </div>
  )
}
