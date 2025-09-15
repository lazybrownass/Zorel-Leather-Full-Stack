import Link from "next/link"
import { Phone, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="font-serif text-xl font-bold text-primary">ZOREL</div>
              <div className="text-sm text-foreground font-light tracking-wider">LEATHER</div>
            </div>
            <p className="text-sm text-foreground/90 luxury-text">
              Premium handcrafted leather goods. Each piece tells a story of exceptional craftsmanship and timeless
              elegance.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="text-foreground/90 hover:text-primary transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/shop/men" className="text-foreground/90 hover:text-primary transition-colors">
                  Men's Collection
                </Link>
              </li>
              <li>
                <Link href="/shop/women" className="text-foreground/90 hover:text-primary transition-colors">
                  Women's Collection
                </Link>
              </li>
              <li>
                <Link href="/shop/accessories" className="text-foreground/90 hover:text-primary transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-foreground">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact-us" className="text-foreground/90 hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="text-foreground/90 hover:text-primary transition-colors">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="text-foreground/90 hover:text-primary transition-colors">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="text-foreground/90 hover:text-primary transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-foreground/90 hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-foreground">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:+601125427250" className="text-foreground/90 hover:text-primary transition-colors">
                  +60 11-2542 7250
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <a
                  href="mailto:support@zorelleather.com"
                  className="text-foreground/90 hover:text-primary transition-colors"
                >
                  support@zorelleather.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-foreground/90">© 2024 ZOREL LEATHER. All rights reserved.</div>
          <div className="flex space-x-6 text-sm">
            <Link href="/privacy-policy" className="text-foreground/90 hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-foreground/90 hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/about-us" className="text-foreground/90 hover:text-primary transition-colors">
              About Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
