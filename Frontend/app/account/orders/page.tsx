import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Package, Eye, Download } from "lucide-react"
import Link from "next/link"

const orders = [
  {
    id: "ORD-2024-001",
    date: "2024-01-15",
    status: "Delivered",
    total: 459,
    items: [{ name: "Premium Leather Briefcase", quantity: 1, price: 459 }],
  },
  {
    id: "ORD-2024-002",
    date: "2024-01-08",
    status: "In Transit",
    total: 189,
    items: [{ name: "Handcrafted Wallet", quantity: 1, price: 189 }],
  },
  {
    id: "ORD-2023-045",
    date: "2023-12-20",
    status: "Delivered",
    total: 329,
    items: [{ name: "Leather Crossbody Bag", quantity: 1, price: 329 }],
  },
]

export default function AccountOrdersPage() {
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
            <Package className="w-8 h-8 text-amber-800 mr-3" />
            <h1 className="text-4xl font-serif font-bold text-amber-900">Order History</h1>
          </div>
          <p className="text-lg text-amber-700">View and track all your ZOREL LEATHER orders</p>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="border-amber-200 shadow-lg">
              <CardHeader className="bg-amber-50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-amber-900 font-serif">Order {order.id}</CardTitle>
                    <p className="text-sm text-foreground/70">Placed on {new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        order.status === "Delivered"
                          ? "bg-green-600 text-white"
                          : order.status === "In Transit"
                            ? "bg-blue-600 text-white"
                            : "bg-amber-600 text-white"
                      }
                    >
                      {order.status}
                    </Badge>
                    <span className="text-lg font-bold text-amber-800">${order.total}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Items */}
                  <div>
                    <h3 className="font-semibold text-amber-800 mb-3">Items Ordered</h3>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-amber-100 last:border-b-0"
                        >
                          <div>
                            <span className="text-foreground font-medium">{item.name}</span>
                            <span className="text-foreground/70 ml-2">× {item.quantity}</span>
                          </div>
                          <span className="text-amber-800 font-semibold">${item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-amber-300 text-amber-800 hover:bg-amber-50 bg-transparent"
                    >
                      <Link href={`/order/details/${order.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                    {order.status === "Delivered" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-amber-300 text-amber-800 hover:bg-amber-50 bg-transparent"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Invoice
                      </Button>
                    )}
                    {order.status === "In Transit" && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border-blue-300 text-blue-800 hover:bg-blue-50 bg-transparent"
                      >
                        <Link href={`/order/track/${order.id}`}>
                          <Package className="w-4 h-4 mr-2" />
                          Track Package
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {orders.length === 0 && (
          <Card className="border-amber-200 shadow-lg">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-amber-300 mx-auto mb-4" />
              <h2 className="text-2xl font-serif font-bold text-amber-900 mb-2">No Orders Yet</h2>
              <p className="text-amber-700 mb-6">You haven't placed any orders yet. Start exploring our collection!</p>
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
