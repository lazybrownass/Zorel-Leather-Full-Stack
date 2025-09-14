import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ArrowLeft, HelpCircle, ChevronDown } from "lucide-react"
import Link from "next/link"

const faqs = [
  {
    category: "Orders & Requests",
    questions: [
      {
        question: "How does the request system work?",
        answer:
          "Instead of traditional shopping, you request items you're interested in. We'll review your request and confirm availability, then provide payment options if the item is available.",
      },
      {
        question: "How long does it take to hear back about my request?",
        answer:
          "We typically respond to requests within 24-48 hours during business days. Custom or special orders may take longer to confirm.",
      },
      {
        question: "Can I modify my request after submitting?",
        answer:
          "Yes, you can modify your request before we confirm availability. Contact us immediately if you need to make changes.",
      },
    ],
  },
  {
    category: "Products & Quality",
    questions: [
      {
        question: "What type of leather do you use?",
        answer:
          "We use only premium full-grain leather sourced from the finest tanneries. Each piece is hand-selected for quality, durability, and natural beauty.",
      },
      {
        question: "Are your products handmade?",
        answer:
          "Yes, every ZOREL LEATHER product is handcrafted by skilled artisans using traditional techniques combined with modern precision.",
      },
      {
        question: "Do you offer custom sizing or personalization?",
        answer:
          "We offer custom sizing, monogramming, and bespoke designs. Contact us to discuss your specific requirements.",
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    questions: [
      {
        question: "Do you ship internationally?",
        answer:
          "Yes, we ship to most countries worldwide. International shipping takes 7-14 business days and may be subject to customs duties.",
      },
      {
        question: "Is shipping free?",
        answer:
          "We offer free standard shipping on orders over $200. Express and overnight shipping options are available for additional fees.",
      },
      {
        question: "How do I track my order?",
        answer:
          "Once your order ships, you'll receive a tracking number via email. You can track your package in real-time using our tracking system.",
      },
    ],
  },
  {
    category: "Returns & Exchanges",
    questions: [
      {
        question: "What is your return policy?",
        answer:
          "We offer a 30-day return policy for unused items in original condition. Custom or personalized items cannot be returned unless defective.",
      },
      {
        question: "How do I initiate a return?",
        answer:
          "Contact our customer service team to initiate a return. We'll provide a prepaid return label and instructions.",
      },
      {
        question: "Do you offer exchanges?",
        answer: "Yes, we offer exchanges for different sizes or colors within 30 days, subject to availability.",
      },
    ],
  },
]

export default function FAQPage() {
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
            <HelpCircle className="w-8 h-8 text-amber-800 mr-3" />
            <h1 className="text-4xl font-serif font-bold text-amber-900">Frequently Asked Questions</h1>
          </div>
          <p className="text-lg text-amber-700 max-w-2xl mx-auto">
            Find answers to common questions about ZOREL LEATHER products, orders, and services
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="border-amber-200 shadow-lg">
              <CardHeader className="bg-amber-50">
                <CardTitle className="text-amber-900 font-serif">{category.category}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {category.questions.map((faq, questionIndex) => (
                    <Collapsible key={questionIndex}>
                      <CollapsibleTrigger className="w-full p-6 text-left hover:bg-amber-50/50 transition-colors border-b border-amber-100 last:border-b-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground pr-4">{faq.question}</h3>
                          <ChevronDown className="w-5 h-5 text-amber-600 shrink-0 transition-transform duration-200" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-6 pb-6">
                        <p className="text-foreground/80 leading-relaxed">{faq.answer}</p>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="text-center mt-12">
          <Card className="border-amber-200 shadow-lg max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-serif font-bold text-amber-900 mb-4">Still Have Questions?</h2>
              <p className="text-amber-700 mb-6">
                Our customer service team is here to help with any additional questions about our products or services.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-amber-800 hover:bg-amber-900 text-white">
                  <Link href="/contact-us">Contact Us</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-amber-300 text-amber-800 hover:bg-amber-50 bg-transparent"
                >
                  <Link href="mailto:support@zorelleather.com">Email Support</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
