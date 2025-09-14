import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto luxury-text">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-muted-foreground mt-4">Last updated: January 2024</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Introduction</h2>
                <p className="text-muted-foreground luxury-text mb-4">
                  ZOREL LEATHER ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
                  explains how we collect, use, disclose, and safeguard your information when you visit our website,
                  make a purchase, or interact with our services.
                </p>
                <p className="text-muted-foreground luxury-text">
                  By using our services, you consent to the collection and use of information in accordance with this
                  policy.
                </p>
              </section>

              {/* Information We Collect */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Information We Collect</h2>

                <h3 className="font-serif text-xl font-semibold mb-3">Personal Information</h3>
                <p className="text-muted-foreground luxury-text mb-4">
                  We may collect personal information that you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
                  <li>Name and contact information (email, phone number, address)</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                  <li>Product preferences and purchase history</li>
                  <li>Communication preferences</li>
                  <li>Information provided in contact forms or customer support interactions</li>
                </ul>

                <h3 className="font-serif text-xl font-semibold mb-3">Automatically Collected Information</h3>
                <p className="text-muted-foreground luxury-text mb-4">
                  When you visit our website, we may automatically collect:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>IP address and browser information</li>
                  <li>Device information and operating system</li>
                  <li>Pages visited and time spent on our site</li>
                  <li>Referring website information</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </section>

              {/* How We Use Your Information */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">How We Use Your Information</h2>
                <p className="text-muted-foreground luxury-text mb-4">We use the information we collect to:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Process and fulfill your product requests and orders</li>
                  <li>Communicate with you about your requests, orders, and account</li>
                  <li>Provide customer support and respond to inquiries</li>
                  <li>Send you updates about our products and services (with your consent)</li>
                  <li>Improve our website, products, and services</li>
                  <li>Prevent fraud and ensure security</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              {/* Information Sharing */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Information Sharing and Disclosure</h2>
                <p className="text-muted-foreground luxury-text mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may share your
                  information in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>
                    <strong>Service Providers:</strong> With trusted third-party service providers who assist us in
                    operating our business (payment processors, shipping companies, email services)
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law or to protect our rights and safety
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets
                  </li>
                  <li>
                    <strong>With Your Consent:</strong> When you explicitly consent to sharing your information
                  </li>
                </ul>
              </section>

              {/* Data Security */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Data Security</h2>
                <p className="text-muted-foreground luxury-text mb-4">
                  We implement appropriate technical and organizational security measures to protect your personal
                  information against unauthorized access, alteration, disclosure, or destruction. These measures
                  include:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>SSL encryption for data transmission</li>
                  <li>Secure payment processing through certified providers</li>
                  <li>Regular security assessments and updates</li>
                  <li>Limited access to personal information on a need-to-know basis</li>
                  <li>Employee training on data protection practices</li>
                </ul>
              </section>

              {/* Cookies */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Cookies and Tracking Technologies</h2>
                <p className="text-muted-foreground luxury-text mb-4">
                  We use cookies and similar technologies to enhance your browsing experience, analyze website traffic,
                  and personalize content. You can control cookie settings through your browser preferences.
                </p>
                <p className="text-muted-foreground luxury-text">
                  Types of cookies we use include essential cookies for website functionality, analytics cookies to
                  understand usage patterns, and preference cookies to remember your settings.
                </p>
              </section>

              {/* Your Rights */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Your Rights and Choices</h2>
                <p className="text-muted-foreground luxury-text mb-4">You have the right to:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Access and review your personal information</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Restrict or object to certain processing activities</li>
                  <li>Data portability (receive your data in a structured format)</li>
                </ul>
                <p className="text-muted-foreground luxury-text mt-4">
                  To exercise these rights, please contact us using the information provided below.
                </p>
              </section>

              {/* International Transfers */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">International Data Transfers</h2>
                <p className="text-muted-foreground luxury-text">
                  Your information may be transferred to and processed in countries other than your country of
                  residence. We ensure that such transfers comply with applicable data protection laws and implement
                  appropriate safeguards to protect your information.
                </p>
              </section>

              {/* Data Retention */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Data Retention</h2>
                <p className="text-muted-foreground luxury-text">
                  We retain your personal information for as long as necessary to fulfill the purposes outlined in this
                  policy, comply with legal obligations, resolve disputes, and enforce our agreements. When information
                  is no longer needed, we securely delete or anonymize it.
                </p>
              </section>

              {/* Children's Privacy */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Children's Privacy</h2>
                <p className="text-muted-foreground luxury-text">
                  Our services are not intended for children under 13 years of age. We do not knowingly collect personal
                  information from children under 13. If we become aware that we have collected such information, we
                  will take steps to delete it promptly.
                </p>
              </section>

              {/* Changes to Policy */}
              <section>
                <h2 className="font-serif text-2xl font-bold mb-4">Changes to This Privacy Policy</h2>
                <p className="text-muted-foreground luxury-text">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by
                  posting the new policy on our website and updating the "Last updated" date. Your continued use of our
                  services after such changes constitutes acceptance of the updated policy.
                </p>
              </section>

              {/* Contact Information */}
              <section className="bg-muted p-6 rounded-lg">
                <h2 className="font-serif text-2xl font-bold mb-4">Contact Us</h2>
                <p className="text-muted-foreground luxury-text mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
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
