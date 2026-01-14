"use client"

import type React from "react"

import { useState } from "react"
import { LayoutDashboard, Package, Warehouse, ShoppingCart, BarChart3, Users, ChevronDown, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  role: string
  onMenuClick: (page: string) => void
}

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  page: string
  subItems?: { id: string; label: string; page: string }[]
  roles: string[]
}

export default function Sidebar({ role, onMenuClick }: SidebarProps) {
  const [expandedMenu, setExpandedMenu] = useState<string | null>("dashboard")
  const [activeMenu, setActiveMenu] = useState("dashboard")

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      page: "dashboard",
      roles: ["admin", "manager", "analyst", "sales"],
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: <Package size={20} />,
      page: "inventory",
      roles: ["admin", "manager", "analyst"],
      subItems: [
        { id: "stock", label: "Stock Levels", page: "inventory" },
        { id: "analytics", label: "Analytics", page: "analytics" },
        { id: "products", label: "Products", page: "inventory" },
      ],
    },
    {
      id: "warehouse",
      label: "Warehouse",
      icon: <Warehouse size={20} />,
      page: "warehouse",
      roles: ["admin", "manager"],
      subItems: [
        { id: "locations", label: "Locations", page: "warehouse" },
        { id: "transfers", label: "Transfers", page: "warehouse" },
        { id: "receiving", label: "Receiving", page: "warehouse" },
      ],
    },
    {
      id: "orders",
      label: "Orders",
      icon: <ShoppingCart size={20} />,
      page: "orders",
      roles: ["admin", "manager", "sales"],
      subItems: [
        { id: "pending", label: "Pending Orders", page: "orders" },
        { id: "active", label: "Active Orders", page: "orders" },
        { id: "completed", label: "Completed Orders", page: "orders" },
      ],
    },
    {
      id: "reports",
      label: "Reports",
      icon: <BarChart3 size={20} />,
      page: "reports",
      roles: ["admin", "analyst"],
      subItems: [
        { id: "sales", label: "Sales Report", page: "reports" },
        { id: "inventory", label: "Inventory Report", page: "reports" },
        { id: "movement", label: "Stock Movement", page: "reports" },
      ],
    },
    {
      id: "users",
      label: "Users",
      icon: <Users size={20} />,
      page: "users",
      roles: ["admin"],
    },
  ]

  const visibleItems = menuItems.filter((item) => item.roles.includes(role))

  const handleMenuClick = (item: MenuItem) => {
    setActiveMenu(item.id)
    onMenuClick(item.page)
    if (item.subItems) {
      setExpandedMenu(expandedMenu === item.id ? null : item.id)
    }
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Package className="text-primary-foreground" size={24} />
          </div>
          <div>
            <h2 className="font-bold text-foreground">InvMgmt</h2>
            <p className="text-xs text-muted-foreground">Pro v1.0</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
        {visibleItems.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => handleMenuClick(item)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200",
                activeMenu === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-secondary",
              )}
            >
              <div className="flex items-center gap-3">
                <span className="opacity-70">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </div>
              {item.subItems && (
                <ChevronDown
                  size={16}
                  className={cn("transition-transform duration-200", expandedMenu === item.id ? "rotate-180" : "")}
                />
              )}
            </button>

            {item.subItems && expandedMenu === item.id && (
              <div className="ml-4 mt-2 space-y-1 border-l border-sidebar-border pl-4">
                {item.subItems.map((subItem) => (
                  <button
                    key={subItem.id}
                    onClick={() => onMenuClick(subItem.page)}
                    className="w-full text-left px-4 py-2 text-sm text-sidebar-foreground hover:text-sidebar-primary transition-colors rounded"
                  >
                    {subItem.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-sidebar-foreground hover:text-sidebar-primary transition-colors rounded-lg hover:bg-secondary">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
