import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, Phone, Clock, Package, RefreshCw } from "lucide-react"

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl font-bold mb-4">Return Policy</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto luxury-text">
            We stand behind the quality of our craftsmanship. Learn about our return and exchange policy for your peace
            of mind.
          </p>
          <p className="text-sm text-muted-foreground mt-4">Last updated: January 2024</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Quick Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="p-6">
                <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-serif text-lg font-semibold mb-2">30-Day Window</h3>
                <p className="text-sm text-muted-foreground">Return items within 30 days of delivery</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Package className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-serif text-lg font-semibold mb-2">Original Condition</h3>
                <p className="text-sm text-muted-foreground">Items must be unused and in original packaging</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <RefreshCw className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-serif text-lg font-semibold mb-2">Easy Process</h3>
                <p className="text-sm text-muted-foreground">Simple return process with full support</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-8 space-y-8">
              {/* Return Window */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Return Window</h2>
                <p className="text-muted-foreground luxury-text mb-4">
                  You may return most items within <strong>30 days</strong> of the delivery date for a full refund or
                  exchange. The return window begins on the day you receive your item(s).
                </p>
                <p className="text-muted-foreground luxury-text">
                  For custom or personalized items, please see the "Custom Orders" section below for specific terms.
                </p>
              </section>

              {/* Eligible Items */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Eligible Items for Return</h2>
                <p className="text-muted-foreground luxury-text mb-4">
                  To be eligible for a return, items must meet the following conditions:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>Item is in original, unused condition</li>
                  <li>All original packaging, tags, and accessories are included</li>
                  <li>Item shows no signs of wear, damage, or alteration</li>
                  <li>Protective films or coverings are still intact</li>
                  <li>Item has not been exposed to moisture, perfumes, or other substances</li>
                </ul>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Due to the handcrafted nature of our products, each piece is unique. We
                    carefully inspect all returned items to ensure they can be resold in perfect condition.
                  </p>
                </div>
              </section>

              {/* Non-Returnable Items */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Non-Returnable Items</h2>
                <p className="text-muted-foreground luxury-text mb-4">
                  The following items cannot be returned for hygiene and quality reasons:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Custom or personalized items (monogrammed, engraved, or made-to-order)</li>
                  <li>Items that have been used, worn, or show signs of wear</li>
                  <li>Items damaged by misuse, accident, or normal wear and tear</li>
                  <li>Items returned after the 30-day return window</li>
                  <li>Items without original packaging or tags</li>
                </ul>
              </section>

              {/* Return Process */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">How to Return an Item</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs text-primary-foreground font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Contact Us</h3>
                      <p className="text-sm text-muted-foreground">
                        Email us at{" "}
                        <a href="mailto:support@zorelleather.com" className="text-primary hover:underline">
                          support@zorelleather.com
                        </a>{" "}
                        or call{" "}
                        <a href="tel:+601125427250" className="text-primary hover:underline">
                          +60 11-2542 7250
                        </a>{" "}
                        to initiate your return.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs text-primary-foreground font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Provide Information</h3>
                      <p className="text-sm text-muted-foreground">
                        Include your order number, reason for return, and whether you prefer a refund or exchange.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs text-primary-foreground font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Receive Return Authorization</h3>
                      <p className="text-sm text-muted-foreground">
                        We'll provide you with a Return Authorization (RA) number and return shipping instructions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs text-primary-foreground font-bold">4</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Package and Ship</h3>
                      <p className="text-sm text-muted-foreground">
                        Carefully package the item in its original packaging and ship using the provided instructions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs text-primary-foreground font-bold">5</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Processing</h3>
                      <p className="text-sm text-muted-foreground">
                        Once we receive your return, we'll inspect the item and process your refund or exchange within
                        5-7 business days.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Refunds */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Refunds</h2>
                <p className="text-muted-foreground luxury-text mb-4">
                  Refunds will be processed to your original payment method within 5-7 business days after we receive
                  and inspect your returned item. Please note:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Original shipping costs are non-refundable</li>
                  <li>Return shipping costs are the customer's responsibility unless the item was defective</li>
                  <li>Refunds may take 5-10 business days to appear on your statement depending on your bank</li>
                  <li>We'll send you an email confirmation once your refund has been processed</li>
                </ul>
              </section>

              {/* Exchanges */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Exchanges</h2>
                <p className="text-muted-foreground luxury-text mb-4">
                  We're happy to exchange items for a different size, color, or style (subject to availability). For
                  exchanges:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Follow the same return process and specify you want an exchange</li>
                  <li>If the new item costs more, you'll be charged the difference</li>
                  <li>If the new item costs less, we'll refund the difference</li>
                  <li>We'll cover return shipping for exchanges due to sizing issues</li>
                </ul>
              </section>

              {/* Custom Orders */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Custom and Personalized Orders</h2>
                <p className="text-muted-foreground luxury-text mb-4">
                  Custom, personalized, or made-to-order items are generally non-returnable. However, we will accept
                  returns in the following cases:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>The item was damaged during shipping</li>
                  <li>The item has a manufacturing defect</li>
                  <li>The item significantly differs from what was ordered</li>
                  <li>We made an error in the customization</li>
                </ul>
                <p className="text-muted-foreground luxury-text mt-4">
                  Please contact us immediately if you receive a custom item that doesn't meet these standards.
                </p>
              </section>

              {/* Damaged Items */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Damaged or Defective Items</h2>
                <p className="text-muted-foreground luxury-text mb-4">
                  If you receive a damaged or defective item, please contact us within 48 hours of delivery. We will:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Provide a prepaid return label</li>
                  <li>Offer a full refund or replacement</li>
                  <li>Cover all return shipping costs</li>
                  <li>Expedite the replacement process</li>
                </ul>
                <p className="text-muted-foreground luxury-text mt-4">
                  Please take photos of any damage and include them when you contact us to help expedite the process.
                </p>
              </section>

              {/* International Returns */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">International Returns</h2>
                <p className="text-muted-foreground luxury-text mb-4">
                  International customers can return items following the same process. Please note:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Return shipping costs are the customer's responsibility</li>
                  <li>Items must be declared accurately for customs</li>
                  <li>Customers are responsible for any customs fees or duties</li>
                  <li>Processing may take longer due to international shipping</li>
                </ul>
              </section>

              {/* Contact Information */}
              <section className="bg-muted p-6 rounded-lg">
                <h2 className="font-serif text-2xl font-bold mb-4">Questions About Returns?</h2>
                <p className="text-muted-foreground luxury-text mb-4">
                  Our customer service team is here to help with any questions about returns or exchanges.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Email Support</p>
                      <a href="mailto:support@zorelleather.com" className="text-primary hover:underline">
                        support@zorelleather.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Phone Support</p>
                      <a href="tel:+601125427250" className="text-primary hover:underline">
                        +60 11-2542 7250
                      </a>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Button asChild>
                    <Link href="/contact-us">Contact Customer Service</Link>
                  </Button>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
