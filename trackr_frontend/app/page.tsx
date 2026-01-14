"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import Sidebar from "@/components/sidebar"
import Dashboard from "@/components/dashboard"
import AnalyticsDashboard from "@/components/analytics-dashboard"
import InventoryTracking from "@/components/inventory-tracking"
import WarehouseManagement from "@/components/warehouse-management"
import OrdersManagement from "@/components/orders-management"
import ReportsAnalytics from "@/components/reports-analytics"
import UsersManagement from "@/components/users-management"
import SettingsPage from "@/components/settings-page"

type PageType = "dashboard" | "inventory" | "warehouse" | "orders" | "reports" | "analytics" | "users" | "settings"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard")
  const [currentUser, setCurrentUser] = useState({
    role: "admin",
    name: "John Administrator",
  })

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard role={currentUser.role} />
      case "analytics":
        return <AnalyticsDashboard />
      case "inventory":
        return <InventoryTracking />
      case "warehouse":
        return <WarehouseManagement />
      case "orders":
        return <OrdersManagement />
      case "reports":
        return <ReportsAnalytics />
      case "users":
        return <UsersManagement />
      case "settings":
        return <SettingsPage />
      default:
        return <Dashboard role={currentUser.role} />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar role={currentUser.role} onMenuClick={(page) => setCurrentPage(page as PageType)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={currentUser} onSettingsClick={() => setCurrentPage("settings")} />
        <main className="flex-1 overflow-auto">
          <div className="p-0">{renderPage()}</div>
        </main>
      </div>
    </div>
  )
}
