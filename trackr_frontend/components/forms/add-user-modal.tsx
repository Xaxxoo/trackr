"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

export default function AddUserModal({ isOpen, onClose, onSubmit }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "manager",
    department: "",
    phone: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.email.includes("@")) newErrors.email = "Valid email is required"
    if (!formData.role) newErrors.role = "Role is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
      setFormData({ firstName: "", lastName: "", email: "", role: "manager", department: "", phone: "" })
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Add New User</h2>
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
            <label className="block text-sm font-medium text-foreground mb-1">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.firstName ? "border-red-500" : "border-border"
              }`}
            />
            {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.lastName ? "border-red-500" : "border-border"
              }`}
            />
            {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.email ? "border-red-500" : "border-border"
              }`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="analyst">Analyst</option>
              <option value="sales">Sales Rep</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Warehouse / Sales / Admin"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
