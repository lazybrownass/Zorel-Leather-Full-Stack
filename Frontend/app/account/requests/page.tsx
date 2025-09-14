import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, CheckCircle, XCircle, Eye } from "lucide-react"
import Link from "next/link"

const requests = [
  {
    id: "REQ-2024-003",
    date: "2024-01-20",
    status: "Pending",
    items: [{ name: "Custom Leather Tote Bag", color: "Cognac", notes: "Monogram 'SJ'" }],
  },
  {
    id: "REQ-2024-002",
    date: "2024-01-18",
    status: "Confirmed",
    items: [{ name: "Men's Oxford Shoes", color: "Brown", size: "10" }],
  },
  {
    id: "REQ-2024-001",
    date: "2024-01-15",
    status: "Completed",
    items: [{ name: "Premium Wallet", color: "Black" }],
  },
]

export default function AccountRequestsPage() {
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
            <Clock className="w-8 h-8 text-amber-800 mr-3" />
            <h1 className="text-4xl font-serif font-bold text-amber-900">My Requests</h1>
          </div>
          <p className="text-lg text-amber-700">Track the status of your product requests</p>
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {requests.map((request) => (
            <Card key={request.id} className="border-amber-200 shadow-lg">
              <CardHeader className="bg-amber-50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-amber-900 font-serif">Request {request.id}</CardTitle>
                    <p className="text-sm text-foreground/70">
                      Submitted on {new Date(request.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    className={
                      request.status === "Completed"
                        ? "bg-green-600 text-white"
                        : request.status === "Confirmed"
                          ? "bg-blue-600 text-white"
                          : request.status === "Pending"
                            ? "bg-amber-600 text-white"
                            : "bg-red-600 text-white"
                    }
                  >
                    {request.status === "Completed" && <CheckCircle className="w-3 h-3 mr-1" />}
                    {request.status === "Confirmed" && <CheckCircle className="w-3 h-3 mr-1" />}
                    {request.status === "Pending" && <Clock className="w-3 h-3 mr-1" />}
                    {request.status === "Declined" && <XCircle className="w-3 h-3 mr-1" />}
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Items */}
                  <div>
                    <h3 className="font-semibold text-amber-800 mb-3">Requested Items</h3>
                    <div className="space-y-3">
                      {request.items.map((item, index) => (
                        <div key={index} className="p-3 bg-amber-50 rounded-lg">
                          <h4 className="font-medium text-foreground mb-2">{item.name}</h4>
                          <div className="flex flex-wrap gap-4 text-sm text-foreground/70">
                            {item.color && <span>Color: {item.color}</span>}
                            {item.size && <span>Size: {item.size}</span>}
                            {item.notes && <span>Notes: {item.notes}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Message */}
                  <div className="p-3 bg-white border border-amber-200 rounded-lg">
                    {request.status === "Pending" && (
                      <p className="text-sm text-foreground/80">
                        <Clock className="w-4 h-4 inline mr-2 text-amber-600" />
                        We're reviewing your request and will respond within 24-48 hours.
                      </p>
                    )}
                    {request.status === "Confirmed" && (
                      <p className="text-sm text-foreground/80">
                        <CheckCircle className="w-4 h-4 inline mr-2 text-blue-600" />
                        Great news! Your request has been confirmed. You can now proceed to payment.
                      </p>
                    )}
                    {request.status === "Completed" && (
                      <p className="text-sm text-foreground/80">
                        <CheckCircle className="w-4 h-4 inline mr-2 text-green-600" />
                        Your order has been completed and shipped. Thank you for choosing ZOREL LEATHER!
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-amber-300 text-amber-800 hover:bg-amber-50 bg-transparent"
                    >
                      <Link href={`/request/status/${request.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                    {request.status === "Confirmed" && (
                      <Button asChild className="bg-amber-800 hover:bg-amber-900 text-white" size="sm">
                        <Link href={`/order/payment/${request.id}`}>Proceed to Payment</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {requests.length === 0 && (
          <Card className="border-amber-200 shadow-lg">
            <CardContent className="p-12 text-center">
              <Clock className="w-16 h-16 text-amber-300 mx-auto mb-4" />
              <h2 className="text-2xl font-serif font-bold text-amber-900 mb-2">No Requests Yet</h2>
              <p className="text-amber-700 mb-6">
                You haven't submitted any product requests yet. Browse our collection and request items you're
                interested in!
              </p>
              <Button asChild className="bg-amber-800 hover:bg-amber-900 text-white">
                <Link href="/shop">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
