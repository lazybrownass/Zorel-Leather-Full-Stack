import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import Link from "next/link"
import { CheckCircle, Download, Mail, Truck, Calendar } from "lucide-react"

interface ConfirmationPageProps {
  params: {
    orderId: string
  }
}

export default function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { orderId } = params

  // In a real app, this would fetch order data based on the orderId
  const order = {
    id: orderId,
    requestId: "RID123ABC456",
    orderNumber: "ZL-2024-001234",
    completedAt: "2024-01-16T14:30:00Z",
    estimatedDelivery: "2024-01-23T00:00:00Z",
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
    paymentMethod: "Visa ending in 1234",
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: order.currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="font-serif text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-lg text-muted-foreground mb-4">
              Thank you for your purchase. Your order has been confirmed.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm text-muted-foreground">
              <span>
                Order Number: <strong>{order.orderNumber}</strong>
              </span>
              <span className="hidden sm:inline">•</span>
              <span>
                Request ID: <strong>{order.requestId}</strong>
              </span>
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Order Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.variant}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm">Quantity: {item.quantity}</span>
                          <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Truck className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">{order.customer.name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Estimated Delivery</p>
                      <p className="text-sm text-muted-foreground">{formatDate(order.estimatedDelivery)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">What Happens Next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-primary-foreground font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Order Confirmation</p>
                      <p className="text-xs text-muted-foreground">You'll receive an email confirmation shortly</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-primary-foreground font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Handcrafting Process</p>
                      <p className="text-xs text-muted-foreground">Our artisans will begin crafting your items</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Shipping & Delivery</p>
                      <p className="text-xs text-muted-foreground">Tracking information will be sent when shipped</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                      <span>Total Paid:</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="text-sm">
                    <p className="font-medium mb-1">Payment Method</p>
                    <p className="text-muted-foreground">{order.paymentMethod}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-3">
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Invoice (PDF)
                </Button>

                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/account/orders">View Order History</Link>
                </Button>

                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </div>

              {/* Contact Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <a href="mailto:support@zorelleather.com" className="hover:text-primary">
                        support@zorelleather.com
                      </a>
                    </div>
                  </div>

                  <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                    <Link href="/contact-us">Contact Support</Link>
                  </Button>
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
