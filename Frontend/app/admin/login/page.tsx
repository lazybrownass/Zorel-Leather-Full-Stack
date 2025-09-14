"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, Shield, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await apiClient.adminLogin(email, password);

      if (response.access_token) {
        localStorage.setItem("admin_token", response.access_token);
        localStorage.setItem("admin_role", response.user?.role || "admin");
        
        toast({
          title: "Login Successful",
          description: "Welcome to ZOREL LEATHER Admin Panel",
        });

        // Redirect based on role
        if (response.user?.role === "super_admin") {
          router.push("/admin/approvals");
        } else {
          router.push("/admin");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

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
              <Shield className="w-10 h-10 text-amber-100" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-amber-900 mb-2">
              ZOREL LEATHER
            </h1>
            <p className="text-amber-700 font-medium">Admin Portal</p>
            <div className="w-24 h-1 bg-amber-600 mx-auto mt-3 rounded-full"></div>
          </div>

          {/* Login Form */}
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-serif text-amber-900 flex items-center justify-center gap-2">
                <Lock className="w-6 h-6" />
                Secure Access
              </CardTitle>
              <CardDescription className="text-amber-600">
                Enter your credentials to access the admin panel
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-amber-900 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@zorelleather.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                <Button
                  type="submit"
                  className="w-full bg-amber-900 hover:bg-amber-800 text-white font-medium py-3 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In to Admin Panel"
                  )}
                </Button>
              </form>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-amber-100">
                <p className="text-sm text-amber-600 text-center">
                  Need admin access? Contact the system administrator.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-amber-700">
              © 2024 ZOREL LEATHER. All rights reserved.
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Premium Leather Goods & Accessories
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
