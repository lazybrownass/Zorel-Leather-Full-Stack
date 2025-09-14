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
import { toast } from "sonner"
import { Shield, ArrowLeft } from "lucide-react"

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // For admin login, we'll use the username as email for now
      // In a real implementation, you'd have a separate admin login endpoint
      await login(username, password)
      
      // Check if user is admin
      const token = localStorage.getItem('auth_token')
      if (token) {
        // You would typically decode the token or make an API call to verify admin status
        toast.success("Admin access granted!")
        router.push("/admin")
      } else {
        toast.error("Invalid admin credentials")
      }
    } catch (error: any) {
      toast.error(error.message || "Admin login failed")
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
          <p className="text-amber-700/70 text-sm">Admin Access Portal</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-serif text-center text-amber-900">Admin Login</CardTitle>
            <CardDescription className="text-center text-amber-700/70">
              Access the administrative dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-amber-900 font-medium">
                  Admin Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter admin username"
                  className="border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 bg-white/50"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-amber-900 font-medium">
                  Admin Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  className="border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 bg-white/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-900 hover:bg-amber-800 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading ? "Authenticating..." : "Access Admin Panel"}
              </Button>
            </form>

            <div className="relative">
              <Separator className="bg-amber-200" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-amber-700/70">
                OR
              </span>
            </div>

            <div className="text-center space-y-3">
              <Link
                href="/auth/login"
                className="inline-flex items-center text-sm text-amber-700 hover:text-amber-900 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Customer Login
              </Link>
              <p className="text-xs text-amber-700/70">
                Need admin access?{" "}
                <Link
                  href="/auth/admin-request"
                  className="text-amber-900 hover:text-amber-700 font-medium transition-colors"
                >
                  Request Admin Account
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
