"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { ShoppingBag, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, Package, Shield, UserPlus } from "lucide-react"
import { apiClient } from "@/lib/api"

interface DashboardStats {
  total_orders: number
  total_revenue: number
  total_products: number
  total_customers: number
  pending_requests: number
  monthly_revenue: number
  monthly_orders: number
}

interface RecentRequest {
  id: string
  customer_name: string
  items_count: number
  created_at: string
  status: string
  priority: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch dashboard stats
        const statsResponse = await apiClient.get('/admin/analytics/dashboard-stats')
        if (statsResponse) {
          setStats(statsResponse)
        }
        
        // Fetch recent requests
        const requestsResponse = await apiClient.get('/admin/requests?limit=5')
        if (requestsResponse) {
          setRecentRequests(requestsResponse.requests || [])
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "confirmed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "asap":
        return <Badge variant="destructive">ASAP</Badge>
      case "urgent":
        return <Badge className="bg-orange-100 text-orange-800">Urgent</Badge>
      case "standard":
        return <Badge variant="outline">Standard</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="font-serif text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{stats?.pending_requests || 0}</div>
                  )}
                  <p className="text-xs text-muted-foreground">Awaiting your review</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{stats?.total_orders || 0}</div>
                  )}
                  <p className="text-xs text-muted-foreground">All time orders</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-2xl font-bold">{formatCurrency(stats?.monthly_revenue || 0)}</div>
                  )}
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{stats?.total_products || 0}</div>
                  )}
                  <p className="text-xs text-muted-foreground">Across all categories</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Requests */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-serif">Recent Requests</CardTitle>
                  <p className="text-sm text-muted-foreground">Latest customer requests awaiting your attention</p>
                </div>
                <Button asChild>
                  <Link href="/admin/requests">View All Requests</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <div className="flex items-center space-x-3">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentRequests.length > 0 ? (
                  <div className="space-y-4">
                    {recentRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{request.customer_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {request.id} • {request.items_count} item{request.items_count > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getPriorityBadge(request.priority)}
                          {getStatusBadge(request.status)}
                          <span className="text-sm text-muted-foreground">{formatDate(request.created_at)}</span>
                          <Button asChild size="sm" variant="outline" className="bg-transparent">
                            <Link href={`/admin/requests/${request.id}`}>Review</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent requests found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href="/admin/requests">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Review Requests</h3>
                        <p className="text-sm text-muted-foreground">
                          {stats?.pending_requests || 0} pending requests need attention
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/products">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Manage Products</h3>
                        <p className="text-sm text-muted-foreground">Add new items or update existing ones</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/analytics">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">View Analytics</h3>
                        <p className="text-sm text-muted-foreground">Track sales and customer insights</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/approvals">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Shield className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Admin Approvals</h3>
                        <p className="text-sm text-muted-foreground">Review and approve admin requests</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
