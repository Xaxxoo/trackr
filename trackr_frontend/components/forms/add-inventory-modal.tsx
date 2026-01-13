"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"

interface AddInventoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

export default function AddInventoryModal({ isOpen, onClose, onSubmit }: AddInventoryModalProps) {
  const [formData, setFormData] = useState({
    productName: "",
    sku: "",
    category: "diapers",
    quantity: "",
    unit: "packs",
    minThreshold: "",
    maxThreshold: "",
    description: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

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
    if (!formData.productName.trim()) newErrors.productName = "Product name is required"
    if (!formData.sku.trim()) newErrors.sku = "SKU is required"
    if (!formData.quantity || Number(formData.quantity) < 0) newErrors.quantity = "Valid quantity is required"
    if (!formData.minThreshold || Number(formData.minThreshold) < 0)
      newErrors.minThreshold = "Valid minimum is required"
    if (!formData.maxThreshold || Number(formData.maxThreshold) < 0)
      newErrors.maxThreshold = "Valid maximum is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
      setFormData({
        productName: "",
        sku: "",
        category: "diapers",
        quantity: "",
        unit: "packs",
        minThreshold: "",
        maxThreshold: "",
        description: "",
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
          <h2 className="text-lg font-semibold text-foreground">Add Inventory Item</h2>
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
            <label className="block text-sm font-medium text-foreground mb-1">Product Name</label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="e.g., Diapers Size S"
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.productName ? "border-red-500" : "border-border"
              }`}
            />
            {errors.productName && <p className="text-xs text-red-500 mt-1">{errors.productName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">SKU</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="e.g., DPR-SS-001"
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.sku ? "border-red-500" : "border-border"
              }`}
            />
            {errors.sku && <p className="text-xs text-red-500 mt-1">{errors.sku}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="diapers">Diapers</option>
                <option value="cotton">Cotton Wool</option>
                <option value="sanitary">Sanitary Pads</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="packs">Packs</option>
                <option value="rolls">Rolls</option>
                <option value="boxes">Boxes</option>
                <option value="units">Units</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Current Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="0"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.quantity ? "border-red-500" : "border-border"
              }`}
            />
            {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Min Threshold</label>
              <input
                type="number"
                name="minThreshold"
                value={formData.minThreshold}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.minThreshold ? "border-red-500" : "border-border"
                }`}
              />
              {errors.minThreshold && <p className="text-xs text-red-500 mt-1">{errors.minThreshold}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Max Threshold</label>
              <input
                type="number"
                name="maxThreshold"
                value={formData.maxThreshold}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.maxThreshold ? "border-red-500" : "border-border"
                }`}
              />
              {errors.maxThreshold && <p className="text-xs text-red-500 mt-1">{errors.maxThreshold}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional description..."
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
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
