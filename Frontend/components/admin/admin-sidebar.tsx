"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Clock,
  ShoppingBag,
  Package,
  Users,
  Settings,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserPlus,
  MessageSquare,
} from "lucide-react"

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  
  // Get user role from localStorage
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('admin_role') : null

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      current: pathname === "/admin",
    },
    {
      name: "Requests",
      href: "/admin/requests",
      icon: Clock,
      current: pathname.startsWith("/admin/requests"),
      badge: 12,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
      current: pathname.startsWith("/admin/orders"),
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: Package,
      current: pathname.startsWith("/admin/products"),
    },
    {
      name: "Customers",
      href: "/admin/customers",
      icon: Users,
      current: pathname.startsWith("/admin/customers"),
    },
    {
      name: "WhatsApp",
      href: "/admin/whatsapp",
      icon: MessageSquare,
      current: pathname.startsWith("/admin/whatsapp"),
    },
    {
      name: "Admin Approvals",
      href: "/admin/approvals",
      icon: Shield,
      current: pathname.startsWith("/admin/approvals"),
      superAdminOnly: true,
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      current: pathname.startsWith("/admin/analytics"),
    },
    {
      name: "Notifications",
      href: "/admin/notifications",
      icon: Bell,
      current: pathname.startsWith("/admin/notifications"),
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      current: pathname.startsWith("/admin/settings"),
    },
  ]

  return (
    <aside
      className={cn(
        "sticky top-16 h-[calc(100vh-4rem)] bg-card border-r transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex flex-col h-full">
        {/* Collapse Toggle */}
        <div className="flex justify-end p-2 border-b">
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navigation
            .filter((item) => {
              // Show super admin only items only to super admins
              if (item.superAdminOnly && userRole !== 'super_admin') {
                return false
              }
              return true
            })
            .map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  item.current
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  collapsed && "justify-center",
                )}
              >
                <Icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
