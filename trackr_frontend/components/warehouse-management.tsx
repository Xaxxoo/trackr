"use client"

import { MapPin, Package, ArrowRight, Plus } from "lucide-react"
import { useState } from "react"
import StockTransferModal from "@/components/forms/stock-transfer-modal"

const locations = [
  {
    id: 1,
    name: "Main Warehouse - Sector A",
    capacity: 5000,
    utilized: 4200,
    items: 1247,
    status: "Active",
    temperature: "22°C",
  },
  {
    id: 2,
    name: "Main Warehouse - Sector B",
    capacity: 3500,
    utilized: 2850,
    items: 892,
    status: "Active",
    temperature: "21°C",
  },
  {
    id: 3,
    name: "Cold Storage Zone",
    capacity: 2000,
    utilized: 1560,
    items: 456,
    status: "Active",
    temperature: "18°C",
  },
  {
    id: 4,
    name: "Overflow Storage",
    capacity: 2500,
    utilized: 500,
    items: 123,
    status: "Standby",
    temperature: "23°C",
  },
]

const transfers = [
  {
    id: 1,
    from: "Main Warehouse - Sector A",
    to: "Main Warehouse - Sector B",
    product: "Diapers Size M",
    quantity: 500,
    date: "Today at 2:30 PM",
    status: "Completed",
  },
  {
    id: 2,
    from: "Main Warehouse - Sector B",
    to: "Cold Storage Zone",
    product: "Cotton Wool Rolls",
    quantity: 200,
    date: "Today at 1:15 PM",
    status: "In Progress",
  },
  {
    id: 3,
    from: "Cold Storage Zone",
    to: "Main Warehouse - Sector A",
    product: "Premium Sanitary Pads",
    quantity: 300,
    date: "Yesterday at 4:00 PM",
    status: "Completed",
  },
]

export default function WarehouseManagement() {
  const [selectedLocation, setSelectedLocation] = useState(locations[0].id)
  const [isTransferOpen, setIsTransferOpen] = useState(false)

  const handleCreateTransfer = (data: any) => {
    console.log("Stock transfer created:", data)
    // Handle transfer logic here
  }

  return (
    <>
      <div className="space-y-6 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Warehouse Management</h1>
            <p className="text-muted-foreground mt-1">Monitor locations and manage stock transfers</p>
          </div>
          <button
            onClick={() => setIsTransferOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={20} />
            New Transfer
          </button>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {locations.map((location) => {
            const utilPercent = (location.utilized / location.capacity) * 100
            return (
              <div
                key={location.id}
                onClick={() => setSelectedLocation(location.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedLocation === location.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={20} className="text-primary" />
                    <h3 className="font-semibold text-foreground text-sm">{location.name}</h3>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${utilPercent}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {location.utilized.toLocaleString()} / {location.capacity.toLocaleString()} units
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Items</p>
                    <p className="font-semibold text-foreground">{location.items}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Temp</p>
                    <p className="font-semibold text-foreground">{location.temperature}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      location.status === "Active"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                    }`}
                  >
                    {location.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Transfers History */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Transfers</h2>

          <div className="space-y-3">
            {transfers.map((transfer) => (
              <div
                key={transfer.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Package size={16} className="text-muted-foreground" />
                    <p className="font-medium text-foreground text-sm">{transfer.product}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{transfer.from}</span>
                    <ArrowRight size={16} />
                    <span>{transfer.to}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{transfer.date}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-semibold text-primary">{transfer.quantity} units</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      transfer.status === "Completed"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {transfer.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Component */}
      <StockTransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onSubmit={handleCreateTransfer}
      />
    </>
  )
}
