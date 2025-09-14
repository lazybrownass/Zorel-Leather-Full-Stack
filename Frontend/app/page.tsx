"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Star, Shield, Truck, HeadphonesIcon, Loader2, Clock, CheckCircle, Zap, Crown, Sparkles, Gift, MessageCircle, Instagram, Facebook, Twitter, Heart } from "lucide-react"
import { useProducts } from "@/hooks/use-api"
import { getHeroImages, getFeaturedImages } from "@/lib/images"

export default function HomePage() {
  // Fetch featured products from API
  const { data: featuredProductsResponse, loading: featuredLoading } = useProducts({
    is_featured: true,
    limit: 4
  })
  
  const featuredProducts = featuredProductsResponse?.data || []

  // Get hero images dynamically
  const heroImages = getHeroImages()
  const featuredImages = getFeaturedImages()

  const categories = [
    {
      name: "Men's Collection",
      description: "Sophisticated leather goods for the modern gentleman",
      image: heroImages[0] || "/mens-leather-accessories-briefcase-and-shoes.jpg",
      href: "/shop/men",
      items: "50+ Products",
      featured: "Briefcases, Wallets, Belts, Shoes"
    },
    {
      name: "Women's Collection",
      description: "Elegant handbags and accessories for the discerning woman",
      image: heroImages[1] || "/womens-leather-handbags-and-accessories.jpg",
      href: "/shop/women",
      items: "75+ Products",
      featured: "Handbags, Clutches, Totes, Accessories"
    },
    {
      name: "Accessories",
      description: "Premium leather accessories to complete your style",
      image: heroImages[2] || "/leather-accessories-wallets-belts-and-small-goods.jpg",
      href: "/shop/accessories",
      items: "30+ Products",
      featured: "Wallets, Belts, Keychains, Travel"
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Fashion Executive",
      content: "The quality of ZOREL LEATHER products is unmatched. My briefcase has been my trusted companion for three years and still looks brand new.",
      rating: 5,
      image: "/placeholder-user.jpg"
    },
    {
      name: "Michael Chen",
      role: "Business Owner",
      content: "Exceptional craftsmanship and attention to detail. Every piece tells a story of luxury and sophistication.",
      rating: 5,
      image: "/placeholder-user.jpg"
    },
    {
      name: "Emma Rodriguez",
      role: "Luxury Consultant",
      content: "ZOREL LEATHER represents the pinnacle of leather artistry. Their commitment to excellence is evident in every stitch.",
      rating: 5,
      image: "/placeholder-user.jpg"
    }
  ]


  const processSteps = [
    {
      step: "01",
      title: "Design Consultation",
      description: "Our master craftsmen work with you to understand your vision and requirements for the perfect leather piece.",
      icon: MessageCircle
    },
    {
      step: "02", 
      title: "Material Selection",
      description: "Choose from our curated selection of the world's finest leathers, each handpicked for quality and character.",
      icon: Sparkles
    },
    {
      step: "03",
      title: "Artisan Crafting",
      description: "Skilled artisans bring your vision to life using traditional techniques passed down through generations.",
      icon: Crown
    },
    {
      step: "04",
      title: "Quality Assurance",
      description: "Every piece undergoes rigorous quality checks to ensure it meets our exacting standards of excellence.",
      icon: CheckCircle
    }
  ]

  return (
    <div className="min-h-screen">
      <Header />

      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-amber-900">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImages[0] || "/luxury-mens-leather-goods-collection-hero-banner.jpg"}
            alt="ZOREL LEATHER luxury collection"
            fill
            className="object-cover scale-110 animate-slow-zoom"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
        </div>
        <div className="relative z-10 text-center text-white max-w-5xl mx-auto px-4">
          <div className="animate-fade-in-up">
            <h1 className="font-serif text-6xl md:text-8xl font-bold mb-6 text-white text-shadow drop-shadow-lg">
              Crafted for
              <span className="block text-amber-200 animate-pulse-slow drop-shadow-lg">Excellence</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 luxury-text text-white/95 text-shadow drop-shadow-md animate-fade-in-up animation-delay-300">
              Premium handcrafted leather goods. Each piece tells a story of exceptional craftsmanship and timeless
              elegance.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up animation-delay-600">
              <Button asChild size="lg" className="luxury-button px-8 py-4 text-lg">
                <Link href="/shop">
                  Shop Premium Leather
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-black/30 backdrop-blur-md text-white hover:bg-black/40 border-white/60 px-8 py-4 text-lg font-semibold"
              >
                <Link href="/request/cart">Request Availability</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>


      {/* Enhanced Features Section */}
      <section className="py-20 bg-gradient-to-br from-amber-50 via-white to-amber-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-5xl font-bold mb-6 text-amber-900 luxury-gradient-text">
              Why Choose ZOREL LEATHER
            </h2>
            <p className="text-xl text-amber-700/80 max-w-3xl mx-auto luxury-text">
              We don't just create leather goods; we craft heirlooms that will be treasured for generations. 
              Every detail matters, every stitch tells a story.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 luxury-card rounded-full flex items-center justify-center mx-auto mb-6 luxury-hover">
                <Star className="h-10 w-10 text-amber-900" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-3 text-amber-900">Premium Quality</h3>
              <p className="text-amber-700/80 luxury-text">
                Handcrafted from the finest leather materials sourced from the world's most prestigious tanneries. 
                Each hide is carefully selected for its unique character and superior quality.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 luxury-card rounded-full flex items-center justify-center mx-auto mb-6 luxury-hover">
                <Shield className="h-10 w-10 text-amber-900" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-3 text-amber-900">Lifetime Warranty</h3>
              <p className="text-amber-700/80 luxury-text">
                We stand behind our craftsmanship with confidence. Our lifetime warranty covers manufacturing 
                defects and ensures your investment is protected for years to come.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 luxury-card rounded-full flex items-center justify-center mx-auto mb-6 luxury-hover">
                <Truck className="h-10 w-10 text-amber-900" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-3 text-amber-900">Worldwide Shipping</h3>
              <p className="text-amber-700/80 luxury-text">
                Secure and insured delivery to your doorstep anywhere in the world. 
                Free shipping on orders over $200 with express options available.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 luxury-card rounded-full flex items-center justify-center mx-auto mb-6 luxury-hover">
                <HeadphonesIcon className="h-10 w-10 text-amber-900" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-3 text-amber-900">Personal Service</h3>
              <p className="text-amber-700/80 luxury-text">
                Dedicated concierge support for every customer. From initial consultation to after-sales care, 
                we're here to ensure your complete satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-5xl font-bold mb-6 text-amber-900 luxury-gradient-text">
              Explore Our Collections
            </h2>
            <p className="text-xl text-amber-700/80 max-w-3xl mx-auto luxury-text">
              Discover our carefully curated collections of premium leather goods, each designed to elevate your style
              and complement your sophisticated lifestyle.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {categories.map((category, index) => (
              <div
                key={category.name}
                className={`luxury-card group overflow-hidden rounded-2xl luxury-hover animate-fade-in-up animation-delay-${index * 200}`}
              >
                <div className="relative h-80 overflow-hidden">
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-serif text-2xl font-semibold text-amber-900">{category.name}</h3>
                    <Badge variant="outline" className="text-amber-700 border-amber-300">
                      {category.items}
                    </Badge>
                  </div>
                  <p className="text-amber-700/80 mb-4 luxury-text text-lg">{category.description}</p>
                  <p className="text-amber-600/70 mb-6 text-sm font-medium">{category.featured}</p>
                  <Button asChild className="luxury-button w-full py-3">
                    <Link href={category.href}>
                      Explore Collection
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-amber-50 via-white to-amber-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-5xl font-bold mb-6 text-amber-900 luxury-gradient-text">
              Featured Products
            </h2>
            <p className="text-xl text-amber-700/80 max-w-3xl mx-auto luxury-text">
              Handpicked selections from our master craftsmen. Each piece represents the pinnacle of leather artistry
              and timeless design.
            </p>
          </div>
          {featuredLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className={`luxury-card group overflow-hidden rounded-2xl luxury-hover animate-fade-in-up animation-delay-${index * 150}`}
                >
                  <div className="relative h-72 overflow-hidden">
                    <Image
                      src={product.images?.[0] || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <Badge className="absolute top-4 left-4 bg-amber-900/90 text-white backdrop-blur-sm">
                      {product.category}
                    </Badge>
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-xl font-semibold mb-3 line-clamp-2 text-amber-900">{product.name}</h3>
                    <p className="text-amber-800 font-semibold mb-4 text-lg">
                      {product.price ? `$${product.price}` : "Request Price"}
                    </p>
                    <Button asChild className="luxury-button w-full py-3">
                      <Link href={`/product/${product.slug}`}>Request Availability</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Button asChild size="lg" className="luxury-button px-10 py-4 text-lg">
              <Link href="/shop">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Our Craftsmanship Process */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-5xl font-bold mb-6 text-amber-900 luxury-gradient-text">
              The Art of Craftsmanship
            </h2>
            <p className="text-xl text-amber-700/80 max-w-3xl mx-auto luxury-text">
              Every ZOREL LEATHER piece is born from a meticulous process that combines traditional techniques 
              with modern innovation. Discover the journey from concept to creation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.step} className="text-center group animate-fade-in-up" style={{ animationDelay: `${index * 200}ms` }}>
                  <div className="relative mb-8">
                    <div className="w-24 h-24 luxury-card rounded-full flex items-center justify-center mx-auto luxury-hover bg-amber-50">
                      <Icon className="h-12 w-12 text-amber-900" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-4 text-amber-900">{step.title}</h3>
                  <p className="text-amber-700/80 luxury-text leading-relaxed">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-20 bg-gradient-to-br from-amber-50 via-white to-amber-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-5xl font-bold mb-6 text-amber-900 luxury-gradient-text">
              What Our Customers Say
            </h2>
            <p className="text-xl text-amber-700/80 max-w-3xl mx-auto luxury-text">
              Don't just take our word for it. Hear from our satisfied customers who have experienced 
              the ZOREL LEATHER difference firsthand.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.name} className="luxury-card p-8 text-center luxury-hover animate-fade-in-up" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-amber-700/80 luxury-text mb-6 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center justify-center space-x-3">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div className="text-left">
                    <p className="font-semibold text-amber-900">{testimonial.name}</p>
                    <p className="text-sm text-amber-600/70">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers & Services */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-5xl font-bold mb-6 text-amber-900 luxury-gradient-text">
              Exclusive Services & Offers
            </h2>
            <p className="text-xl text-amber-700/80 max-w-3xl mx-auto luxury-text">
              Experience luxury beyond the ordinary with our exclusive services and special offers 
              designed for the discerning customer.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="luxury-card p-8 text-center luxury-hover group">
              <div className="w-16 h-16 luxury-card rounded-full flex items-center justify-center mx-auto mb-6 bg-amber-50 group-hover:bg-amber-100 transition-colors">
                <Gift className="h-8 w-8 text-amber-900" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-4 text-amber-900">Custom Engraving</h3>
              <p className="text-amber-700/80 luxury-text mb-6">
                Personalize your leather goods with custom engraving. Add initials, names, or special messages 
                to make your piece truly unique.
              </p>
              <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                Learn More
              </Button>
            </div>
            
            <div className="luxury-card p-8 text-center luxury-hover group">
              <div className="w-16 h-16 luxury-card rounded-full flex items-center justify-center mx-auto mb-6 bg-amber-50 group-hover:bg-amber-100 transition-colors">
                <Zap className="h-8 w-8 text-amber-900" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-4 text-amber-900">Express Crafting</h3>
              <p className="text-amber-700/80 luxury-text mb-6">
                Need your leather goods in a hurry? Our express crafting service delivers premium quality 
                in record time without compromising on excellence.
              </p>
              <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                Learn More
              </Button>
            </div>
            
            <div className="luxury-card p-8 text-center luxury-hover group">
              <div className="w-16 h-16 luxury-card rounded-full flex items-center justify-center mx-auto mb-6 bg-amber-50 group-hover:bg-amber-100 transition-colors">
                <Heart className="h-8 w-8 text-amber-900" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-4 text-amber-900">Lifetime Care</h3>
              <p className="text-amber-700/80 luxury-text mb-6">
                Our lifetime care program includes free cleaning, conditioning, and minor repairs 
                to keep your leather goods looking pristine for years to come.
              </p>
              <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media & Community */}
      <section className="py-20 bg-gradient-to-br from-amber-50 via-white to-amber-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-5xl font-bold mb-6 text-amber-900 luxury-gradient-text">
              Join Our Community
            </h2>
            <p className="text-xl text-amber-700/80 max-w-3xl mx-auto luxury-text">
              Connect with fellow leather enthusiasts, share your ZOREL LEATHER stories, 
              and stay updated with our latest collections and craftsmanship insights.
            </p>
          </div>
          <div className="flex justify-center space-x-6 mb-12">
            <Button asChild variant="outline" size="lg" className="border-amber-300 text-amber-700 hover:bg-amber-50 px-8">
              <Link href="#" className="flex items-center">
                <Instagram className="h-5 w-5 mr-2" />
                Instagram
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-amber-300 text-amber-700 hover:bg-amber-50 px-8">
              <Link href="#" className="flex items-center">
                <Facebook className="h-5 w-5 mr-2" />
                Facebook
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-amber-300 text-amber-700 hover:bg-amber-50 px-8">
              <Link href="#" className="flex items-center">
                <Twitter className="h-5 w-5 mr-2" />
                Twitter
              </Link>
            </Button>
          </div>
          <div className="text-center">
            <p className="text-amber-700/70 luxury-text mb-6">
              Follow us for behind-the-scenes glimpses of our craftsmanship, styling tips, 
              and exclusive previews of new collections.
            </p>
            <Button asChild className="luxury-button px-8 py-3">
              <Link href="/about-us">
                Learn More About Our Story
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/luxury-brown-leather-briefcase.jpg')] opacity-10 bg-cover bg-center" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-5xl font-bold mb-6 text-shadow">Stay Connected</h2>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto luxury-text text-shadow">
              Be the first to know about new collections, exclusive offers, and craftsmanship stories from our atelier.
              Join our community of luxury leather enthusiasts and receive:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-200/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="h-6 w-6 text-amber-200" />
                </div>
                <h3 className="font-semibold text-amber-200 mb-2">Exclusive Offers</h3>
                <p className="text-amber-100/80 text-sm">Early access to sales and special promotions</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-200/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-6 w-6 text-amber-200" />
                </div>
                <h3 className="font-semibold text-amber-200 mb-2">New Collections</h3>
                <p className="text-amber-100/80 text-sm">First preview of our latest leather creations</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-200/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Crown className="h-6 w-6 text-amber-200" />
                </div>
                <h3 className="font-semibold text-amber-200 mb-2">Craftsmanship Stories</h3>
                <p className="text-amber-100/80 text-sm">Behind-the-scenes insights from our artisans</p>
              </div>
            </div>

            <div className="max-w-lg mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-xl text-amber-900 luxury-input text-lg"
              />
              <Button className="bg-amber-300 hover:bg-amber-200 text-amber-900 px-8 py-4 rounded-xl font-semibold text-lg luxury-hover">
                Subscribe
              </Button>
            </div>
            
            <p className="text-amber-100/70 text-sm mt-4">
              Join over 10,000 luxury leather enthusiasts. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
