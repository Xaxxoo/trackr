"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { MoreVertical } from "lucide-react"

const salesTrendData = [
  { month: "Jan", diapers: 45000, cotton: 32000, pads: 58000 },
  { month: "Feb", diapers: 52000, cotton: 38000, pads: 65000 },
  { month: "Mar", diapers: 48000, cotton: 35000, pads: 61000 },
  { month: "Apr", diapers: 61000, cotton: 42000, pads: 72000 },
  { month: "May", diapers: 55000, cotton: 39000, pads: 68000 },
  { month: "Jun", diapers: 67000, cotton: 45000, pads: 78000 },
]

const warehouseData = [
  { warehouse: "Main Hub", capacity: 85, utilized: 72 },
  { warehouse: "North Zone", capacity: 90, utilized: 68 },
  { warehouse: "South Zone", capacity: 95, utilized: 82 },
  { warehouse: "East Zone", capacity: 88, utilized: 65 },
]

export default function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      {/* Sales Trend */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Sales Trend</h2>
          <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <MoreVertical size={20} className="text-muted-foreground" />
          </button>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={salesTrendData}>
            <defs>
              <linearGradient id="colorDiapers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCotton" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="diapers"
              stroke="var(--color-primary)"
              fillOpacity={1}
              fill="url(#colorDiapers)"
              name="Diapers"
            />
            <Area
              type="monotone"
              dataKey="cotton"
              stroke="var(--color-accent)"
              fillOpacity={1}
              fill="url(#colorCotton)"
              name="Cotton Wool"
              stackId="1"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Warehouse Utilization */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Warehouse Utilization</h2>

        <div className="space-y-4">
          {warehouseData.map((warehouse, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{warehouse.warehouse}</span>
                <span className="text-sm text-muted-foreground">
                  {warehouse.utilized}% / {warehouse.capacity}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
                  style={{ width: `${warehouse.utilized}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
