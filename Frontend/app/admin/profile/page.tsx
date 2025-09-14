import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { ArrowLeft, User, Save, Shield, Bell } from "lucide-react"
import Link from "next/link"

export default function AdminProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          {/* Back Navigation */}
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <User className="w-8 h-8 text-primary mr-3" />
              <h1 className="text-4xl font-serif font-bold">Admin Profile</h1>
            </div>
            <p className="text-lg text-muted-foreground">Manage your admin account settings and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="adminFirstName">First Name</Label>
                    <Input id="adminFirstName" defaultValue="Admin" />
                  </div>
                  <div>
                    <Label htmlFor="adminLastName">Last Name</Label>
                    <Input id="adminLastName" defaultValue="User" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="adminEmail">Email Address</Label>
                  <Input id="adminEmail" type="email" defaultValue="admin@zorelleather.com" />
                </div>

                <div>
                  <Label htmlFor="adminPhone">Phone Number</Label>
                  <Input id="adminPhone" type="tel" defaultValue="+60 11-2542 7250" />
                </div>

                <Button className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>

                <Button className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Notification Preferences */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">New Request Notifications</h3>
                    <p className="text-sm text-muted-foreground">Get notified when customers submit new requests</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Order Notifications</h3>
                    <p className="text-sm text-muted-foreground">Get notified about order status changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Low Stock Alerts</h3>
                    <p className="text-sm text-muted-foreground">Get notified when products are running low</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Daily Summary</h3>
                    <p className="text-sm text-muted-foreground">Receive daily summary of activities</p>
                  </div>
                  <Switch />
                </div>

                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save Notification Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
