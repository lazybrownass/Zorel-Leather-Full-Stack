"use client"

import { useState } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Save, MessageCircle, Mail, Globe, CreditCard } from "lucide-react"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    // Store Settings
    storeName: "ZOREL LEATHER",
    storeDescription: "Premium handcrafted leather goods",
    storeEmail: "support@zorelleather.com",
    storePhone: "+60 11-2542 7250",
    storeAddress: "Kuala Lumpur, Malaysia",

    // WhatsApp Settings
    whatsappEnabled: true,
    whatsappNumber: "+601125427250",
    whatsappBusinessName: "ZOREL LEATHER",
    whatsappWelcomeMessage: "Hello! Thank you for your interest in ZOREL LEATHER. How can we assist you today?",

    // Email Settings
    emailNotifications: true,
    emailSignature: "Best regards,\nZOREL LEATHER Team\nsupport@zorelleather.com\n+60 11-2542 7250",

    // Request Settings
    defaultResponseTime: "24",
    autoConfirmRequests: false,
    requireCustomerPhone: false,
    allowGuestRequests: true,

    // Payment Settings
    paymentValidityHours: "24",
    acceptedCurrencies: ["USD", "EUR", "MYR", "SAR"],
    defaultCurrency: "USD",

    // Notification Settings
    emailOnNewRequest: true,
    whatsappOnNewRequest: true,
    emailOnPayment: true,
    dailySummaryEmail: true,
  })

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log("Saving settings:", settings)
    // Show success message
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="font-serif text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Configure your store and business preferences</p>
              </div>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>

            <Tabs defaultValue="store" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="store">Store</TabsTrigger>
                <TabsTrigger value="communication">Communication</TabsTrigger>
                <TabsTrigger value="requests">Requests</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              {/* Store Settings */}
              <TabsContent value="store">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center">
                      <Globe className="h-5 w-5 mr-2" />
                      Store Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="storeName">Store Name</Label>
                        <Input
                          id="storeName"
                          value={settings.storeName}
                          onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="storeEmail">Store Email</Label>
                        <Input
                          id="storeEmail"
                          type="email"
                          value={settings.storeEmail}
                          onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="storeDescription">Store Description</Label>
                      <Textarea
                        id="storeDescription"
                        value={settings.storeDescription}
                        onChange={(e) => setSettings({ ...settings, storeDescription: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="storePhone">Phone Number</Label>
                        <Input
                          id="storePhone"
                          value={settings.storePhone}
                          onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="storeAddress">Address</Label>
                        <Input
                          id="storeAddress"
                          value={settings.storeAddress}
                          onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Communication Settings */}
              <TabsContent value="communication" className="space-y-6">
                {/* WhatsApp Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      WhatsApp Integration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="whatsappEnabled">Enable WhatsApp</Label>
                        <p className="text-sm text-muted-foreground">Allow customers to contact you via WhatsApp</p>
                      </div>
                      <Switch
                        id="whatsappEnabled"
                        checked={settings.whatsappEnabled}
                        onCheckedChange={(checked) => setSettings({ ...settings, whatsappEnabled: checked })}
                      />
                    </div>
                    {settings.whatsappEnabled && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                            <Input
                              id="whatsappNumber"
                              value={settings.whatsappNumber}
                              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="whatsappBusinessName">Business Name</Label>
                            <Input
                              id="whatsappBusinessName"
                              value={settings.whatsappBusinessName}
                              onChange={(e) => setSettings({ ...settings, whatsappBusinessName: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="whatsappWelcomeMessage">Welcome Message Template</Label>
                          <Textarea
                            id="whatsappWelcomeMessage"
                            value={settings.whatsappWelcomeMessage}
                            onChange={(e) => setSettings({ ...settings, whatsappWelcomeMessage: e.target.value })}
                            rows={3}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Email Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center">
                      <Mail className="h-5 w-5 mr-2" />
                      Email Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications">Enable Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Send automated emails to customers</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                      />
                    </div>
                    {settings.emailNotifications && (
                      <div>
                        <Label htmlFor="emailSignature">Email Signature</Label>
                        <Textarea
                          id="emailSignature"
                          value={settings.emailSignature}
                          onChange={(e) => setSettings({ ...settings, emailSignature: e.target.value })}
                          rows={4}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Request Settings */}
              <TabsContent value="requests">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Request Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="defaultResponseTime">Default Response Time (hours)</Label>
                      <Input
                        id="defaultResponseTime"
                        type="number"
                        value={settings.defaultResponseTime}
                        onChange={(e) => setSettings({ ...settings, defaultResponseTime: e.target.value })}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        How long customers should expect to wait for a response
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="autoConfirmRequests">Auto-confirm Requests</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically confirm requests for in-stock items
                          </p>
                        </div>
                        <Switch
                          id="autoConfirmRequests"
                          checked={settings.autoConfirmRequests}
                          onCheckedChange={(checked) => setSettings({ ...settings, autoConfirmRequests: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="requireCustomerPhone">Require Phone Number</Label>
                          <p className="text-sm text-muted-foreground">Make phone number mandatory for requests</p>
                        </div>
                        <Switch
                          id="requireCustomerPhone"
                          checked={settings.requireCustomerPhone}
                          onCheckedChange={(checked) => setSettings({ ...settings, requireCustomerPhone: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="allowGuestRequests">Allow Guest Requests</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow customers to submit requests without creating an account
                          </p>
                        </div>
                        <Switch
                          id="allowGuestRequests"
                          checked={settings.allowGuestRequests}
                          onCheckedChange={(checked) => setSettings({ ...settings, allowGuestRequests: checked })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment Settings */}
              <TabsContent value="payments">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Payment Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="paymentValidityHours">Payment Link Validity (hours)</Label>
                      <Input
                        id="paymentValidityHours"
                        type="number"
                        value={settings.paymentValidityHours}
                        onChange={(e) => setSettings({ ...settings, paymentValidityHours: e.target.value })}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        How long payment links remain valid after confirmation
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="defaultCurrency">Default Currency</Label>
                      <select
                        id="defaultCurrency"
                        value={settings.defaultCurrency}
                        onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="MYR">MYR - Malaysian Ringgit</option>
                        <option value="SAR">SAR - Saudi Riyal</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notification Settings */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="emailOnNewRequest">Email on New Request</Label>
                          <p className="text-sm text-muted-foreground">Get notified when customers submit requests</p>
                        </div>
                        <Switch
                          id="emailOnNewRequest"
                          checked={settings.emailOnNewRequest}
                          onCheckedChange={(checked) => setSettings({ ...settings, emailOnNewRequest: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="whatsappOnNewRequest">WhatsApp on New Request</Label>
                          <p className="text-sm text-muted-foreground">Get WhatsApp alerts for new requests</p>
                        </div>
                        <Switch
                          id="whatsappOnNewRequest"
                          checked={settings.whatsappOnNewRequest}
                          onCheckedChange={(checked) => setSettings({ ...settings, whatsappOnNewRequest: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="emailOnPayment">Email on Payment</Label>
                          <p className="text-sm text-muted-foreground">Get notified when payments are completed</p>
                        </div>
                        <Switch
                          id="emailOnPayment"
                          checked={settings.emailOnPayment}
                          onCheckedChange={(checked) => setSettings({ ...settings, emailOnPayment: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="dailySummaryEmail">Daily Summary Email</Label>
                          <p className="text-sm text-muted-foreground">Receive daily reports of activity</p>
                        </div>
                        <Switch
                          id="dailySummaryEmail"
                          checked={settings.dailySummaryEmail}
                          onCheckedChange={(checked) => setSettings({ ...settings, dailySummaryEmail: checked })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
