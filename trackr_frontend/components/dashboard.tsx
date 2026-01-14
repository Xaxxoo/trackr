"use client"
import StatCard from "@/components/stat-card"
import InventoryOverview from "@/components/inventory-overview"
import RecentActivity from "@/components/recent-activity"
import TopProducts from "@/components/top-products"
import StockAlerts from "@/components/stock-alerts"
import { TrendingUp, AlertCircle, Package, Zap } from "lucide-react"

interface DashboardProps {
  role: string
}

export default function Dashboard({ role }: DashboardProps) {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your inventory today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Stock Value"
          value="$2,456,890"
          change={12.5}
          icon={<TrendingUp className="text-accent" size={24} />}
        />
        <StatCard
          title="Low Stock Items"
          value="23"
          change={-5.2}
          icon={<AlertCircle className="text-destructive" size={24} />}
        />
        <StatCard
          title="Active SKUs"
          value="1,247"
          change={3.1}
          icon={<Package className="text-primary" size={24} />}
        />
        <StatCard title="Turnover Rate" value="4.2x" change={8.3} icon={<Zap className="text-accent" size={24} />} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Larger Charts */}
        <div className="lg:col-span-2 space-y-6">
          <InventoryOverview />
          <TopProducts />
        </div>

        {/* Right Column - Alerts & Activity */}
        <div className="space-y-6">
          <StockAlerts />
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
