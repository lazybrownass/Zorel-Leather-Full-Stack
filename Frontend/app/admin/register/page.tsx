"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, Shield, UserPlus, Calendar, IdCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function AdminRegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    employeeId: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (!formData.dateOfBirth) {
      setError("Date of birth is required");
      return false;
    }
    if (!formData.employeeId.trim()) {
      setError("Employee ID is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/admin-requests/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        date_of_birth: new Date(formData.dateOfBirth).toISOString(),
        employee_id: formData.employeeId,
      });

      if (response.data) {
        setSuccess(true);
        toast({
          title: "Registration Successful",
          description: "Your admin request has been submitted for approval.",
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background with blur effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
          <div className="absolute inset-0 bg-[url('/luxury-mens-leather-goods-collection-hero-banner.jpg')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 backdrop-blur-sm bg-white/30"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-amber-900 mb-4">
                Request Submitted
              </h2>
              <p className="text-amber-700 mb-6">
                Your admin account request has been submitted successfully. 
                A super administrator will review your request and notify you via email.
              </p>
              <Button
                onClick={() => router.push("/admin/login")}
                className="bg-amber-900 hover:bg-amber-800 text-white"
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with blur effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="absolute inset-0 bg-[url('/luxury-mens-leather-goods-collection-hero-banner.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 backdrop-blur-sm bg-white/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-900 rounded-full mb-4 shadow-lg">
              <UserPlus className="w-10 h-10 text-amber-100" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-amber-900 mb-2">
              ZOREL LEATHER
            </h1>
            <p className="text-amber-700 font-medium">Admin Registration</p>
            <div className="w-24 h-1 bg-amber-600 mx-auto mt-3 rounded-full"></div>
          </div>

          {/* Registration Form */}
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-serif text-amber-900 flex items-center justify-center gap-2">
                <UserPlus className="w-6 h-6" />
                Request Admin Access
              </CardTitle>
              <CardDescription className="text-amber-600">
                Fill out the form below to request admin access
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-amber-900 font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-amber-900 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="text-amber-900 font-medium flex items-center gap-2">
                    <IdCard className="w-4 h-4" />
                    Employee ID
                  </Label>
                  <Input
                    id="employeeId"
                    name="employeeId"
                    type="text"
                    placeholder="Enter your employee ID"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    required
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-amber-900 font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-amber-900 font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="border-amber-200 focus:border-amber-500 focus:ring-amber-500 pr-10"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-amber-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-amber-600" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-amber-900 font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="border-amber-200 focus:border-amber-500 focus:ring-amber-500 pr-10"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-amber-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-amber-600" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-amber-900 hover:bg-amber-800 text-white font-medium py-3 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    "Submit Admin Request"
                  )}
                </Button>
              </form>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-amber-100">
                <p className="text-sm text-amber-600 text-center">
                  Your request will be reviewed by a super administrator. 
                  You will be notified via email once approved.
                </p>
              </div>

              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/admin/login")}
                  className="text-amber-700 hover:text-amber-900"
                >
                  Already have an account? Sign in
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-amber-700">
              © 2024 ZOREL LEATHER. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
