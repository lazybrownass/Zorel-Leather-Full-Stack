import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Ruler, Info } from "lucide-react"
import Link from "next/link"

export default function SizeGuidePage() {
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
            <Ruler className="w-8 h-8 text-amber-800 mr-3" />
            <h1 className="text-4xl font-serif font-bold text-amber-900">Size Guide</h1>
          </div>
          <p className="text-lg text-amber-700 max-w-2xl mx-auto">
            Find your perfect fit with our comprehensive sizing guide for all ZOREL LEATHER products
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Handbags & Accessories */}
          <Card className="border-amber-200 shadow-lg">
            <CardHeader className="bg-amber-50">
              <CardTitle className="text-amber-900 font-serif">Handbags & Accessories</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-amber-800 mb-3">Handbag Dimensions</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b border-amber-100 pb-1">
                      <span className="text-foreground/80">Small (Clutch)</span>
                      <span className="text-foreground">8" × 5" × 2"</span>
                    </div>
                    <div className="flex justify-between border-b border-amber-100 pb-1">
                      <span className="text-foreground/80">Medium (Crossbody)</span>
                      <span className="text-foreground">10" × 7" × 3"</span>
                    </div>
                    <div className="flex justify-between border-b border-amber-100 pb-1">
                      <span className="text-foreground/80">Large (Tote)</span>
                      <span className="text-foreground">14" × 11" × 5"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/80">Extra Large (Travel)</span>
                      <span className="text-foreground">18" × 13" × 7"</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-amber-800 mb-3">Wallet Sizes</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b border-amber-100 pb-1">
                      <span className="text-foreground/80">Card Holder</span>
                      <span className="text-foreground">4" × 3" × 0.5"</span>
                    </div>
                    <div className="flex justify-between border-b border-amber-100 pb-1">
                      <span className="text-foreground/80">Compact Wallet</span>
                      <span className="text-foreground">4.5" × 3.5" × 1"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/80">Full Wallet</span>
                      <span className="text-foreground">7" × 4" × 1"</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shoes */}
          <Card className="border-amber-200 shadow-lg">
            <CardHeader className="bg-amber-50">
              <CardTitle className="text-amber-900 font-serif">Leather Shoes</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-amber-800 mb-3">Men's Shoe Sizes</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b border-amber-100 pb-1">
                      <span className="text-foreground/80">US 8 / EU 41</span>
                      <span className="text-foreground">10.25"</span>
                    </div>
                    <div className="flex justify-between border-b border-amber-100 pb-1">
                      <span className="text-foreground/80">US 9 / EU 42</span>
                      <span className="text-foreground">10.5"</span>
                    </div>
                    <div className="flex justify-between border-b border-amber-100 pb-1">
                      <span className="text-foreground/80">US 10 / EU 43</span>
                      <span className="text-foreground">10.75"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/80">US 11 / EU 44</span>
                      <span className="text-foreground">11"</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-amber-800 mb-3">Women's Shoe Sizes</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b border-amber-100 pb-1">
                      <span className="text-foreground/80">US 6 / EU 36</span>
                      <span className="text-foreground">9"</span>
                    </div>
                    <div className="flex justify-between border-b border-amber-100 pb-1">
                      <span className="text-foreground/80">US 7 / EU 37</span>
                      <span className="text-foreground">9.25"</span>
                    </div>
                    <div className="flex justify-between border-b border-amber-100 pb-1">
                      <span className="text-foreground/80">US 8 / EU 38</span>
                      <span className="text-foreground">9.5"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/80">US 9 / EU 39</span>
                      <span className="text-foreground">9.75"</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Measurement Tips */}
        <Card className="mt-8 border-amber-200 shadow-lg">
          <CardHeader className="bg-amber-50">
            <CardTitle className="text-amber-900 font-serif flex items-center">
              <Info className="w-5 h-5 mr-2" />
              Measurement Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-amber-800 mb-3">For Shoes</h3>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li>• Measure your feet in the evening when they're at their largest</li>
                  <li>• Stand on a piece of paper and trace your foot outline</li>
                  <li>• Measure from heel to longest toe</li>
                  <li>• Consider the width of your foot for the best fit</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 mb-3">For Accessories</h3>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li>• Consider what you'll carry in handbags daily</li>
                  <li>• Check if your essentials fit in wallet compartments</li>
                  <li>• Measure your wrist for watch straps</li>
                  <li>• Consider your waist size for belts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact for Custom Sizing */}
        <div className="text-center mt-12">
          <Badge className="bg-amber-800 text-white mb-4">Custom Sizing Available</Badge>
          <p className="text-amber-700 mb-6">
            Need a custom size or have questions about fit? Our artisans can create bespoke pieces just for you.
          </p>
          <Button asChild className="bg-amber-800 hover:bg-amber-900 text-white">
            <Link href="/contact-us">Contact Us for Custom Sizing</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
