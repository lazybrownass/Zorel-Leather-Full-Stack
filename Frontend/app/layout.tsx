import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Source_Sans_3 as Source_Sans_Pro } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { AppProvider } from "@/contexts/app-context"
import { Toaster } from "sonner"
import { Suspense } from "react"
import "./globals.css"

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const sourceSansPro = Source_Sans_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-source-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "ZOREL LEATHER - Luxury Leather Goods",
  description:
    "Premium handcrafted leather handbags, shoes, and accessories. Request exclusive items from our curated collection.",
  generator: "v0.app",
  keywords: ["luxury leather", "handbags", "leather shoes", "accessories", "premium leather goods"],
  authors: [{ name: "ZOREL LEATHER" }],
  openGraph: {
    title: "ZOREL LEATHER - Luxury Leather Goods",
    description: "Premium handcrafted leather handbags, shoes, and accessories.",
    type: "website",
    locale: "en_US",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${playfairDisplay.variable} ${sourceSansPro.variable}`}>
      <body className="font-sans antialiased">
        <Suspense fallback={null}>
          <AppProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem enableColorScheme>
              {children}
            </ThemeProvider>
          </AppProvider>
          <Toaster position="top-right" richColors />
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
