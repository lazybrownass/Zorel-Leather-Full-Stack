"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { CreditCard, Shield, Clock } from "lucide-react"

interface PaymentPageProps {
  params: {
    orderId: string
  }
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const router = useRouter()
  const { orderId } = params
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")

  // In a real app, this would fetch order data based on the orderId
  const order = {
    id: orderId,
    requestId: "RID123ABC456",
    validUntil: "2024-01-17T10:30:00Z",
    items: [
      {
        id: 1,
        name: "Executive Leather Briefcase",
        variant: "Classic Brown",
        quantity: 1,
        price: 450.0,
        image: "/luxury-brown-leather-briefcase.jpg",
      },
      {
        id: 2,
        name: "Premium Leather Wallet",
        variant: "Cognac",
        quantity: 2,
        price: 120.0,
        image: "/premium-brown-leather-wallet.png",
      },
    ],
    subtotal: 690.0,
    shipping: 25.0,
    tax: 71.58,
    total: 786.58,
    currency: "USD",
    customer: {
      name: "John Doe",
      email: "john@example.com",
      address: "123 Main St, Kuala Lumpur, Malaysia",
    },
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Redirect to confirmation page
    router.push(`/order/confirmation/${orderId}`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: order.currency,
    }).format(amount)
  }

  const getTimeRemaining = () => {
    const now = new Date()
    const validUntil = new Date(order.validUntil)
    const diff = validUntil.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold mb-2">Complete Payment</h1>
            <p className="text-muted-foreground">
              Order ID: {orderId} • Request ID: {order.requestId}
            </p>
          </div>

          {/* Payment Validity Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800">Payment Link Valid Until</h3>
                <p className="text-yellow-700 text-sm">
                  This payment link expires in <strong>{getTimeRemaining()}</strong>. Complete payment now to secure
                  your items.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handlePayment}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Payment Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`p-4 border rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                          paymentMethod === "card"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <CreditCard className="h-4 w-4" />
                        <span className="text-sm font-medium">Credit Card</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("paypal")}
                        className={`p-4 border rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                          paymentMethod === "paypal"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="w-4 h-4 bg-blue-600 rounded" />
                        <span className="text-sm font-medium">PayPal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("bank")}
                        className={`p-4 border rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                          paymentMethod === "bank"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="w-4 h-4 bg-green-600 rounded" />
                        <span className="text-sm font-medium">Bank Transfer</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* Credit Card Form */}
                {paymentMethod === "card" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-serif">Card Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input id="expiry" placeholder="MM/YY" required />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input id="cvv" placeholder="123" required />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input id="cardName" placeholder="John Doe" required />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Billing Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Billing Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <input type="checkbox" id="sameAsShipping" defaultChecked />
                      <Label htmlFor="sameAsShipping" className="text-sm">
                        Same as shipping address
                      </Label>
                    </div>
                    <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                      <p className="font-medium">{order.customer.name}</p>
                      <p>{order.customer.address}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Notice */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Your payment information is encrypted and secure</span>
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {order.items.map((item) => (
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
                            <span className="text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>{formatCurrency(order.shipping)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{formatCurrency(order.tax)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-base">
                        <span>Total:</span>
                        <span>{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" size="lg" className="w-full" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay {formatCurrency(order.total)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  )
}
