"use client"

import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "stock_in",
    message: "Stock received: Diapers Size M",
    time: "2 hours ago",
    icon: <Package size={16} />,
  },
  { id: 2, type: "order", message: "Order #5234 shipped", time: "4 hours ago", icon: <ShoppingCart size={16} /> },
  {
    id: 3,
    type: "adjustment",
    message: "Inventory adjustment: Cotton Wool",
    time: "1 day ago",
    icon: <TrendingUp size={16} />,
  },
  { id: 4, type: "user", message: "New user added: Sarah Manager", time: "2 days ago", icon: <Users size={16} /> },
]

export default function RecentActivity() {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>

      <div className="space-y-4">
        {activities.map((activity, idx) => (
          <div key={activity.id} className="flex gap-3 pb-4 border-b border-border last:border-b-0 last:pb-0">
            <div className="p-2 bg-secondary rounded-lg text-primary flex-shrink-0">{activity.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{activity.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
