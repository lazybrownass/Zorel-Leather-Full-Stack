"use client"

import type { Metadata } from "next"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/use-api"
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button"
import { getUserFriendlyErrorMessage } from "@/lib/error-utils"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      toast.success("Welcome back!")
      router.push("/")
    } catch (error: any) {
      toast.error(getUserFriendlyErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }
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
            <CardTitle className="text-2xl font-serif text-center text-amber-900">Welcome Back</CardTitle>
            <CardDescription className="text-center text-amber-700/70">
              Sign in to access your account and track your requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-amber-900 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 bg-white/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="Enter your password"
                  className="border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 bg-white/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <Link href="/auth/forgot-password" className="text-amber-700 hover:text-amber-900 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-900 hover:bg-amber-800 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="relative">
              <Separator className="bg-amber-200" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-amber-700/70">
                OR
              </span>
            </div>

            <GoogleOAuthButton 
              onSuccess={(token) => {
                toast.success("Successfully logged in with Google!")
                router.push("/")
              }}
              onError={(error) => {
                toast.error(`Google login failed: ${error}`)
              }}
              className="border-amber-200 hover:border-amber-300 text-amber-900"
            />

            {/* Admin Login Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full border-amber-300 text-amber-900 hover:bg-amber-50 font-medium py-3 rounded-lg transition-all duration-200"
              onClick={() => router.push('/auth/admin-login')}
            >
              Login as Admin
            </Button>

            <div className="text-center">
              <p className="text-sm text-amber-700/70">
                Don't have an account?{" "}
                <Link
                  href="/auth/register"
                  className="text-amber-900 hover:text-amber-700 font-medium transition-colors"
                >
                  Create one here
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
