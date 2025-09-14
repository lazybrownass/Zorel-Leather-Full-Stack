import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Truck, Clock, MapPin, Shield } from "lucide-react"
import Link from "next/link"

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50/30">
      <div className="container mx-auto px-4 py-12">
        {/* Back Navigation */}
        <Button asChild variant="ghost" className="mb-8 text-amber-800 hover:bg-amber-50">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Truck className="w-8 h-8 text-amber-800 mr-3" />
            <h1 className="text-4xl font-serif font-bold text-amber-900">Shipping Policy</h1>
          </div>
          <p className="text-lg text-amber-700 max-w-2xl mx-auto">
            Learn about our shipping methods, delivery times, and policies for ZOREL LEATHER products
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Methods */}
          <Card className="border-amber-200 shadow-lg">
            <CardHeader className="bg-amber-50">
              <CardTitle className="text-amber-900 font-serif flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Shipping Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="border-b border-amber-100 pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-amber-800">Standard Shipping</h3>
                    <Badge variant="outline" className="border-amber-300 text-amber-800">
                      Free over $200
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground/80 mb-2">5-7 business days</p>
                  <p className="text-sm text-foreground/70">$15 for orders under $200</p>
                </div>

                <div className="border-b border-amber-100 pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-amber-800">Express Shipping</h3>
                    <Badge className="bg-amber-800 text-white">$25</Badge>
                  </div>
                  <p className="text-sm text-foreground/80 mb-2">2-3 business days</p>
                  <p className="text-sm text-foreground/70">Available for most locations</p>
                </div>

                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-amber-800">Overnight Shipping</h3>
                    <Badge className="bg-amber-900 text-white">$45</Badge>
                  </div>
                  <p className="text-sm text-foreground/80 mb-2">Next business day</p>
                  <p className="text-sm text-foreground/70">Limited to select cities</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Times */}
          <Card className="border-amber-200 shadow-lg">
            <CardHeader className="bg-amber-50">
              <CardTitle className="text-amber-900 font-serif flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Processing & Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">Processing Time</h3>
                  <p className="text-sm text-foreground/80 mb-2">1-2 business days for in-stock items</p>
                  <p className="text-sm text-foreground/70">Custom orders may take 2-4 weeks</p>
                </div>

                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">Order Cutoff</h3>
                  <p className="text-sm text-foreground/80 mb-2">Orders placed before 2 PM EST ship same day</p>
                  <p className="text-sm text-foreground/70">Weekend orders ship on Monday</p>
                </div>

                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">Tracking</h3>
                  <p className="text-sm text-foreground/80 mb-2">Tracking number provided via email</p>
                  <p className="text-sm text-foreground/70">Real-time updates available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* International Shipping */}
        <Card className="mt-8 border-amber-200 shadow-lg">
          <CardHeader className="bg-amber-50">
            <CardTitle className="text-amber-900 font-serif flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              International Shipping
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-amber-800 mb-3">Available Countries</h3>
                <ul className="space-y-1 text-sm text-foreground/80">
                  <li>• United States & Canada</li>
                  <li>• United Kingdom & EU</li>
                  <li>• Australia & New Zealand</li>
                  <li>• Japan & South Korea</li>
                  <li>• Singapore & Malaysia</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 mb-3">Important Notes</h3>
                <ul className="space-y-1 text-sm text-foreground/80">
                  <li>• Delivery times: 7-14 business days</li>
                  <li>• Customs duties may apply</li>
                  <li>• Signature required for delivery</li>
                  <li>• Insurance included on all orders</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Protection */}
        <Card className="mt-8 border-amber-200 shadow-lg">
          <CardHeader className="bg-amber-50">
            <CardTitle className="text-amber-900 font-serif flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Shipping Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-foreground/80">
                All ZOREL LEATHER shipments are fully insured and require signature confirmation to ensure your luxury
                goods arrive safely.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <Shield className="w-8 h-8 text-amber-800 mx-auto mb-2" />
                  <h4 className="font-semibold text-amber-800 mb-1">Fully Insured</h4>
                  <p className="text-xs text-foreground/70">Coverage up to full value</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <Truck className="w-8 h-8 text-amber-800 mx-auto mb-2" />
                  <h4 className="font-semibold text-amber-800 mb-1">Secure Packaging</h4>
                  <p className="text-xs text-foreground/70">Premium protective materials</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <Clock className="w-8 h-8 text-amber-800 mx-auto mb-2" />
                  <h4 className="font-semibold text-amber-800 mb-1">Real-time Tracking</h4>
                  <p className="text-xs text-foreground/70">Monitor your order's journey</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <div className="text-center mt-12">
          <p className="text-amber-700 mb-6">
            Have questions about shipping? Our customer service team is here to help.
          </p>
          <Button asChild className="bg-amber-800 hover:bg-amber-900 text-white">
            <Link href="/contact-us">Contact Customer Service</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
