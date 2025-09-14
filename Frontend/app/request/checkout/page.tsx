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
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { CheckCircle, Clock, Mail, Phone, MessageCircle } from "lucide-react"

export default function RequestCheckoutPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    // Customer Info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",

    // Shipping Address
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",

    // Contact Preferences
    contactMethod: "email",
    whatsappOptIn: false,

    // Additional Info
    notes: "",
    urgency: "standard",
  })

  const requestItems = [
    {
      id: 1,
      name: "Executive Leather Briefcase",
      variant: "Classic Brown",
      quantity: 1,
      image: "/luxury-brown-leather-briefcase.jpg",
    },
    {
      id: 2,
      name: "Premium Leather Wallet",
      variant: "Cognac",
      quantity: 2,
      image: "/premium-brown-leather-wallet.png",
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate request ID and redirect to status page
    const requestId = "RID" + Math.random().toString(36).substr(2, 9).toUpperCase()
    router.push(`/request/status/${requestId}`)
  }

  const totalItems = requestItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold mb-2">Request Checkout</h1>
            <p className="text-muted-foreground">
              Complete your request details. We'll confirm availability and contact you within 24 hours.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Fields */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+60 11-2542 7250"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="address">Street Address *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State/Province</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="postalCode">Postal Code *</Label>
                        <Input
                          id="postalCode"
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country *</Label>
                        <Select
                          value={formData.country}
                          onValueChange={(value) => setFormData({ ...formData, country: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MY">Malaysia</SelectItem>
                            <SelectItem value="SG">Singapore</SelectItem>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="GB">United Kingdom</SelectItem>
                            <SelectItem value="AU">Australia</SelectItem>
                            <SelectItem value="SA">Saudi Arabia</SelectItem>
                            <SelectItem value="AE">United Arab Emirates</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Contact Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Preferred Contact Method *</Label>
                      <Select
                        value={formData.contactMethod}
                        onValueChange={(value) => setFormData({ ...formData, contactMethod: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2" />
                              Email
                            </div>
                          </SelectItem>
                          <SelectItem value="phone">
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2" />
                              Phone Call
                            </div>
                          </SelectItem>
                          <SelectItem value="whatsapp">
                            <div className="flex items-center">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              WhatsApp
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="whatsapp"
                        checked={formData.whatsappOptIn}
                        onCheckedChange={(checked) => setFormData({ ...formData, whatsappOptIn: checked as boolean })}
                      />
                      <Label htmlFor="whatsapp" className="text-sm">
                        I agree to receive WhatsApp notifications about this request and future updates
                      </Label>
                    </div>

                    <div>
                      <Label htmlFor="urgency">Request Priority</Label>
                      <Select
                        value={formData.urgency}
                        onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard (24-48 hours)</SelectItem>
                          <SelectItem value="urgent">Urgent (within 12 hours)</SelectItem>
                          <SelectItem value="asap">ASAP (within 6 hours)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="notes">Special Requests or Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any specific requirements, size preferences, or questions about the items..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Request Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {requestItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.variant}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs">Qty: {item.quantity}</span>
                            <Badge variant="secondary" className="text-xs">
                              Request Price
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Items:</span>
                        <span className="font-semibold">{totalItems}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pricing:</span>
                        <span className="text-primary font-semibold">Upon Confirmation</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Process Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg">What Happens Next?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-primary-foreground font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Request Submitted</p>
                        <p className="text-xs text-muted-foreground">
                          You'll receive a confirmation email with your request ID
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock className="h-3 w-3" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Availability Check</p>
                        <p className="text-xs text-muted-foreground">We'll confirm stock and pricing within 24 hours</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-3 w-3" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Payment & Fulfillment</p>
                        <p className="text-xs text-muted-foreground">Complete payment to secure your items</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting Request..." : "Submit Request"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  )
}
