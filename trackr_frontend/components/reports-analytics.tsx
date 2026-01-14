"use client"

import { Download, Filter, MoreVertical } from "lucide-react"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const reportData = [
  { name: "Week 1", revenue: 28000, orders: 45, items: 1200 },
  { name: "Week 2", revenue: 35000, orders: 52, items: 1450 },
  { name: "Week 3", revenue: 32000, orders: 48, items: 1350 },
  { name: "Week 4", revenue: 42000, orders: 61, items: 1680 },
]

const productMix = [
  { name: "Diapers", value: 45, fill: "var(--color-primary)" },
  { name: "Cotton Wool", value: 25, fill: "var(--color-accent)" },
  { name: "Sanitary Pads", value: 30, fill: "oklch(0.6 0.15 120)" },
]

export default function ReportsAnalytics() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Comprehensive business insights and metrics</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
            <Filter size={20} />
            Filter
          </button>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: "$137,000", change: "+12.5%" },
          { label: "Total Orders", value: "206", change: "+8.2%" },
          { label: "Avg Order Value", value: "$664.08", change: "+3.1%" },
          { label: "Items Sold", value: "4,680", change: "+15.3%" },
        ].map((metric, idx) => (
          <div key={idx} className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">{metric.label}</p>
            <p className="text-2xl font-bold text-foreground mt-2">{metric.value}</p>
            <p className="text-xs text-green-600 mt-1">{metric.change}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Orders Trend */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Revenue & Orders Trend</h2>
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <MoreVertical size={20} className="text-muted-foreground" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                }}
              />
              <Legend />
              <Bar dataKey="revenue" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="orders" fill="var(--color-accent)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Product Mix */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Product Mix by Volume</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productMix}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {productMix.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {productMix.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                <span className="text-sm text-muted-foreground">
                  {item.name}: {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Weekly Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Period</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Revenue</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Orders</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Items</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Avg Order</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, idx) => (
                <tr key={idx} className="border-b border-border last:border-b-0">
                  <td className="py-3 px-4 text-sm font-medium text-foreground">{row.name}</td>
                  <td className="py-3 px-4 text-sm text-right text-primary font-semibold">
                    ${row.revenue.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-foreground">{row.orders}</td>
                  <td className="py-3 px-4 text-sm text-right text-foreground">{row.items.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-right text-muted-foreground">
                    ${(row.revenue / row.orders).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
