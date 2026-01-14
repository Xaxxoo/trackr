import type { ReactNode } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string
  change: number
  icon: ReactNode
}

export default function StatCard({ title, value, change, icon }: StatCardProps) {
  const isPositive = change >= 0

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-label">{title}</p>
          <p className="stat-value mt-2">{value}</p>
        </div>
        <div className="p-3 bg-secondary rounded-lg">{icon}</div>
      </div>

      <div className="flex items-center gap-1 mt-4">
        {isPositive ? (
          <TrendingUp size={16} className="text-green-600" />
        ) : (
          <TrendingDown size={16} className="text-red-600" />
        )}
        <span className={cn("text-sm font-medium", isPositive ? "text-green-600" : "text-red-600")}>
          {Math.abs(change)}% {isPositive ? "increase" : "decrease"}
        </span>
        <span className="text-xs text-muted-foreground">vs last month</span>
      </div>
    </div>
  )
}
