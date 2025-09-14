"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ShoppingBag, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/hooks/use-api"
import { getUserFriendlyErrorMessage } from "@/lib/error-utils"
import Link from "next/link"

interface Product {
  id: number
  name: string
  variants?: Array<{ id: number; name: string; color: string }>
}

interface RequestModalProps {
  product: Product
}

export function RequestModal({ product }: RequestModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const { isAuthenticated, user } = useAuth()
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    variant: "",
    quantity: "1",
    notes: "",
    contactMethod: "email",
    whatsappOptIn: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      if (!isAuthenticated) {
        setSubmitError("Please log in to submit a request")
        return
      }

      // Validate that price is a valid number
      const rawPrice = (product as any).price || (product as any).original_price || 0
      // Remove currency symbols and convert to number
      const cleanPrice = String(rawPrice).replace(/[$,]/g, '')
      const finalPrice = Number(cleanPrice) || 0
      
      if (isNaN(finalPrice) || finalPrice <= 0) {
        throw new Error(`Invalid product price: ${rawPrice}. Please contact support.`)
      }

      // Create order data
      const orderData = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        items: [{
          product_id: product.id.toString(),
          quantity: parseInt(formData.quantity) || 1,
          price: finalPrice
        }],
        shipping_address: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          street: "To be provided",
          city: "To be provided", 
          state: "To be provided",
          zip_code: "To be provided",
          country: "To be provided"
        },
        shipping_cost: 0.0,
        notes: `Product Request: ${product.name}\nVariant: ${formData.variant}\nContact Method: ${formData.contactMethod}\nWhatsApp Opt-in: ${formData.whatsappOptIn ? 'Yes' : 'No'}`
      }

      console.log("Order data being sent:", orderData)
      console.log("Product data:", product)
      console.log("Form data:", formData)
      console.log("Product ID:", product.id)
      console.log("Product ID type:", typeof product.id)
      console.log("Product price type:", typeof (product as any).price)
      console.log("Product price value:", (product as any).price)
      console.log("Raw price:", rawPrice)
      console.log("Clean price:", cleanPrice)
      console.log("Final price value:", finalPrice)
      console.log("Quantity type:", typeof formData.quantity)
      console.log("Parsed quantity:", parseInt(formData.quantity) || 1)

      // Submit the order
      const response = await apiClient.createOrder(orderData)
      
      setSubmitSuccess(true)
      setTimeout(() => {
        setIsOpen(false)
        setSubmitSuccess(false)
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          variant: "",
          quantity: "1",
          notes: "",
          contactMethod: "email",
          whatsappOptIn: false,
        })
      }, 2000)
      
    } catch (error: any) {
      console.error("Error submitting request:", error)
      setSubmitError(getUserFriendlyErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          <ShoppingBag className="mr-2 h-4 w-4" />
          Request this item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Item</DialogTitle>
          <DialogDescription>
            Submit a request for "{product.name}". We'll confirm availability and contact you within 24 hours.
          </DialogDescription>
        </DialogHeader>
        
        {!isAuthenticated && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <p className="text-sm text-yellow-800">
                  You need to be logged in to submit a request.
                </p>
                <Link href="/auth/login" className="text-sm text-yellow-600 hover:text-yellow-700 underline">
                  Click here to log in
                </Link>
              </div>
            </div>
          </div>
        )}

        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <div className="h-5 w-5 text-green-600 mr-2">✓</div>
              <p className="text-sm text-green-800">
                Request submitted successfully! We'll contact you within 24 hours.
              </p>
            </div>
          </div>
        )}

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          {product.variants && (
            <div>
              <Label htmlFor="variant">Color/Variant *</Label>
              <Select value={formData.variant} onValueChange={(value) => setFormData({ ...formData, variant: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id.toString()}>
                      {variant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Select value={formData.quantity} onValueChange={(value) => setFormData({ ...formData, quantity: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any specific requirements or questions..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div>
            <Label>Preferred Contact Method</Label>
            <Select
              value={formData.contactMethod}
              onValueChange={(value) => setFormData({ ...formData, contactMethod: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
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
              I agree to receive WhatsApp notifications about this request
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isAuthenticated || isSubmitting || submitSuccess}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
