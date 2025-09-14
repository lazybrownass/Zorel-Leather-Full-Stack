import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, User, Save, Edit } from "lucide-react"
import Link from "next/link"

export default function AccountProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50/30">
      <div className="container mx-auto px-4 py-12">
        {/* Back Navigation */}
        <Button asChild variant="ghost" className="mb-8 text-amber-800 hover:bg-amber-50">
          <Link href="/account">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Account
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <User className="w-8 h-8 text-amber-800 mr-3" />
            <h1 className="text-4xl font-serif font-bold text-amber-900">Profile Settings</h1>
          </div>
          <p className="text-lg text-amber-700">Manage your personal information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <Card className="border-amber-200 shadow-lg">
            <CardHeader className="bg-amber-50">
              <CardTitle className="text-amber-900 font-serif flex items-center">
                <Edit className="w-5 h-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-foreground">
                      First Name
                    </Label>
                    <Input id="firstName" defaultValue="Sarah" className="border-amber-200 focus:border-amber-400" />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-foreground">
                      Last Name
                    </Label>
                    <Input id="lastName" defaultValue="Johnson" className="border-amber-200 focus:border-amber-400" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="sarah.johnson@email.com"
                    className="border-amber-200 focus:border-amber-400"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-foreground">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    defaultValue="+1 (555) 123-4567"
                    className="border-amber-200 focus:border-amber-400"
                  />
                </div>

                <div>
                  <Label htmlFor="birthdate" className="text-foreground">
                    Date of Birth
                  </Label>
                  <Input
                    id="birthdate"
                    type="date"
                    defaultValue="1990-05-15"
                    className="border-amber-200 focus:border-amber-400"
                  />
                </div>

                <Button className="w-full bg-amber-800 hover:bg-amber-900 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="border-amber-200 shadow-lg">
            <CardHeader className="bg-amber-50">
              <CardTitle className="text-amber-900 font-serif">Default Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-4">
                <div>
                  <Label htmlFor="address1" className="text-foreground">
                    Address Line 1
                  </Label>
                  <Input
                    id="address1"
                    defaultValue="123 Main Street"
                    className="border-amber-200 focus:border-amber-400"
                  />
                </div>

                <div>
                  <Label htmlFor="address2" className="text-foreground">
                    Address Line 2 (Optional)
                  </Label>
                  <Input id="address2" defaultValue="Apt 4B" className="border-amber-200 focus:border-amber-400" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-foreground">
                      City
                    </Label>
                    <Input id="city" defaultValue="New York" className="border-amber-200 focus:border-amber-400" />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-foreground">
                      State/Province
                    </Label>
                    <Input id="state" defaultValue="NY" className="border-amber-200 focus:border-amber-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode" className="text-foreground">
                      ZIP/Postal Code
                    </Label>
                    <Input id="zipCode" defaultValue="10001" className="border-amber-200 focus:border-amber-400" />
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-foreground">
                      Country
                    </Label>
                    <Input
                      id="country"
                      defaultValue="United States"
                      className="border-amber-200 focus:border-amber-400"
                    />
                  </div>
                </div>

                <Button className="w-full bg-amber-800 hover:bg-amber-900 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Update Address
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preferences */}
        <Card className="mt-8 border-amber-200 shadow-lg">
          <CardHeader className="bg-amber-50">
            <CardTitle className="text-amber-900 font-serif">Preferences & Notes</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="preferences" className="text-foreground">
                  Style Preferences
                </Label>
                <Textarea
                  id="preferences"
                  placeholder="Tell us about your style preferences, favorite colors, or any special requirements..."
                  className="border-amber-200 focus:border-amber-400 min-h-[100px]"
                  defaultValue="I prefer classic, timeless designs in brown and cognac leather. I appreciate handcrafted details and quality hardware."
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-foreground">
                  Special Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions or notes for our artisans..."
                  className="border-amber-200 focus:border-amber-400 min-h-[80px]"
                />
              </div>

              <Button className="bg-amber-800 hover:bg-amber-900 text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
