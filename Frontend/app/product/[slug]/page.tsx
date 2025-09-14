import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import Link from "next/link"
import { Heart, Share2, Star } from "lucide-react"
import { RequestModal } from "@/components/request-modal"

interface ProductPageProps {
  params: {
    slug: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  // In a real app, this would fetch product data based on the slug
  const product = {
    id: 1,
    name: "Executive Leather Briefcase",
    category: "Men",
    price: "Request Price",
    images: [
      "/luxury-brown-leather-briefcase-front-view.jpg",
      "/luxury-brown-leather-briefcase-side-view.jpg",
      "/luxury-brown-leather-briefcase-interior-view.jpg",
      "/luxury-brown-leather-briefcase-detail-view.jpg",
    ],
    description:
      "Crafted from premium full-grain leather, this executive briefcase combines timeless elegance with modern functionality. Each piece is handmade by our master craftsmen using traditional techniques passed down through generations.",
    features: [
      "Premium full-grain leather construction",
      "Hand-stitched with waxed thread",
      "Multiple interior compartments",
      "Laptop compartment fits up to 15 inches",
      "Brass hardware with antique finish",
      "Adjustable shoulder strap included",
    ],
    specifications: {
      Dimensions: "16 × 12 × 4 inches",
      Weight: "3.2 lbs",
      Material: "Full-grain leather",
      Hardware: "Antique brass",
      Lining: "Cotton canvas",
      Origin: "Handcrafted",
    },
    availability: "Request to confirm availability",
    variants: [
      { id: 1, name: "Classic Brown", color: "#8B4513" },
      { id: 2, name: "Cognac", color: "#A0522D" },
      { id: 3, name: "Black", color: "#000000" },
    ],
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-primary">
            Shop
          </Link>
          <span>/</span>
          <Link href={`/shop/${product.category.toLowerCase()}`} className="hover:text-primary">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg">
              <Image src={product.images[0] || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <div key={index} className="aspect-square relative overflow-hidden rounded-md cursor-pointer">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} view ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-2">{product.category}</Badge>
              <h1 className="font-serif text-3xl font-bold mb-4">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">(24 reviews)</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-primary mb-4">{product.price}</p>
              <p className="text-sm text-muted-foreground mb-6">{product.availability}</p>
            </div>

            <Separator />

            {/* Color Variants */}
            <div>
              <h3 className="font-semibold mb-3">Available Colors</h3>
              <div className="flex space-x-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    className="w-8 h-8 rounded-full border-2 border-border hover:border-primary transition-colors"
                    style={{ backgroundColor: variant.color }}
                    title={variant.name}
                  />
                ))}
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-3">
              <RequestModal product={product} />
              <div className="flex space-x-2">
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Product Info Tabs */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <p className="text-muted-foreground luxury-text">{product.description}</p>
              </TabsContent>
              <TabsContent value="features" className="mt-4">
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="specifications" className="mt-4">
                <div className="space-y-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium">{key}:</span>
                      <span className="text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
