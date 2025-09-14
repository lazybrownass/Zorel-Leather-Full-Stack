"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Eye, Users, Mail, Phone, Calendar, ShoppingBag, DollarSign } from "lucide-react"
import { apiClient } from "@/lib/api"

interface Customer {
  id: string
  name: string
  email: string
  username: string
  phone?: string
  role: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  total_orders: number
  total_spent: number
  profile_image?: string
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")

  useEffect(() => {
    fetchCustomers()
  }, [statusFilter, roleFilter])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("is_active", statusFilter === "active" ? "true" : "false")
      if (roleFilter !== "all") params.append("role", roleFilter)
      
      const response = await apiClient.get(`/admin/customers?${params.toString()}`)
      if (response) {
        setCustomers(response.customers || [])
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      customer: { variant: "secondary" as const, className: "bg-blue-100 text-blue-800" },
      admin: { variant: "secondary" as const, className: "bg-purple-100 text-purple-800" },
      super_admin: { variant: "secondary" as const, className: "bg-red-100 text-red-800" },
    }
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.customer
    return (
      <Badge variant={config.variant} className={config.className}>
        {role.replace("_", " ").toUpperCase()}
      </Badge>
    )
  }

  const getStatusBadge = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) {
      return <Badge variant="destructive">Inactive</Badge>
    }
    if (!isVerified) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Unverified</Badge>
    }
    return <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.username.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-3xl font-bold">Customers</h1>
                <p className="text-muted-foreground">Manage customer accounts and information</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{customers.length}</p>
                      <p className="text-sm text-muted-foreground">Total Customers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{customers.filter(c => c.is_active).length}</p>
                      <p className="text-sm text-muted-foreground">Active Customers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{customers.reduce((sum, c) => sum + c.total_orders, 0)}</p>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(customers.reduce((sum, c) => sum + c.total_spent, 0))}</p>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search customers by name, email, or username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Customers Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Customers ({filteredCustomers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    ))}
                  </div>
                ) : filteredCustomers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Orders</TableHead>
                          <TableHead>Total Spent</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={customer.profile_image} />
                                  <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{customer.name}</div>
                                  <div className="text-sm text-muted-foreground">@{customer.username}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center text-sm">
                                  <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                                  {customer.email}
                                </div>
                                {customer.phone && (
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {customer.phone}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{getRoleBadge(customer.role)}</TableCell>
                            <TableCell>{getStatusBadge(customer.is_active, customer.is_verified)}</TableCell>
                            <TableCell>{customer.total_orders}</TableCell>
                            <TableCell className="font-medium">{formatCurrency(customer.total_spent)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(customer.created_at)}
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No customers found</p>
                    {searchTerm && (
                      <p className="text-sm mt-2">Try adjusting your search criteria</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
