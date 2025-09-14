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
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Filter, Bell, Send, Mail, MessageSquare, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { apiClient } from "@/lib/api"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  channel: string
  status: string
  recipient_email?: string
  recipient_phone?: string
  created_at: string
  sent_at?: string
  read_at?: string
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [channelFilter, setChannelFilter] = useState("all")
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "info",
    channel: "email",
    recipient_email: "",
    recipient_phone: ""
  })

  useEffect(() => {
    fetchNotifications()
  }, [typeFilter, statusFilter, channelFilter])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (typeFilter !== "all") params.append("type", typeFilter)
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (channelFilter !== "all") params.append("channel", channelFilter)
      
      const response = await apiClient.get(`/admin/notifications?${params.toString()}`)
      if (response) {
        setNotifications(response.notifications || [])
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendNotification = async () => {
    try {
      const response = await apiClient.post("/admin/notifications", newNotification)
      if (response) {
        setShowSendDialog(false)
        setNewNotification({
          title: "",
          message: "",
          type: "info",
          channel: "email",
          recipient_email: "",
          recipient_phone: ""
        })
        fetchNotifications()
      }
    } catch (error) {
      console.error("Error sending notification:", error)
    }
  }

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      info: { variant: "secondary" as const, className: "bg-blue-100 text-blue-800" },
      warning: { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800" },
      error: { variant: "destructive" as const, className: "" },
      success: { variant: "secondary" as const, className: "bg-green-100 text-green-800" },
    }
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.info
    return (
      <Badge variant={config.variant} className={config.className}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  const getChannelBadge = (channel: string) => {
    const channelConfig = {
      email: { variant: "secondary" as const, className: "bg-blue-100 text-blue-800", icon: Mail },
      sms: { variant: "secondary" as const, className: "bg-green-100 text-green-800", icon: MessageSquare },
      whatsapp: { variant: "secondary" as const, className: "bg-green-100 text-green-800", icon: MessageSquare },
      push: { variant: "secondary" as const, className: "bg-purple-100 text-purple-800", icon: Bell },
    }
    
    const config = channelConfig[channel as keyof typeof channelConfig] || channelConfig.email
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {channel.charAt(0).toUpperCase() + channel.slice(1)}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800", icon: Clock },
      sent: { variant: "secondary" as const, className: "bg-green-100 text-green-800", icon: CheckCircle },
      failed: { variant: "destructive" as const, className: "", icon: AlertCircle },
      read: { variant: "secondary" as const, className: "bg-blue-100 text-blue-800", icon: CheckCircle },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notification.recipient_email && notification.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()))
    
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
                <h1 className="font-serif text-3xl font-bold">Notifications</h1>
                <p className="text-muted-foreground">Manage and send notifications to customers</p>
              </div>
              <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    Send Notification
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Send New Notification</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newNotification.title}
                        onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                        placeholder="Notification title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={newNotification.message}
                        onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                        placeholder="Notification message"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select value={newNotification.type} onValueChange={(value) => setNewNotification({...newNotification, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                          <SelectItem value="success">Success</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="channel">Channel</Label>
                      <Select value={newNotification.channel} onValueChange={(value) => setNewNotification({...newNotification, channel: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="push">Push</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newNotification.channel === "email" && (
                      <div>
                        <Label htmlFor="email">Recipient Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newNotification.recipient_email}
                          onChange={(e) => setNewNotification({...newNotification, recipient_email: e.target.value})}
                          placeholder="customer@example.com"
                        />
                      </div>
                    )}
                    {newNotification.channel === "sms" && (
                      <div>
                        <Label htmlFor="phone">Recipient Phone</Label>
                        <Input
                          id="phone"
                          value={newNotification.recipient_phone}
                          onChange={(e) => setNewNotification({...newNotification, recipient_phone: e.target.value})}
                          placeholder="+1234567890"
                        />
                      </div>
                    )}
                    <Button onClick={handleSendNotification} className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Send Notification
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search notifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={channelFilter} onValueChange={setChannelFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Channels</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="push">Push</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notifications Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications ({filteredNotifications.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                ) : filteredNotifications.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Channel</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Recipient</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredNotifications.map((notification) => (
                          <TableRow key={notification.id}>
                            <TableCell className="font-medium">{notification.title}</TableCell>
                            <TableCell className="max-w-xs truncate">{notification.message}</TableCell>
                            <TableCell>{getTypeBadge(notification.type)}</TableCell>
                            <TableCell>{getChannelBadge(notification.channel)}</TableCell>
                            <TableCell>{getStatusBadge(notification.status)}</TableCell>
                            <TableCell>
                              {notification.recipient_email || notification.recipient_phone || "N/A"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(notification.created_at)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications found</p>
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
