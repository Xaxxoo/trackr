"use client"

import { MoreVertical, TrendingUp } from "lucide-react"

const products = [
  { id: 1, name: "Premium Diapers - Size M", sku: "DPR-SM-001", units: 12500, value: "$287,500", trend: 12.5 },
  { name: "Cotton Wool Balls - Pack 500", sku: "CWB-500-001", units: 8900, value: "$89,000", trend: -3.2 },
  { name: "Ultra Sanitary Pads - 30pc", sku: "USP-30-001", units: 15600, value: "$468,000", trend: 18.7 },
  { name: "Organic Cotton Wool", sku: "OCW-250-001", units: 6200, value: "$124,000", trend: 5.3 },
]

export default function TopProducts() {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Top Products by Value</h2>
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <MoreVertical size={20} className="text-muted-foreground" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Product Name</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">SKU</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Units</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Value</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Trend</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, idx) => (
              <tr key={idx} className="border-b border-border hover:bg-secondary/30 transition-colors">
                <td className="py-4 px-4 text-sm font-medium text-foreground">{product.name}</td>
                <td className="py-4 px-4 text-sm text-muted-foreground">{product.sku}</td>
                <td className="py-4 px-4 text-sm text-right text-foreground">{product.units.toLocaleString()}</td>
                <td className="py-4 px-4 text-sm text-right font-semibold text-primary">{product.value}</td>
                <td className="py-4 px-4 text-sm text-right">
                  <span className="flex items-center justify-end gap-1 text-green-600">
                    <TrendingUp size={16} />
                    {product.trend}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
