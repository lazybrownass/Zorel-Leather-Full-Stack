"use client"

import { useState } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import Image from "next/image"
import { Search, Filter, Clock, CheckCircle, AlertCircle, MessageCircle, Phone, Mail, Loader2 } from "lucide-react"
import { useAdminRequests, useProductRequests } from "@/hooks/use-api"

export default function AdminRequestsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const { data: requestsResponse, loading, error, refetch } = useAdminRequests(1, 20)
  const requests = requestsResponse?.requests || []

  const { data: productRequests, loading: productLoading, error: productError, refetch: refetchProducts } = useProductRequests(1, 20, statusFilter === 'all' ? undefined : statusFilter)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
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

  const getOrderStatusBadge = (status: string) => {
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
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        )
      case "shipped":
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Shipped
          </Badge>
        )
      case "delivered":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Delivered
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Cancelled
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

  const getContactIcon = (method: string) => {
    switch (method) {
      case "whatsapp":
        return <MessageCircle className="h-4 w-4 text-green-600" />
      case "phone":
        return <Phone className="h-4 w-4 text-blue-600" />
      case "email":
        return <Mail className="h-4 w-4 text-gray-600" />
      default:
        return <Mail className="h-4 w-4 text-gray-600" />
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

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.employee_id && request.employee_id.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    // Admin requests don't have priority, so we'll ignore priority filter
    const matchesPriority = true // priorityFilter === "all" || request.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const pendingRequests = filteredRequests.filter((r) => r.status === "pending")
  const approvedRequests = filteredRequests.filter((r) => r.status === "approved")
  const rejectedRequests = filteredRequests.filter((r) => r.status === "rejected")

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="font-serif text-3xl font-bold">Admin Requests</h1>
                <p className="text-muted-foreground">Review and manage admin access requests</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" className="bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or request ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="asap">ASAP</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Requests Tabs */}
            <Tabs defaultValue="admin-requests" className="space-y-4">
              <TabsList>
                <TabsTrigger value="admin-requests">Admin Access Requests ({filteredRequests.length})</TabsTrigger>
                <TabsTrigger value="product-requests">Product Requests ({productRequests?.length || 0})</TabsTrigger>
              </TabsList>

              <TabsContent value="admin-requests" className="space-y-4">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading requests...</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">Error loading requests: {error}</p>
                    <Button onClick={refetch} variant="outline" className="mt-2">
                      Try Again
                    </Button>
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No admin requests found.</p>
                  </div>
                ) : (
                  filteredRequests.map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="product-requests" className="space-y-4">
                {productLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading product requests...</span>
                  </div>
                ) : productError ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">Error loading product requests: {productError}</p>
                    <Button onClick={refetchProducts} variant="outline" className="mt-2">
                      Try Again
                    </Button>
                  </div>
                ) : !productRequests || productRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No product requests found.</p>
                  </div>
                ) : (
                  productRequests.map((order) => (
                    <ProductRequestCard key={order.id} order={order} />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )

  function RequestCard({ request }: { request: any }) {
    const formatDate = (dateString: string) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-semibold text-lg">{request.name}</h3>
                {getStatusBadge(request.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                Request ID: {request.id.slice(0, 8)}... • Submitted {formatDate(request.requested_at)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{request.employee_id || 'N/A'}</p>
              <p className="text-sm text-muted-foreground">Employee ID</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="flex items-center space-x-4 mb-4 text-sm">
            <span className="flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              {request.email}
            </span>
            {request.date_of_birth && (
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                DOB: {formatDate(request.date_of_birth)}
              </span>
            )}
          </div>

          {/* Status Information */}
          <div className="space-y-3 mb-4">
            <h4 className="font-medium">Request Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium">Status</p>
                <p className="text-xs text-muted-foreground capitalize">{request.status}</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium">Employee ID</p>
                <p className="text-xs text-muted-foreground">{request.employee_id || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Rejection Reason */}
          {request.rejection_reason && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Rejection Reason</h4>
              <p className="text-sm text-muted-foreground bg-red-50 p-3 rounded-lg border border-red-200">
                {request.rejection_reason}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent"
                onClick={() => (window.location.href = `mailto:${request.email}`)}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
            <div className="flex space-x-2">
              {request.status === "pending" && (
                <>
                  <Button variant="destructive" size="sm">
                    Reject
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Approve
                  </Button>
                </>
              )}
              <Button asChild variant="outline" size="sm" className="bg-transparent">
                <Link href={`/admin/requests/${request.id}`}>View Details</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  function ProductRequestCard({ order }: { order: any }) {
    const formatDate = (dateString: string) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(price)
    }

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="font-semibold text-lg">{order.customer_name}</h3>
                {getOrderStatusBadge(order.status)}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Customer Details</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{order.customer_email}</span>
                    </div>
                    {order.customer_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{order.customer_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Order Details</p>
                  <div className="space-y-1">
                    <p className="text-sm">Total: {formatPrice(order.total_amount)}</p>
                    <p className="text-sm">Items: {order.items?.length || 0}</p>
                    <p className="text-sm">Request ID: {order.id.substring(0, 8)}...</p>
                  </div>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Requested Items</p>
                  <div className="space-y-2">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div>
                          <p className="font-medium">Product ID: {item.product_id.substring(0, 8)}...</p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity} • Price: {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {order.notes && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{order.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Submitted {formatDate(order.created_at)}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 ml-4">
              <Button asChild variant="outline" size="sm" className="bg-transparent">
                <Link href={`/admin/orders/${order.id}`}>View Details</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
}
