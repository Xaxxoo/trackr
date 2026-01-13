"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"

interface StockTransferModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

export default function StockTransferModal({ isOpen, onClose, onSubmit }: StockTransferModalProps) {
  const [formData, setFormData] = useState({
    fromLocation: "",
    toLocation: "",
    product: "",
    quantity: "",
    reason: "rebalancing",
    notes: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const locations = ["Main Warehouse - Sector A", "Main Warehouse - Sector B", "Cold Storage Zone", "Overflow Storage"]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.fromLocation) newErrors.fromLocation = "From location is required"
    if (!formData.toLocation) newErrors.toLocation = "To location is required"
    if (formData.fromLocation === formData.toLocation) newErrors.toLocation = "Cannot transfer to same location"
    if (!formData.product.trim()) newErrors.product = "Product is required"
    if (!formData.quantity || Number(formData.quantity) <= 0) newErrors.quantity = "Valid quantity is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
      setFormData({
        fromLocation: "",
        toLocation: "",
        product: "",
        quantity: "",
        reason: "rebalancing",
        notes: "",
      })
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full mx-4 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Create Stock Transfer</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">From Location</label>
            <select
              name="fromLocation"
              value={formData.fromLocation}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.fromLocation ? "border-red-500" : "border-border"
              }`}
            >
              <option value="">Select location</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            {errors.fromLocation && <p className="text-xs text-red-500 mt-1">{errors.fromLocation}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">To Location</label>
            <select
              name="toLocation"
              value={formData.toLocation}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.toLocation ? "border-red-500" : "border-border"
              }`}
            >
              <option value="">Select location</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            {errors.toLocation && <p className="text-xs text-red-500 mt-1">{errors.toLocation}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Product</label>
            <input
              type="text"
              name="product"
              value={formData.product}
              onChange={handleChange}
              placeholder="Product name or SKU"
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.product ? "border-red-500" : "border-border"
              }`}
            />
            {errors.product && <p className="text-xs text-red-500 mt-1">{errors.product}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="0"
              min="1"
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.quantity ? "border-red-500" : "border-border"
              }`}
            />
            {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Reason for Transfer</label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="rebalancing">Rebalancing</option>
              <option value="order_fulfillment">Order Fulfillment</option>
              <option value="maintenance">Maintenance</option>
              <option value="stock_adjustment">Stock Adjustment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional notes..."
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Create Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
