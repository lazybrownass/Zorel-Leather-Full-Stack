import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { Award, Users, Globe, Heart } from "lucide-react"

export default function AboutUsPage() {
  const values = [
    {
      icon: Award,
      title: "Exceptional Craftsmanship",
      description:
        "Every piece is handcrafted by skilled artisans using traditional techniques passed down through generations.",
    },
    {
      icon: Heart,
      title: "Passion for Quality",
      description:
        "We source only the finest materials and take pride in creating products that stand the test of time.",
    },
    {
      icon: Users,
      title: "Personal Service",
      description:
        "Our unique request-before-purchase model ensures every customer receives personalized attention and care.",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description:
        "From our base in Malaysia, we serve discerning customers worldwide who appreciate luxury leather goods.",
    },
  ]

  const milestones = [
    {
      year: "2018",
      title: "Founded",
      description: "ZOREL LEATHER was established with a vision to create exceptional leather goods.",
    },
    {
      year: "2020",
      title: "Artisan Network",
      description: "Expanded our network of skilled craftsmen and established quality standards.",
    },
    {
      year: "2022",
      title: "International Expansion",
      description: "Began serving customers across Southeast Asia and the Middle East.",
    },
    {
      year: "2024",
      title: "Digital Innovation",
      description: "Launched our unique request-based shopping experience for exclusive service.",
    },
  ]

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl font-bold mb-4 text-foreground">About ZOREL LEATHER</h1>
          <p className="text-lg text-foreground max-w-3xl mx-auto luxury-text">
            Crafting exceptional leather goods with passion, precision, and a commitment to timeless elegance. Every
            piece tells a story of dedication to the art of leather craftsmanship.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl font-bold mb-6 text-foreground">Our Story</h2>
              <div className="space-y-4 text-foreground luxury-text">
                <p>
                  ZOREL LEATHER was born from a deep appreciation for the timeless art of leather craftsmanship. Founded
                  in 2018, we began with a simple yet ambitious vision: to create leather goods that embody both
                  traditional craftsmanship and contemporary elegance.
                </p>
                <p>
                  Our journey started in the vibrant city of Kuala Lumpur, where we discovered a community of skilled
                  artisans who shared our passion for quality and attention to detail. Each craftsman brings decades of
                  experience, using techniques that have been refined over generations.
                </p>
                <p>
                  What sets us apart is our commitment to personalized service. Rather than mass production, we believe
                  in creating pieces that are as unique as the individuals who carry them. Our request-based approach
                  ensures that every customer receives the attention and care they deserve.
                </p>
                <p>
                  Today, ZOREL LEATHER serves discerning customers worldwide, from busy executives seeking the perfect
                  briefcase to fashion enthusiasts looking for that statement handbag. Each piece we create carries with
                  it our dedication to excellence and our respect for the craft.
                </p>
              </div>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden">
              <Image
                src="/elegant-brown-leather-handbag.jpg"
                alt="Skilled craftsman working on leather goods"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4 text-foreground">Our Values</h2>
            <p className="text-lg text-foreground max-w-2xl mx-auto luxury-text">
              The principles that guide everything we do, from selecting materials to delivering the final product.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <Card key={index} className="text-center hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold mb-3 text-foreground">{value.title}</h3>
                    <p className="text-sm text-foreground luxury-text">{value.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Craftsmanship Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-96 rounded-lg overflow-hidden">
              <Image
                src="/luxury-mens-leather-goods-collection-hero-banner.jpg"
                alt="Collection of luxury leather goods"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="font-serif text-3xl font-bold mb-6 text-foreground">The Art of Craftsmanship</h2>
              <div className="space-y-4 text-foreground luxury-text">
                <p>
                  Every ZOREL LEATHER piece begins with the careful selection of premium materials. We source our
                  leather from renowned tanneries that share our commitment to quality and sustainability.
                </p>
                <p>
                  Our artisans employ time-honored techniques, from hand-cutting patterns to precision stitching. Each
                  stitch is placed with intention, each edge is finished with care, and every detail is considered in
                  the pursuit of perfection.
                </p>
                <p>
                  The result is not just a product, but a work of art that improves with age. Our leather goods develop
                  a unique patina over time, becoming more beautiful and personal with each use.
                </p>
              </div>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/shop">Explore Our Collection</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4 text-foreground">Our Journey</h2>
            <p className="text-lg text-foreground max-w-2xl mx-auto luxury-text">
              Key milestones in our commitment to excellence and growth.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-bold">{milestone.year}</span>
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="font-serif text-xl font-semibold mb-2 text-foreground">{milestone.title}</h3>
                    <p className="text-foreground luxury-text">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl font-bold mb-4 text-foreground">Experience ZOREL LEATHER</h2>
          <p className="text-lg text-foreground max-w-2xl mx-auto luxury-text mb-8">
            Discover the difference that true craftsmanship makes. Browse our collection or get in touch to discuss your
            specific needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/shop">Browse Collection</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact-us">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
