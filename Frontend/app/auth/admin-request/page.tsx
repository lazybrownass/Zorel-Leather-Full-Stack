"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Shield, ArrowLeft, User, Mail, Calendar, Briefcase, Key } from "lucide-react"
import { apiClient } from "@/lib/api"

export default function AdminRequestPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    jobRole: "",
    adminUsername: "",
    adminPassword: "",
    confirmPassword: ""
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.adminUsername || !formData.adminPassword) {
      toast.error("Please fill in all required fields")
      return false
    }
    
    if (formData.adminPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return false
    }
    
    if (formData.adminPassword.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)

    try {
      // Create admin request
      const requestData = {
        name: formData.name,
        email: formData.email,
        date_of_birth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
        employee_id: formData.jobRole,
        admin_username: formData.adminUsername,
        admin_password: formData.adminPassword
      }

      // You'll need to implement this API endpoint
      await apiClient.createAdminRequest(requestData)
      
      toast.success("Admin access request submitted successfully! You will be notified once approved.")
      router.push("/auth/login")
    } catch (error: any) {
      toast.error(error.message || "Failed to submit admin request")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="font-serif text-3xl font-bold text-amber-900 mb-2">ZOREL LEATHER</h1>
          </Link>
          <p className="text-amber-700/70 text-sm">Request Admin Access</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-serif text-center text-amber-900">Admin Access Request</CardTitle>
            <CardDescription className="text-center text-amber-700/70">
              Submit your request for administrative access. All requests require approval from a Super Admin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-900 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-amber-900 font-medium">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your full name"
                      className="border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 bg-white/50"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-amber-900 font-medium">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      className="border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 bg-white/50"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-amber-900 font-medium">
                      Date of Birth
                    </Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      className="border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 bg-white/50"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="jobRole" className="text-amber-900 font-medium">
                      Job Role / Designation
                    </Label>
                    <Input
                      id="jobRole"
                      name="jobRole"
                      type="text"
                      placeholder="e.g., Store Manager, Operations Lead"
                      className="border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 bg-white/50"
                      value={formData.jobRole}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Admin Credentials */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-900 flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  Admin Credentials
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminUsername" className="text-amber-900 font-medium">
                      Desired Admin Username *
                    </Label>
                    <Input
                      id="adminUsername"
                      name="adminUsername"
                      type="text"
                      placeholder="Choose your admin username"
                      className="border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 bg-white/50"
                      value={formData.adminUsername}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminPassword" className="text-amber-900 font-medium">
                        Admin Password *
                      </Label>
                      <Input
                        id="adminPassword"
                        name="adminPassword"
                        type="password"
                        placeholder="Choose a strong password"
                        className="border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 bg-white/50"
                        value={formData.adminPassword}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-amber-900 font-medium">
                        Confirm Password *
                      </Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        className="border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 bg-white/50"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-900 hover:bg-amber-800 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {loading ? "Submitting Request..." : "Submit Admin Request"}
                </Button>
              </div>
            </form>

            <div className="text-center space-y-3">
              <Link
                href="/auth/login"
                className="inline-flex items-center text-sm text-amber-700 hover:text-amber-900 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
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
