"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"

interface AddOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

export default function AddOrderModal({ isOpen, onClose, onSubmit }: AddOrderModalProps) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    product: "",
    quantity: "",
    unitPrice: "",
    deliveryDate: "",
    notes: "",
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
    if (!formData.customerName.trim()) newErrors.customerName = "Customer name is required"
    if (!formData.customerEmail.trim()) newErrors.customerEmail = "Email is required"
    if (!formData.product) newErrors.product = "Product is required"
    if (!formData.quantity || Number(formData.quantity) <= 0) newErrors.quantity = "Valid quantity is required"
    if (!formData.unitPrice || Number(formData.unitPrice) <= 0) newErrors.unitPrice = "Valid price is required"
    if (!formData.deliveryDate) newErrors.deliveryDate = "Delivery date is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
      setFormData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        product: "",
        quantity: "",
        unitPrice: "",
        deliveryDate: "",
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
          <h2 className="text-lg font-semibold text-foreground">Create New Order</h2>
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
            <label className="block text-sm font-medium text-foreground mb-1">Customer Name</label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="RetailCo Ltd"
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.customerName ? "border-red-500" : "border-border"
              }`}
            />
            {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Customer Email</label>
            <input
              type="email"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              placeholder="contact@retailco.com"
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.customerEmail ? "border-red-500" : "border-border"
              }`}
            />
            {errors.customerEmail && <p className="text-xs text-red-500 mt-1">{errors.customerEmail}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Customer Phone</label>
            <input
              type="tel"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Product</label>
            <select
              name="product"
              value={formData.product}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.product ? "border-red-500" : "border-border"
              }`}
            >
              <option value="">Select a product</option>
              <option value="Diapers Size S">Diapers Size S</option>
              <option value="Diapers Size M">Diapers Size M</option>
              <option value="Cotton Wool Rolls">Cotton Wool Rolls</option>
              <option value="Premium Sanitary Pads">Premium Sanitary Pads</option>
              <option value="Ultra Sanitary Pads">Ultra Sanitary Pads</option>
            </select>
            {errors.product && <p className="text-xs text-red-500 mt-1">{errors.product}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              <label className="block text-sm font-medium text-foreground mb-1">Unit Price</label>
              <input
                type="number"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.unitPrice ? "border-red-500" : "border-border"
                }`}
              />
              {errors.unitPrice && <p className="text-xs text-red-500 mt-1">{errors.unitPrice}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Delivery Date</label>
            <input
              type="date"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.deliveryDate ? "border-red-500" : "border-border"
              }`}
            />
            {errors.deliveryDate && <p className="text-xs text-red-500 mt-1">{errors.deliveryDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any special instructions..."
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
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
