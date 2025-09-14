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
import { useRouter } from "next/navigation"
import { CheckCircle, Clock, XCircle, Mail, Phone, MessageCircle, Package, Truck } from "lucide-react"
import { apiClient } from "@/lib/api"

interface RequestStatusPageProps {
  params: {
    requestId: string
  }
}

export default function RequestStatusPage({ params }: RequestStatusPageProps) {
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadOrder()
  }, [params.requestId])

  const loadOrder = async () => {
    try {
      // In a real implementation, you would have a specific endpoint for request status
      // For now, we'll simulate loading order data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock order data - in production this would come from the API
      const mockOrder = {
        id: params.requestId,
        status: 'pending_confirmation',
        items: [
          {
            product_name: "Executive Leather Briefcase",
            product_image: "/luxury-brown-leather-briefcase.jpg",
            quantity: 1,
            price: 299.99
          }
        ],
        total: 299.99,
        created_at: new Date().toISOString(),
        notes: "Please confirm availability and pricing"
      }
      
      setOrder(mockOrder)
    } catch (err) {
      setError("Failed to load request status")
      console.error("Error loading order:", err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_confirmation':
        return <Clock className="h-6 w-6 text-yellow-500" />
      case 'confirmed':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'rejected':
        return <XCircle className="h-6 w-6 text-red-500" />
      case 'paid':
        return <Package className="h-6 w-6 text-blue-500" />
      case 'shipped':
        return <Truck className="h-6 w-6 text-purple-500" />
      default:
        return <Clock className="h-6 w-6 text-gray-500" />
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending_confirmation':
        return {
          title: "Request Submitted",
          message: "We've received your request and are checking availability with our suppliers. We'll contact you within 24 hours.",
          color: "text-yellow-600"
        }
      case 'confirmed':
        return {
          title: "Request Confirmed",
          message: "Great news! Your items are available. Please complete your payment to proceed with shipping.",
          color: "text-green-600"
        }
      case 'rejected':
        return {
          title: "Request Not Available",
          message: "We're sorry, but the requested items are not currently available. Please browse our other products.",
          color: "text-red-600"
        }
      case 'paid':
        return {
          title: "Payment Received",
          message: "Thank you! Your payment has been processed and we're preparing your order for shipment.",
          color: "text-blue-600"
        }
      case 'shipped':
        return {
          title: "Order Shipped",
          message: "Your order is on its way! You'll receive tracking information shortly.",
          color: "text-purple-600"
        }
      default:
        return {
          title: "Processing",
          message: "We're processing your request. Please check back later for updates.",
          color: "text-gray-600"
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p>Loading request status...</p>
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
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="font-serif text-2xl font-bold mb-4">Request Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || "The requested order could not be found."}</p>
            <Button onClick={() => router.push('/shop')}>
              Browse Products
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const statusInfo = getStatusMessage(order.status)

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold mb-2">Request Status</h1>
            <p className="text-muted-foreground">
              Track the status of your request: {params.requestId}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Status Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif flex items-center space-x-3">
                    {getStatusIcon(order.status)}
                    <span className={statusInfo.color}>{statusInfo.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{statusInfo.message}</p>
                  
                  {order.status === 'confirmed' && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your items are ready! Complete your payment to secure your order.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {order.status === 'rejected' && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        Unfortunately, the requested items are not available at this time.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Requested Items</CardTitle>
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

              {order.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Special Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{order.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Actions & Timeline */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Request Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Request Submitted</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-start space-x-3 ${order.status === 'pending_confirmation' ? 'opacity-50' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      order.status === 'pending_confirmation' ? 'bg-muted' : 'bg-green-500'
                    }`}>
                      <Clock className={`h-3 w-3 ${order.status === 'pending_confirmation' ? 'text-muted-foreground' : 'text-white'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Availability Check</p>
                      <p className="text-xs text-muted-foreground">
                        {order.status === 'pending_confirmation' ? 'In progress...' : 'Completed'}
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-start space-x-3 ${['pending_confirmation', 'confirmed'].includes(order.status) ? 'opacity-50' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      ['pending_confirmation', 'confirmed'].includes(order.status) ? 'bg-muted' : 'bg-green-500'
                    }`}>
                      <Package className={`h-3 w-3 ${['pending_confirmation', 'confirmed'].includes(order.status) ? 'text-muted-foreground' : 'text-white'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Payment & Processing</p>
                      <p className="text-xs text-muted-foreground">
                        {order.status === 'confirmed' ? 'Ready for payment' : 
                         ['paid', 'shipped'].includes(order.status) ? 'Completed' : 'Pending'}
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-start space-x-3 ${!['shipped', 'delivered'].includes(order.status) ? 'opacity-50' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      !['shipped', 'delivered'].includes(order.status) ? 'bg-muted' : 'bg-green-500'
                    }`}>
                      <Truck className={`h-3 w-3 ${!['shipped', 'delivered'].includes(order.status) ? 'text-muted-foreground' : 'text-white'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Shipping</p>
                      <p className="text-xs text-muted-foreground">
                        {order.status === 'shipped' ? 'In transit' : 
                         order.status === 'delivered' ? 'Delivered' : 'Pending'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {order.status === 'confirmed' && (
                  <Button 
                    onClick={() => router.push(`/order/payment?orderId=${order.id}`)} 
                    className="w-full"
                  >
                    Complete Payment
                  </Button>
                )}
                
                <Button 
                  onClick={() => router.push('/shop')} 
                  variant="outline" 
                  className="w-full"
                >
                  Browse More Products
                </Button>
                
                <Button 
                  onClick={() => router.push('/account/orders')} 
                  variant="outline" 
                  className="w-full"
                >
                  View All Orders
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