"use client"

import { Plus, Eye, CheckCircle, Clock, Truck } from "lucide-react"
import { useState } from "react"
import AddOrderModal from "@/components/forms/add-order-modal"

const orders = [
  {
    id: "#ORD-5234",
    customer: "RetailCo Ltd",
    date: "Jan 15, 2024",
    total: "$45,600",
    items: 3,
    status: "Pending",
    dueDate: "Jan 20, 2024",
  },
  {
    id: "#ORD-5235",
    customer: "MediSupply Inc",
    date: "Jan 14, 2024",
    total: "$32,400",
    items: 2,
    status: "Processing",
    dueDate: "Jan 19, 2024",
  },
  {
    id: "#ORD-5236",
    customer: "HealthFirst Co",
    date: "Jan 13, 2024",
    total: "$78,900",
    items: 5,
    status: "Shipped",
    dueDate: "Jan 18, 2024",
  },
  {
    id: "#ORD-5237",
    customer: "Wellness Plus",
    date: "Jan 12, 2024",
    total: "$24,500",
    items: 2,
    status: "Delivered",
    dueDate: "Jan 17, 2024",
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Pending":
      return <Clock size={16} className="text-yellow-600" />
    case "Processing":
      return <Clock size={16} className="text-blue-600" />
    case "Shipped":
      return <Truck size={16} className="text-purple-600" />
    case "Delivered":
      return <CheckCircle size={16} className="text-green-600" />
    default:
      return <Clock size={16} />
  }
}

const getStatusBg = (status: string) => {
  switch (status) {
    case "Pending":
      return "bg-yellow-50 text-yellow-700 border-yellow-200"
    case "Processing":
      return "bg-blue-50 text-blue-700 border-blue-200"
    case "Shipped":
      return "bg-purple-50 text-purple-700 border-purple-200"
    case "Delivered":
      return "bg-green-50 text-green-700 border-green-200"
    default:
      return "bg-gray-50 text-gray-700 border-gray-200"
  }
}

export default function OrdersManagement() {
  const [filterStatus, setFilterStatus] = useState("All")
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false)
  const [orderList, setOrderList] = useState(orders)

  const handleAddOrder = (data: any) => {
    const newOrder = {
      id: `#ORD-${5238 + orderList.length}`,
      customer: data.customerName,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      total: `$${(Number.parseInt(data.quantity) * Number.parseFloat(data.unitPrice)).toLocaleString()}`,
      items: 1,
      status: "Pending",
      dueDate: data.deliveryDate,
    }
    setOrderList([...orderList, newOrder])
  }

  const statuses = ["All", "Pending", "Processing", "Shipped", "Delivered"]

  return (
    <>
      <div className="space-y-6 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Orders Management</h1>
            <p className="text-muted-foreground mt-1">Track and manage customer orders</p>
          </div>
          <button
            onClick={() => setIsAddOrderOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={20} />
            New Order
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                filterStatus === status
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-foreground hover:bg-secondary"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground">Order ID</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground">Date</th>
                  <th className="text-right py-3 px-6 text-xs font-semibold text-muted-foreground">Total</th>
                  <th className="text-center py-3 px-6 text-xs font-semibold text-muted-foreground">Items</th>
                  <th className="text-center py-3 px-6 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground">Due Date</th>
                  <th className="text-center py-3 px-6 text-xs font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orderList.map((order, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-border hover:bg-secondary/30 transition-colors last:border-b-0"
                  >
                    <td className="py-4 px-6 text-sm font-semibold text-primary">{order.id}</td>
                    <td className="py-4 px-6 text-sm text-foreground">{order.customer}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{order.date}</td>
                    <td className="py-4 px-6 text-sm text-right font-semibold text-foreground">{order.total}</td>
                    <td className="py-4 px-6 text-sm text-center text-muted-foreground">{order.items}</td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBg(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{order.dueDate}</td>
                    <td className="py-4 px-6 text-center">
                      <button className="p-1.5 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-foreground">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Component */}
      <AddOrderModal isOpen={isAddOrderOpen} onClose={() => setIsAddOrderOpen(false)} onSubmit={handleAddOrder} />
    </>
  )
}
