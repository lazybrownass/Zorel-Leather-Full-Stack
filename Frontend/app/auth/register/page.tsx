"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/hooks/use-api"
import { getUserFriendlyErrorMessage } from "@/lib/error-utils"
import { toast } from "sonner"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { register } = useAuth()
  const router = useRouter()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      console.log("Submitting registration with data:", {
        name: `${formData.firstName} ${formData.lastName}`,
        username: formData.username,
        email: formData.email,
        password: "[HIDDEN]"
      })
      
      const result = await register({
        name: `${formData.firstName} ${formData.lastName}`,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      })
      
      console.log("Registration successful:", result)
      toast.success("Account created successfully! Welcome to ZOREL!")
      router.push("/")
    } catch (error: any) {
      console.error("Registration error:", error)
      console.error("Error details:", {
        message: error.message,
        status: error.status,
        response: error.response
      })
      toast.error(getUserFriendlyErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
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
            <CardTitle className="text-2xl font-serif text-center text-amber-900">Join ZOREL</CardTitle>
            <CardDescription className="text-center text-amber-700/70">
              Create your account to start requesting luxury leather goods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-amber-900 font-medium">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={`border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 bg-white/50 ${
                      errors.firstName ? "border-red-300 focus:border-red-400" : ""
                    }`}
                    required
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-amber-900 font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={`border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 bg-white/50 ${
                      errors.lastName ? "border-red-300 focus:border-red-400" : ""
                    }`}
                    required
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-amber-900 font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className={`border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 bg-white/50 ${
                    errors.username ? "border-red-300 focus:border-red-400" : ""
                  }`}
                  required
                />
                {errors.username && (
                  <p className="text-sm text-red-600">{errors.username}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-amber-900 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 bg-white/50 ${
                    errors.email ? "border-red-300 focus:border-red-400" : ""
                  }`}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-amber-900 font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 bg-white/50 ${
                    errors.password ? "border-red-300 focus:border-red-400" : ""
                  }`}
                  required
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-amber-900 font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={`border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 bg-white/50 ${
                    errors.confirmPassword ? "border-red-300 focus:border-red-400" : ""
                  }`}
                  required
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                    className="border-amber-300 data-[state=checked]:bg-amber-900" 
                  />
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
                {errors.agreeToTerms && (
                  <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-900 hover:bg-amber-800 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Account..." : "Create Account"}
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
