"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Search, ShoppingBag, User, Menu, X, Globe, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/use-api"
import { useCart } from "@/contexts/app-context"

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const { user, isAuthenticated, isAdmin, isSuperAdmin, logout } = useAuth()
  const { getTotalItems } = useCart()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debug logging
  console.log('Header Auth State:', { user, isAuthenticated, isAdmin, isSuperAdmin })

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const navigation = [
    { name: "Shop", href: "/shop" },
    { name: "Men", href: "/shop/men" },
    { name: "Women", href: "/shop/women" },
    { name: "Accessories", href: "/shop/accessories" },
    { name: "About", href: "/about-us" },
    { name: "Contact", href: "/contact-us" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full glass-effect border-b border-border/30 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Mobile menu button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="hover:bg-accent/50">
                <Menu className="h-6 w-6 text-foreground" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 luxury-card">
              <div className="flex flex-col space-y-6 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-xl font-medium text-foreground hover:text-primary transition-colors luxury-hover"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center space-x-3 group">
            <div className="font-serif text-3xl font-bold luxury-gradient-text group-hover:scale-105 transition-transform">
              ZOREL
            </div>
            <div className="text-sm text-muted-foreground font-light tracking-[0.2em] uppercase">LEATHER</div>
          </Link>

          <nav className="hidden md:flex items-center space-x-10">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group py-2"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <ThemeToggle />

            {/* Language/Currency Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden sm:flex hover:bg-accent/50">
                  <Globe className="h-5 w-5 text-foreground" />
                  <span className="sr-only">Language and currency</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="luxury-card">
                <DropdownMenuItem className="text-foreground hover:bg-accent/50">English (USD)</DropdownMenuItem>
                <DropdownMenuItem className="text-foreground hover:bg-accent/50">العربية (SAR)</DropdownMenuItem>
                <DropdownMenuItem className="text-foreground hover:bg-accent/50">English (EUR)</DropdownMenuItem>
                <DropdownMenuItem className="text-foreground hover:bg-accent/50">English (MYR)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="hover:bg-accent/50"
            >
              <Search className="h-5 w-5 text-foreground" />
              <span className="sr-only">Search</span>
            </Button>

            {/* Request List */}
            <Link href="/request/cart">
              <Button variant="ghost" size="icon" className="relative hover:bg-accent/50">
                <ShoppingBag className="h-5 w-5 text-foreground" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center font-semibold">
                  {getTotalItems()}
                </span>
                <span className="sr-only">Request list</span>
              </Button>
            </Link>

            {/* Account */}
            <div className="relative" ref={dropdownRef}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-accent/50"
                onClick={() => {
                  console.log('Profile button clicked')
                  setIsProfileDropdownOpen(!isProfileDropdownOpen)
                }}
              >
                <User className="h-5 w-5 text-foreground" />
                <span className="sr-only">Account</span>
              </Button>
              
              {isProfileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 shadow-lg rounded-md z-50">
                  <div className="p-4">
                    <p className="text-sm font-medium text-gray-900">Profile Menu Working!</p>
                    <p className="text-xs text-gray-500">
                      Auth: {isAuthenticated ? 'Yes' : 'No'}
                    </p>
                    <p className="text-xs text-gray-500">
                      User: {user?.name || 'None'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Email: {user?.email || 'None'}
                    </p>
                  </div>
                  
                  <div className="border-t border-gray-200">
                    {isAuthenticated ? (
                      <>
                        <div className="py-1">
                          <Link 
                            href="/account" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            My Account
                          </Link>
                          <Link 
                            href="/account/orders" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            My Orders
                          </Link>
                          <Link 
                            href="/account/requests" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            My Requests
                          </Link>
                          
                          {isAdmin && (
                            <>
                              <div className="border-t border-gray-200 my-1"></div>
                              <Link 
                                href="/admin" 
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setIsProfileDropdownOpen(false)}
                              >
                                Go to Admin Panel
                              </Link>
                              {isSuperAdmin && (
                                <Link 
                                  href="/admin/approvals" 
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  onClick={() => setIsProfileDropdownOpen(false)}
                                >
                                  Admin Approvals
                                </Link>
                              )}
                            </>
                          )}
                          
                          <div className="border-t border-gray-200 my-1"></div>
                          <button 
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            onClick={() => {
                              logout()
                              setIsProfileDropdownOpen(false)
                            }}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="py-1">
                        <Link 
                          href="/auth/login" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          Sign In
                        </Link>
                        <Link 
                          href="/auth/register" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          Create Account
                        </Link>
                        <div className="border-t border-gray-200 my-1"></div>
                        <Link 
                          href="/auth/admin-login" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          Login as Admin
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {isSearchOpen && (
          <div className="border-t border-border/30 py-6">
            <div className="relative max-w-lg mx-auto">
              <Input
                type="search"
                placeholder="Search luxury leather goods..."
                className="luxury-input pr-12 py-3 text-lg rounded-xl"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-10 w-10 hover:bg-accent/50"
                onClick={() => setIsSearchOpen(false)}
              >
                <X className="h-5 w-5 text-foreground" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
