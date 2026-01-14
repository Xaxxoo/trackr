"use client"

import { Search, Filter, Download, Plus } from "lucide-react"
import { useState } from "react"
import AddInventoryModal from "@/components/forms/add-inventory-modal"

const inventoryItems = [
  {
    id: 1,
    name: "Diapers Size S",
    sku: "DPR-SS-001",
    category: "Diapers",
    quantity: 15420,
    min: 5000,
    max: 50000,
    unit: "Packs",
    lastUpdated: "2 hours ago",
    status: "In Stock",
  },
  {
    id: 2,
    name: "Diapers Size M",
    sku: "DPR-SM-001",
    category: "Diapers",
    quantity: 2300,
    min: 5000,
    max: 50000,
    unit: "Packs",
    lastUpdated: "4 hours ago",
    status: "Low Stock",
  },
  {
    id: 3,
    name: "Cotton Wool Rolls",
    sku: "CWR-500-001",
    category: "Cotton Wool",
    quantity: 8950,
    min: 3000,
    max: 25000,
    unit: "Rolls",
    lastUpdated: "1 day ago",
    status: "In Stock",
  },
  {
    id: 4,
    name: "Premium Sanitary Pads",
    sku: "PSP-30-001",
    category: "Sanitary Pads",
    quantity: 0,
    min: 2000,
    max: 30000,
    unit: "Packs",
    lastUpdated: "3 days ago",
    status: "Out of Stock",
  },
  {
    id: 5,
    name: "Ultra Sanitary Pads",
    sku: "USP-30-001",
    category: "Sanitary Pads",
    quantity: 12650,
    min: 2000,
    max: 30000,
    unit: "Packs",
    lastUpdated: "2 hours ago",
    status: "In Stock",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "In Stock":
      return "bg-green-50 text-green-700 border-green-200"
    case "Low Stock":
      return "bg-yellow-50 text-yellow-700 border-yellow-200"
    case "Out of Stock":
      return "bg-red-50 text-red-700 border-red-200"
    default:
      return "bg-gray-50 text-gray-700 border-gray-200"
  }
}

export default function InventoryTracking() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [items, setItems] = useState(inventoryItems)

  const handleAddItem = (data: any) => {
    const newItem = {
      id: items.length + 1,
      name: data.productName,
      sku: data.sku,
      category: data.category.charAt(0).toUpperCase() + data.category.slice(1),
      quantity: Number.parseInt(data.quantity),
      min: Number.parseInt(data.minThreshold),
      max: Number.parseInt(data.maxThreshold),
      unit: data.unit.charAt(0).toUpperCase() + data.unit.slice(1),
      lastUpdated: "just now",
      status:
        Number.parseInt(data.quantity) === 0
          ? "Out of Stock"
          : Number.parseInt(data.quantity) < Number.parseInt(data.minThreshold)
            ? "Low Stock"
            : "In Stock",
    }
    setItems([...items, newItem])
  }

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <>
      <div className="space-y-6 p-8">
        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inventory Tracking</h1>
            <p className="text-muted-foreground mt-1">Manage and monitor all inventory items</p>
          </div>
          <button
            onClick={() => setIsAddItemOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={20} />
            Add Item
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
            <Filter size={20} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
            <Download size={20} />
            Export
          </button>
        </div>

        {/* Inventory Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground">Product</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground">SKU</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground">Category</th>
                  <th className="text-right py-3 px-6 text-xs font-semibold text-muted-foreground">Current</th>
                  <th className="text-right py-3 px-6 text-xs font-semibold text-muted-foreground">Min-Max</th>
                  <th className="text-center py-3 px-6 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-border hover:bg-secondary/30 transition-colors last:border-b-0"
                  >
                    <td className="py-4 px-6 text-sm font-medium text-foreground">{item.name}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground font-mono">{item.sku}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{item.category}</td>
                    <td className="py-4 px-6 text-sm text-right text-foreground font-semibold">
                      {item.quantity.toLocaleString()} {item.unit}
                    </td>
                    <td className="py-4 px-6 text-sm text-right text-muted-foreground">
                      {item.min.toLocaleString()} - {item.max.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{item.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Inventory Modal */}
      <AddInventoryModal isOpen={isAddItemOpen} onClose={() => setIsAddItemOpen(false)} onSubmit={handleAddItem} />
    </>
  )
}
