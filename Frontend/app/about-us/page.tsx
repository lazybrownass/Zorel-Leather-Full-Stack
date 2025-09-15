"use client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { Award, Users, Globe, Heart } from "lucide-react"
import { motion } from "@/lib/motion"

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
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-serif text-4xl sm:text-5xl font-bold mb-6"
          >
            About ZOREL LEATHER
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg sm:text-xl max-w-3xl mx-auto text-muted-foreground"
          >
            Crafting exceptional leather goods with passion, precision, and a commitment to timeless elegance. Every
            piece tells a story of dedication to the art of leather craftsmanship.
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  ZOREL LEATHER was born from a deep appreciation for the timeless art of leather craftsmanship. Founded
                  in 2018, we began with a simple yet ambitious vision: to create leather goods that embody both
                  traditional craftsmanship and contemporary elegance.
                </p>
                <p>
                  Our journey started in Kuala Lumpur, where we discovered a community of skilled artisans who shared
                  our passion for quality and attention to detail. Each craftsman brings decades of experience, using
                  techniques refined over generations.
                </p>
                <p>
                  What sets us apart is our commitment to personalized service. Rather than mass production, we create
                  pieces that are as unique as the individuals who carry them.
                </p>
                <p>
                  Today, ZOREL LEATHER serves discerning customers worldwide—from executives seeking the perfect
                  briefcase to fashion enthusiasts looking for a statement handbag.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative h-96 rounded-xl overflow-hidden shadow-lg"
            >
              <Image
                src="/elegant-brown-leather-handbag.jpg"
                alt="An artisan handcrafting a luxury leather handbag"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
              The principles that guide everything we do, from selecting materials to delivering the final product.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <Card className="text-center hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-serif text-lg font-semibold mb-3">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Craftsmanship Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative h-96 rounded-xl overflow-hidden shadow-lg"
            >
              <Image
                src="/luxury-mens-leather-goods-collection-hero-banner.jpg"
                alt="A curated collection of luxury men's leather goods"
                fill
                className="object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-3xl font-bold mb-6">The Art of Craftsmanship</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
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
                  The result is not just a product, but a work of art that improves with age—developing a unique patina
                  and becoming more personal with each use.
                </p>
              </div>
              <div className="mt-6">
                <Button asChild size="lg">
                  <Link href="/shop">Explore Our Collection</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4">Our Journey</h2>
            <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
              Key milestones in our commitment to excellence and growth.
            </p>
          </div>
          <div className="max-w-3xl mx-auto relative">
            <div className="border-l border-primary/30 pl-8 space-y-10">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="absolute -left-8 top-2 w-6 h-6 bg-primary rounded-full border-4 border-background" />
                  <h3 className="font-serif text-xl font-semibold">{milestone.year} — {milestone.title}</h3>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl font-bold mb-4">Experience ZOREL LEATHER</h2>
          <p className="text-lg max-w-2xl mx-auto text-muted-foreground mb-8">
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
