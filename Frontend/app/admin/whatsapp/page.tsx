"use client"

import { useState, useEffect } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Send, Users, Settings, Loader2, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { apiClient } from "@/lib/api"

interface WhatsAppMessage {
  id: string
  from: string
  message: string
  timestamp: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
}

export default function WhatsAppAdminPage() {
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [messageForm, setMessageForm] = useState({
    to: "",
    message: "",
    type: "text"
  })
  const [catalogForm, setCatalogForm] = useState({
    to: "",
    category: "all"
  })

  const sendMessage = async () => {
    if (!messageForm.to || !messageForm.message) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      await apiClient.post("/whatsapp/send-message", {
        to: messageForm.to,
        message: messageForm.message,
        message_type: messageForm.type
      })
      
      toast.success("Message sent successfully!")
      setMessageForm({ to: "", message: "", type: "text" })
    } catch (error: any) {
      toast.error(error.message || "Failed to send message")
    } finally {
      setLoading(false)
    }
  }

  const sendProductCatalog = async () => {
    if (!catalogForm.to) {
      toast.error("Please enter a phone number")
      return
    }

    setLoading(true)
    try {
      await apiClient.post("/whatsapp/send-product-catalog", {
        to: catalogForm.to,
        category: catalogForm.category === "all" ? null : catalogForm.category
      })
      
      toast.success("Product catalog sent successfully!")
      setCatalogForm({ to: "", category: "all" })
    } catch (error: any) {
      toast.error(error.message || "Failed to send catalog")
    } finally {
      setLoading(false)
    }
  }

  const sendTemplateMessage = async (templateName: string) => {
    if (!messageForm.to) {
      toast.error("Please enter a phone number")
      return
    }

    setLoading(true)
    try {
      await apiClient.post("/whatsapp/send-template", {
        to: messageForm.to,
        template_name: templateName,
        language_code: "en"
      })
      
      toast.success("Template message sent successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to send template message")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <MessageSquare className="w-8 h-8 text-primary mr-3" />
              <h1 className="text-4xl font-serif font-bold">WhatsApp Management</h1>
            </div>
            <p className="text-lg text-muted-foreground">Manage WhatsApp communications and customer support</p>
          </div>

          <Tabs defaultValue="send" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="send">Send Messages</TabsTrigger>
              <TabsTrigger value="catalog">Product Catalog</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Send Messages Tab */}
            <TabsContent value="send" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Send className="w-5 h-5 mr-2" />
                    Send WhatsApp Message
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+1234567890"
                        value={messageForm.to}
                        onChange={(e) => setMessageForm(prev => ({ ...prev, to: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="messageType">Message Type</Label>
                      <Select value={messageForm.type} onValueChange={(value) => setMessageForm(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text Message</SelectItem>
                          <SelectItem value="template">Template Message</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Type your message here..."
                      className="min-h-[120px]"
                      value={messageForm.message}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                    />
                  </div>
                  
                  <Button onClick={sendMessage} disabled={loading} className="w-full">
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Product Catalog Tab */}
            <TabsContent value="catalog" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Send Product Catalog
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="catalogPhone">Phone Number</Label>
                      <Input
                        id="catalogPhone"
                        placeholder="+1234567890"
                        value={catalogForm.to}
                        onChange={(e) => setCatalogForm(prev => ({ ...prev, to: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={catalogForm.category} onValueChange={(value) => setCatalogForm(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Products</SelectItem>
                          <SelectItem value="jackets">Jackets</SelectItem>
                          <SelectItem value="shoes">Shoes</SelectItem>
                          <SelectItem value="accessories">Accessories</SelectItem>
                          <SelectItem value="bags">Bags</SelectItem>
                          <SelectItem value="belts">Belts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button onClick={sendProductCatalog} disabled={loading} className="w-full">
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Users className="w-4 h-4 mr-2" />
                    )}
                    Send Product Catalog
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Template Messages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="templatePhone">Phone Number</Label>
                    <Input
                      id="templatePhone"
                      placeholder="+1234567890"
                      value={messageForm.to}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, to: e.target.value }))}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      onClick={() => sendTemplateMessage("order_confirmation")}
                      disabled={loading}
                      variant="outline"
                    >
                      Order Confirmation
                    </Button>
                    <Button 
                      onClick={() => sendTemplateMessage("order_shipped")}
                      disabled={loading}
                      variant="outline"
                    >
                      Order Shipped
                    </Button>
                    <Button 
                      onClick={() => sendTemplateMessage("order_delivered")}
                      disabled={loading}
                      variant="outline"
                    >
                      Order Delivered
                    </Button>
                    <Button 
                      onClick={() => sendTemplateMessage("welcome_message")}
                      disabled={loading}
                      variant="outline"
                    >
                      Welcome Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    WhatsApp Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Webhook Status</Label>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Webhook is active</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>API Status</Label>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">WhatsApp Business API connected</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Badge variant="secondary">+1-800-ZOREL-01</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <code className="text-sm bg-gray-100 p-2 rounded">
                      {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/whatsapp/webhook
                    </code>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
