import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Package, Clock, CheckCircle, XCircle, CreditCard, User, Settings, LogOut } from "lucide-react"

export const metadata: Metadata = {
  title: "My Account | ZOREL LEATHER",
  description: "Manage your ZOREL LEATHER account and track your requests",
}

export default function AccountPage() {
  const recentRequests = [
    {
      id: "REQ-001",
      product: "Executive Leather Briefcase",
      status: "confirmed",
      date: "2024-01-15",
      total: "$1,299.00",
    },
    {
      id: "REQ-002",
      product: "Vintage Brown Handbag",
      status: "pending",
      date: "2024-01-12",
      total: "$899.00",
    },
    {
      id: "REQ-003",
      product: "Premium Leather Wallet",
      status: "completed",
      date: "2024-01-08",
      total: "$299.00",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "completed":
        return <Package className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-amber-900 mb-2">My Account</h1>
            <p className="text-amber-700/70">Manage your profile and track your luxury leather requests</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-amber-900 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-900">John Doe</h3>
                      <p className="text-sm text-amber-700/70">Premium Member</p>
                    </div>
                  </div>

                  <nav className="space-y-2">
                    <Link
                      href="/account"
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-amber-100 text-amber-900 font-medium"
                    >
                      <User className="h-4 w-4" />
                      <span>Overview</span>
                    </Link>
                    <Link
                      href="/account/requests"
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors"
                    >
                      <Package className="h-4 w-4" />
                      <span>My Requests</span>
                    </Link>
                    <Link
                      href="/account/profile"
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Profile Settings</span>
                    </Link>
                    <Separator className="my-4 bg-amber-200" />
                    <button className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-700/70 mb-1">Total Requests</p>
                        <p className="text-2xl font-bold text-amber-900">12</p>
                      </div>
                      <Package className="h-8 w-8 text-amber-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-700/70 mb-1">Pending</p>
                        <p className="text-2xl font-bold text-amber-900">3</p>
                      </div>
                      <Clock className="h-8 w-8 text-amber-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-700/70 mb-1">Total Spent</p>
                        <p className="text-2xl font-bold text-amber-900">$4,299</p>
                      </div>
                      <CreditCard className="h-8 w-8 text-amber-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Requests */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-serif text-amber-900">Recent Requests</CardTitle>
                  <CardDescription className="text-amber-700/70">
                    Track the status of your latest luxury leather requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-amber-100 bg-amber-50/30"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(request.status)}
                            <Badge className={`${getStatusColor(request.status)} capitalize`}>{request.status}</Badge>
                          </div>
                          <div>
                            <h4 className="font-semibold text-amber-900">{request.product}</h4>
                            <p className="text-sm text-amber-700/70">
                              Request #{request.id} • {request.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-amber-900">{request.total}</p>
                          <Link
                            href={`/request/status/${request.id}`}
                            className="text-sm text-amber-700 hover:text-amber-900 transition-colors"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 text-center">
                    <Link href="/account/requests">
                      <Button
                        variant="outline"
                        className="border-amber-300 text-amber-900 hover:bg-amber-50 bg-transparent"
                      >
                        View All Requests
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-serif text-amber-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/shop">
                      <Button className="w-full bg-amber-900 hover:bg-amber-800 text-white py-3">
                        Browse Products
                      </Button>
                    </Link>
                    <Link href="/contact-us">
                      <Button
                        variant="outline"
                        className="w-full border-amber-300 text-amber-900 hover:bg-amber-50 py-3 bg-transparent"
                      >
                        Contact Support
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
