"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Package, Truck, Mail, Phone, MessageCircle } from "lucide-react"
import { apiClient } from "@/lib/api"

export default function OrderConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      loadOrder()
    } else {
      setLoading(false)
    }
  }, [orderId])

  const loadOrder = async () => {
    try {
      const orderData = await apiClient.getOrder(orderId!)
      setOrder(orderData)
    } catch (err) {
      console.error("Error loading order:", err)
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="font-serif text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-lg text-muted-foreground">
              Thank you for your order. We'll process and ship your items as soon as possible.
            </p>
            {order && (
              <p className="text-sm text-muted-foreground mt-2">
                Order ID: {order.id?.slice(-8).toUpperCase()}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order?.items?.map((item: any, index: number) => (
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
                    <p className="font-medium">{order?.shipping_address?.name}</p>
                    <p>{order?.shipping_address?.street}</p>
                    <p>
                      {order?.shipping_address?.city}, {order?.shipping_address?.state} {order?.shipping_address?.zip_code}
                    </p>
                    <p>{order?.shipping_address?.country}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Order Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Payment Confirmed</p>
                      <p className="text-xs text-muted-foreground">Your payment has been processed successfully</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Package className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Processing</p>
                      <p className="text-xs text-muted-foreground">We're preparing your order for shipment</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Truck className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Shipped</p>
                      <p className="text-xs text-muted-foreground">Your order is on its way</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Delivered</p>
                      <p className="text-xs text-muted-foreground">Your order has been delivered</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary & Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${order?.subtotal?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>${order?.shipping_cost?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${order?.tax?.toFixed(2) || '0.00'}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>${order?.total?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">What's Next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm space-y-2">
                    <p>• You'll receive an email confirmation shortly</p>
                    <p>• We'll process your order within 1-2 business days</p>
                    <p>• You'll get tracking information once shipped</p>
                    <p>• Expected delivery: 5-7 business days</p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/account/orders')} 
                  className="w-full"
                >
                  View My Orders
                </Button>
                
                <Button 
                  onClick={() => router.push('/shop')} 
                  variant="outline" 
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Email Support</p>
                      <a href="mailto:support@zorelleather.com" className="text-xs text-primary hover:underline">
                        support@zorelleather.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Phone Support</p>
                      <a href="tel:+601125427250" className="text-xs text-primary hover:underline">
                        +60 11-2542 7250
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">WhatsApp</p>
                      <a href="https://wa.me/601125427250" className="text-xs text-primary hover:underline">
                        Chat with us
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
