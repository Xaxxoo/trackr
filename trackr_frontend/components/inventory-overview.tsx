"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const data = [
  { name: "Diapers", units: 45000, value: 825000 },
  { name: "Cotton Wool", units: 38000, value: 456000 },
  { name: "Sanitary Pads", units: 52000, value: 1175890 },
]

const categoryData = [
  { name: "In Stock", value: 68, fill: "#0066cc" },
  { name: "Low Stock", value: 18, fill: "#ff9500" },
  { name: "Out of Stock", value: 14, fill: "#ff4444" },
]

export default function InventoryOverview() {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Inventory Overview</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Stock by Product</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
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
              <Bar dataKey="units" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Stock Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
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
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {categoryData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
            <span className="text-sm text-muted-foreground">
              {item.name}: {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
