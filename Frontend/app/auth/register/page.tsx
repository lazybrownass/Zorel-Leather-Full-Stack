import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"

export const metadata: Metadata = {
  title: "Create Account | ZOREL LEATHER",
  description: "Create your ZOREL LEATHER account",
}

export default function RegisterPage() {
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
            <CardTitle className="text-2xl font-serif text-center text-amber-900">Join ZOREL</CardTitle>
            <CardDescription className="text-center text-amber-700/70">
              Create your account to start requesting luxury leather goods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-amber-900 font-medium">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    className="border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 bg-white/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-amber-900 font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    className="border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 bg-white/50"
                    required
                  />
                </div>
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="password" className="text-amber-900 font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  className="border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 bg-white/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-amber-900 font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 bg-white/50"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" className="border-amber-300 data-[state=checked]:bg-amber-900" />
                <Label htmlFor="terms" className="text-sm text-amber-700/70">
                  I agree to the{" "}
                  <Link href="/terms-of-service" className="text-amber-900 hover:text-amber-700 underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy-policy" className="text-amber-900 hover:text-amber-700 underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-900 hover:bg-amber-800 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Create Account
              </Button>
            </form>

            <div className="relative">
              <Separator className="bg-amber-200" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-amber-700/70">
                OR
              </span>
            </div>

            <div className="text-center">
              <p className="text-sm text-amber-700/70">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-amber-900 hover:text-amber-700 font-medium transition-colors">
                  Sign in here
                </Link>
              </p>
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
