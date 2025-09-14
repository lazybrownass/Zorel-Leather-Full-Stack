"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, CreditCard, Shield, Clock, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api"

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (orderId) {
      loadOrder()
    } else {
      setError("No order ID provided")
      setLoading(false)
    }
  }, [orderId])

  const loadOrder = async () => {
    try {
      const orderData = await apiClient.getOrder(orderId!)
      setOrder(orderData)
    } catch (err) {
      setError("Failed to load order details")
      console.error("Error loading order:", err)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!order) return
    
    setProcessing(true)
    setError(null)
    
    try {
      // Create payment intent
      const paymentIntent = await apiClient.createPaymentIntent(order.id)
      
      // In a real implementation, you would integrate with Stripe Elements here
      // For now, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect to confirmation page
      router.push(`/order/confirmation?orderId=${order.id}`)
      
    } catch (err) {
      setError("Payment processing failed. Please try again.")
      console.error("Payment error:", err)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p>Loading order details...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="font-serif text-2xl font-bold mb-4">Payment Error</h1>
            <p className="text-muted-foreground mb-6">{error || "Order not found"}</p>
            <Button onClick={() => router.push('/account/orders')}>
              View My Orders
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (order.status !== 'confirmed') {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-serif text-2xl font-bold mb-4">Order Not Ready for Payment</h1>
            <p className="text-muted-foreground mb-6">
              This order is not yet confirmed and ready for payment. Please wait for confirmation from our team.
            </p>
            <Button onClick={() => router.push('/account/orders')}>
              View My Orders
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold mb-2">Complete Payment</h1>
            <p className="text-muted-foreground">
              Your order has been confirmed. Complete your payment to proceed with shipping.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.items?.map((item: any, index: number) => (
                    <div key={index} className="flex gap-4">
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={item.product_image || "/placeholder.svg"}
                          alt={item.product_name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Price: ${item.price?.toFixed(2) || 'TBD'}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p className="font-medium">{order.shipping_address?.name}</p>
                    <p>{order.shipping_address?.street}</p>
                    <p>
                      {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip_code}
                    </p>
                    <p>{order.shipping_address?.country}</p>
                  </div>
                </CardContent>
              </Card>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Payment Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${order.subtotal?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>${order.shipping_cost?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${order.tax?.toFixed(2) || '0.00'}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>${order.total?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <CreditCard className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-medium">Credit/Debit Card</p>
                      <p className="text-sm text-muted-foreground">Secure payment via Stripe</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Your payment information is secure and encrypted</span>
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={handlePayment} 
                size="lg" 
                className="w-full" 
                disabled={processing}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay ${order.total?.toFixed(2) || '0.00'}
                  </>
                )}
              </Button>

              <div className="text-xs text-muted-foreground text-center">
                <p>By completing this payment, you agree to our Terms of Service and Privacy Policy.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
