import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone } from "lucide-react"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto luxury-text">
            Please read these terms carefully before using our services. By using ZOREL LEATHER, you agree to these
            terms.
          </p>
          <p className="text-sm text-muted-foreground mt-4">Last updated: January 2024</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 space-y-8">
              {/* Acceptance */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Acceptance of Terms</h2>
                <p className="text-muted-foreground luxury-text mb-4">
                  By accessing and using the ZOREL LEATHER website, mobile application, or services (collectively, the
                  "Service"), you accept and agree to be bound by the terms and provision of this agreement.
                </p>
                <p className="text-muted-foreground luxury-text">
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              {/* Description of Service */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Description of Service</h2>
                <p className="text-muted-foreground luxury-text mb-4">
                  ZOREL LEATHER provides an online platform for browsing and requesting premium leather goods. Our
                  unique service model allows customers to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Browse our collection of handcrafted leather products</li>
                  <li>Submit requests for specific items</li>
                  <li>Receive availability confirmation and pricing</li>
                  <li>Complete purchases through secure payment processing</li>
                  <li>Track orders and communicate with our team</li>
                </ul>
              </section>

              {/* User Accounts */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">User Accounts</h2>
                <p className="text-muted-foreground luxury-text mb-4">
                  To access certain features of our Service, you may be required to create an account. You agree to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your information to keep it accurate</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
                <p className="text-muted-foreground luxury-text">
                  We reserve the right to suspend or terminate accounts that violate these terms.
                </p>
              </section>

              {/* Request and Purchase Process */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Request and Purchase Process</h2>
                <h3 className="font-serif text-xl font-semibold mb-3">Product Requests</h3>
                <p className="text-muted-foreground luxury-text mb-4">Our request-based system works as follows:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>Submit a request for desired items through our platform</li>
                  <li>We review availability and confirm within 24-48 hours</li>
                  <li>Upon confirmation, you receive pricing and payment instructions</li>
                  <li>Payment must be completed within the specified timeframe</li>
                  <li>Orders are processed only after payment confirmation</li>
                </ul>

                <h3 className="font-serif text-xl font-semibold mb-3">Pricing and Payment</h3>
                <p className="text-muted-foreground luxury-text mb-4">
                  All prices are subject to confirmation and may vary based on:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Current material costs and availability</li>
                  <li>Customization requirements</li>
                  <li>Shipping destination</li>
                  <li>Currency fluctuations for international orders</li>
                </ul>
              </section>

              {/* Intellectual Property */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Intellectual Property Rights</h2>
                <p className="text-muted-foreground luxury-text mb-4">
                  The Service and its original content, features, and functionality are and will remain the exclusive
                  property of ZOREL LEATHER and its licensors. The Service is protected by copyright, trademark, and
                  other laws.
                </p>
                <p className="text-muted-foreground luxury-text">
                  You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly
                  perform, republish, download, store, or transmit any of the material on our Service without prior
                  written consent.
                </p>
              </section>

              {/* User Conduct */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">User Conduct</h2>
                <p className="text-muted-foreground luxury-text mb-4">You agree not to use the Service to:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Transmit any harmful, offensive, or inappropriate content</li>
                  <li>Impersonate any person or entity</li>
                  <li>Interfere with or disrupt the Service or servers</li>
                  <li>Attempt to gain unauthorized access to any part of the Service</li>
                  <li>Use the Service for any commercial purpose without authorization</li>
                  <li>Submit false or misleading information</li>
                </ul>
              </section>

              {/* Product Information */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Product Information and Availability</h2>
                <p className="text-muted-foreground luxury-text mb-4">
                  We strive to provide accurate product information, but we do not warrant that:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>Product descriptions or images are accurate, complete, or error-free</li>
                  <li>Any product will be available when requested</li>
                  <li>Colors displayed will exactly match the actual product</li>
                  <li>All features described will be available in the final product</li>
                </ul>
                <p className="text-muted-foreground luxury-text">
                  Due to the handcrafted nature of our products, slight variations in appearance, texture, and color are
                  normal and add to the unique character of each piece.
                </p>
              </section>

              {/* Shipping and Delivery */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Shipping and Delivery</h2>
                <p className="text-muted-foreground luxury-text mb-4">
                  Shipping times are estimates and may vary based on:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>Product availability and crafting time</li>
                  <li>Shipping destination and method selected</li>
                  <li>Customs processing for international orders</li>
                  <li>Weather conditions and carrier delays</li>
                </ul>
                <p className="text-muted-foreground luxury-text">
                  Risk of loss and title for items pass to you upon delivery to the carrier. We are not responsible for
                  delays or damages caused by shipping carriers.
                </p>
              </section>

              {/* Returns and Refunds */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Returns and Refunds</h2>
                <p className="text-muted-foreground luxury-text mb-4">
                  Our return policy is detailed in our separate Return Policy document. By using our Service, you agree
                  to the terms outlined in that policy.
                </p>
                <p className="text-muted-foreground luxury-text">
                  Custom, personalized, or made-to-order items are generally non-returnable except in cases of defects
                  or errors on our part.
                </p>
              </section>

              {/* Limitation of Liability */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Limitation of Liability</h2>
                <p className="text-muted-foreground luxury-text mb-4">
                  In no event shall ZOREL LEATHER, its directors, employees, partners, agents, suppliers, or affiliates
                  be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of
                  profits, data, use, goodwill, or other intangible losses.
                </p>
                <p className="text-muted-foreground luxury-text">
                  Our total liability to you for any claim arising from or relating to this agreement shall not exceed
                  the amount you paid us for the specific product or service that gave rise to the claim.
                </p>
              </section>

              {/* Indemnification */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Indemnification</h2>
                <p className="text-muted-foreground luxury-text">
                  You agree to defend, indemnify, and hold harmless ZOREL LEATHER and its licensee and licensors, and
                  their employees, contractors, agents, officers and directors, from and against any and all claims,
                  damages, obligations, losses, liabilities, costs or debt, and expenses (including attorney's fees).
                </p>
              </section>

              {/* Termination */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Termination</h2>
                <p className="text-muted-foreground luxury-text mb-4">
                  We may terminate or suspend your account and bar access to the Service immediately, without prior
                  notice or liability, under our sole discretion, for any reason whatsoever, including but not limited
                  to a breach of the Terms.
                </p>
                <p className="text-muted-foreground luxury-text">
                  If you wish to terminate your account, you may simply discontinue using the Service and contact us to
                  request account deletion.
                </p>
              </section>

              {/* Governing Law */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Governing Law</h2>
                <p className="text-muted-foreground luxury-text">
                  These Terms shall be interpreted and governed by the laws of Malaysia, without regard to its conflict
                  of law provisions. Our failure to enforce any right or provision of these Terms will not be considered
                  a waiver of those rights.
                </p>
              </section>

              {/* Changes to Terms */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Changes to Terms</h2>
                <p className="text-muted-foreground luxury-text">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a
                  revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                  Your continued use of the Service after such changes constitutes acceptance of the new Terms.
                </p>
              </section>

              {/* Contact Information */}
              <section className="bg-muted p-6 rounded-lg">
                <h2 className="font-serif text-2xl font-bold mb-4">Contact Information</h2>
                <p className="text-muted-foreground luxury-text mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a href="mailto:support@zorelleather.com" className="text-primary hover:underline">
                        support@zorelleather.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a href="tel:+601125427250" className="text-primary hover:underline">
                        +60 11-2542 7250
                      </a>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-muted-foreground">ZOREL LEATHER, Kuala Lumpur, Malaysia</p>
                  </div>
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
