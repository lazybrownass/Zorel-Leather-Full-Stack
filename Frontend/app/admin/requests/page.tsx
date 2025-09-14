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
import { useAdminRequests } from "@/hooks/use-api"

export default function AdminRequestsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const { data: requestsResponse, loading, error, refetch } = useAdminRequests(1, 20)
  const requests = requestsResponse?.data || []

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
      request.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const pendingRequests = filteredRequests.filter((r) => r.status === "pending")
  const confirmedRequests = filteredRequests.filter((r) => r.status === "confirmed")
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
                <h1 className="font-serif text-3xl font-bold">Customer Requests</h1>
                <p className="text-muted-foreground">Review and manage customer product requests</p>
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
                      placeholder="Search by customer name or request ID..."
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
                      <SelectItem value="confirmed">Confirmed</SelectItem>
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
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All ({filteredRequests.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed ({confirmedRequests.length})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({rejectedRequests.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {filteredRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                {pendingRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </TabsContent>

              <TabsContent value="confirmed" className="space-y-4">
                {confirmedRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4">
                {rejectedRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )

  function RequestCard({ request }: { request: any }) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-semibold text-lg">{request.customer.name}</h3>
                {getContactIcon(request.customer.preferredContact)}
                {getPriorityBadge(request.priority)}
                {getStatusBadge(request.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                Request ID: {request.id} • Submitted {formatDate(request.submittedAt)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatCurrency(request.estimatedValue)}</p>
              <p className="text-sm text-muted-foreground">Estimated Value</p>
            </div>
          </div>

          {/* Customer Contact */}
          <div className="flex items-center space-x-4 mb-4 text-sm">
            <span className="flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              {request.customer.email}
            </span>
            <span className="flex items-center">
              <Phone className="h-4 w-4 mr-1" />
              {request.customer.phone}
            </span>
          </div>

          {/* Requested Items */}
          <div className="space-y-3 mb-4">
            <h4 className="font-medium">Requested Items ({request.items.length})</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {request.items.map((item: any) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.variant}</p>
                    <p className="text-xs">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {request.notes && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Customer Notes</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{request.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {request.customer.preferredContact === "whatsapp" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent"
                  onClick={() =>
                    window.open(
                      `https://wa.me/${request.customer.phone.replace(/\D/g, "")}?text=Hello ${
                        request.customer.name
                      }, regarding your request ${request.id}...`,
                      "_blank",
                    )
                  }
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent"
                onClick={() => (window.location.href = `mailto:${request.customer.email}`)}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
            <div className="flex space-x-2">
              {request.status === "pending" && (
                <>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    Reject
                  </Button>
                  <Button size="sm">Confirm Availability</Button>
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
}
