"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { useCart } from "@/contexts/app-context"

export default function RequestCartPage() {
  const { cart, updateQuantity, removeFromCart, getTotalItems, getTotalPrice } = useCart()

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold mb-2">Request List</h1>
            <p className="text-muted-foreground">
              Review your requested items. We'll check availability with our suppliers and contact you within 24 hours to confirm pricing and availability.
            </p>
          </div>

          {cart.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif text-xl font-semibold mb-2">Your request list is empty</h3>
                <p className="text-muted-foreground mb-6">
                  Browse our collection and request items you're interested in. We'll check availability and get back to you.
                </p>
                <Button asChild>
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Request Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <Image
                            src={item.product.images?.[0] || "/placeholder.svg"}
                            alt={item.product.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-serif text-lg font-semibold">{item.product.name}</h3>
                              <p className="text-sm text-muted-foreground">Category: {item.product.category}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Badge variant="secondary">
                              {item.product.price ? `$${item.product.price}` : "Request Price"}
                            </Badge>
                          </div>

                          {item.notes && (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground">Note: {item.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Request Summary */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Request Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Items:</span>
                      <span className="font-semibold">{totalItems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pricing:</span>
                      <span className="text-primary font-semibold">Upon Confirmation</span>
                    </div>
                    <Separator />
                    <div className="text-sm text-muted-foreground">
                      <p className="mb-2">
                        <strong>How it works:</strong>
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-xs">
                        <li>Submit your request</li>
                        <li>We check availability with suppliers</li>
                        <li>We contact you within 24 hours</li>
                        <li>Confirm pricing and proceed with payment</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>

                <Button asChild size="lg" className="w-full">
                  <Link href="/request/checkout">
                    Submit Request
                    <ShoppingBag className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
