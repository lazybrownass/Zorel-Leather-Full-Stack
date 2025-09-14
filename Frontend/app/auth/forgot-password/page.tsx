import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Reset Password | ZOREL LEATHER",
  description: "Reset your ZOREL LEATHER account password",
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="font-serif text-3xl font-bold text-amber-900 mb-2">ZOREL LEATHER</h1>
          </Link>
          <p className="text-amber-700/70 text-sm">Luxury leather goods since 1985</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-serif text-center text-amber-900">Reset Password</CardTitle>
            <CardDescription className="text-center text-amber-700/70">
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-amber-900 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 bg-white/50"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-amber-900 hover:bg-amber-800 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Send Reset Link
              </Button>
            </form>

            <div className="text-center space-y-2">
              <Link
                href="/auth/login"
                className="text-sm text-amber-900 hover:text-amber-700 font-medium transition-colors"
              >
                ← Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-amber-700/70 hover:text-amber-900 transition-colors">
            ← Back to store
          </Link>
        </div>
      </div>
    </div>
  )
}
