"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Phone, Mail, Clock, MessageCircle, CheckCircle } from "lucide-react"

export default function ContactUsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In a real app, this would send to POST /api/support/contact
    console.log("Contact form submitted:", formData)

    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="font-serif text-3xl font-bold mb-4 text-foreground">Thank You!</h1>
            <p className="text-lg text-foreground mb-6">
              We've received your message and will reply within 24 hours on business days.
            </p>
            <div className="space-y-2 text-sm text-foreground mb-8">
              <p>For urgent matters, you can also reach us at:</p>
              <div className="flex justify-center space-x-6">
                <a href="tel:+601125427250" className="flex items-center hover:text-primary text-foreground">
                  <Phone className="h-4 w-4 mr-1" />
                  +60 11-2542 7250
                </a>
                <a href="https://wa.me/601125427250" className="flex items-center hover:text-primary text-foreground">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  WhatsApp
                </a>
              </div>
            </div>
            <Button onClick={() => setIsSubmitted(false)}>Send Another Message</Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl font-bold mb-4 text-foreground">Contact Us</h1>
          <p className="text-lg text-foreground max-w-2xl mx-auto luxury-text">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-foreground">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1 text-foreground">Address</h3>
                    <p className="text-sm text-foreground">Kuala Lumpur, Malaysia</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1 text-foreground">Phone</h3>
                    <a href="tel:+601125427250" className="text-sm text-foreground hover:text-primary">
                      +60 11-2542 7250
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1 text-foreground">Email</h3>
                    <a href="mailto:support@zorelleather.com" className="text-sm text-foreground hover:text-primary">
                      support@zorelleather.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MessageCircle className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1 text-foreground">WhatsApp</h3>
                    <a
                      href="https://wa.me/601125427250"
                      className="text-sm text-foreground hover:text-primary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Chat with us on WhatsApp
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1 text-foreground">Business Hours</h3>
                    <div className="text-sm text-foreground space-y-1">
                      <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p>Saturday: 10:00 AM - 4:00 PM</p>
                      <p>Sunday: Closed</p>
                      <p className="text-xs mt-2">(Malaysia Time - GMT+8)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-foreground">Quick Response</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground mb-4">
                  For the fastest response, especially for urgent requests or product inquiries, we recommend using
                  WhatsApp or calling us directly.
                </p>
                <div className="space-y-2">
                  <Button asChild className="w-full bg-transparent" variant="outline">
                    <a href="https://wa.me/601125427250" target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp Us
                    </a>
                  </Button>
                  <Button asChild className="w-full bg-transparent" variant="outline">
                    <a href="tel:+601125427250">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-foreground">Send us a Message</CardTitle>
                <p className="text-foreground">Fill out the form below and we'll get back to you within 24 hours.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-foreground">
                        Name *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                        minLength={2}
                        maxLength={100}
                        pattern="[A-Za-z\s]+"
                        title="Please enter a valid name (letters and spaces only)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-foreground">
                        Phone (optional)
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+60 11-2542 7250"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location" className="text-foreground">
                        Location & Country *
                      </Label>
                      <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="malaysia">Malaysia</SelectItem>
                          <SelectItem value="singapore">Singapore</SelectItem>
                          <SelectItem value="indonesia">Indonesia</SelectItem>
                          <SelectItem value="thailand">Thailand</SelectItem>
                          <SelectItem value="philippines">Philippines</SelectItem>
                          <SelectItem value="saudi-arabia">Saudi Arabia</SelectItem>
                          <SelectItem value="uae">United Arab Emirates</SelectItem>
                          <SelectItem value="qatar">Qatar</SelectItem>
                          <SelectItem value="kuwait">Kuwait</SelectItem>
                          <SelectItem value="bahrain">Bahrain</SelectItem>
                          <SelectItem value="united-states">United States</SelectItem>
                          <SelectItem value="united-kingdom">United Kingdom</SelectItem>
                          <SelectItem value="canada">Canada</SelectItem>
                          <SelectItem value="australia">Australia</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-foreground">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject" className="text-foreground">
                      Subject *
                    </Label>
                    <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="order-support">Order Support</SelectItem>
                        <SelectItem value="product-question">Product Question</SelectItem>
                        <SelectItem value="wholesale">Wholesale Inquiry</SelectItem>
                        <SelectItem value="custom-order">Custom Order Request</SelectItem>
                        <SelectItem value="shipping">Shipping & Delivery</SelectItem>
                        <SelectItem value="return">Returns & Exchanges</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-foreground">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      required
                      minLength={20}
                      rows={6}
                      placeholder="Please provide as much detail as possible about your inquiry..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">Minimum 20 characters required</p>
                  </div>

                  <div className="text-sm text-foreground bg-muted p-4 rounded-lg">
                    <p className="mb-2">
                      <strong>Privacy Notice:</strong> Your information will be used solely to respond to your inquiry.
                      We do not share your details with third parties.
                    </p>
                    <p>
                      By submitting this form, you agree to our{" "}
                      <a href="/privacy-policy" className="text-primary hover:underline">
                        Privacy Policy
                      </a>{" "}
                      and{" "}
                      <a href="/terms-of-service" className="text-primary hover:underline">
                        Terms of Service
                      </a>
                      .
                    </p>
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
