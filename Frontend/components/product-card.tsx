"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingBag } from "lucide-react"
import { useCart } from "@/contexts/app-context"
import { useWishlist } from "@/hooks/use-api"
import { Product } from "@/lib/types"
import { generateProductImageReference } from "@/lib/images"
import { toast } from "sonner"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  // Generate image reference using the new image system
  const imageRef = generateProductImageReference(product)

  const handleRequestItem = () => {
    addToCart(product, 1)
    toast.success("Item added to request list! We'll check availability and contact you within 24 hours.")
  }

  const handleWishlistToggle = async () => {
    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id)
        toast.success("Removed from wishlist")
      } else {
        await addToWishlist(product.id)
        toast.success("Added to wishlist")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update wishlist")
    }
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={imageRef.src}
          alt={imageRef.alt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
        <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground">{product.category}</Badge>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-white/80 hover:bg-white"
          onClick={handleWishlistToggle}
        >
          <Heart 
            className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
          />
        </Button>
      </div>
      <CardContent className="p-4">
        <h3 className="font-serif text-lg font-semibold mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-primary font-semibold mb-2">
          {product.price ? `$${product.price}` : "Request Price"}
        </p>
        {product.is_new && (
          <Badge variant="secondary" className="mb-2">New</Badge>
        )}
        {product.is_on_sale && (
          <Badge variant="destructive" className="mb-2">Sale</Badge>
        )}
        <div className="space-y-2">
          <Button onClick={handleRequestItem} className="w-full">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Request This Item
          </Button>
          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href={`/product/${product.slug}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
