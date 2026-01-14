import type React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "destructive" | "info"
  children: React.ReactNode
  className?: string
}

export default function Badge({ variant = "default", children, className }: BadgeProps) {
  const variants = {
    default: "bg-secondary text-secondary-foreground",
    success: "bg-green-50 text-green-700 border border-green-200",
    warning: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    destructive: "bg-destructive/10 text-destructive border border-destructive/20",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
  }

  return (
    <span className={cn("px-3 py-1 rounded-full text-xs font-medium", variants[variant], className)}>{children}</span>
  )
}
