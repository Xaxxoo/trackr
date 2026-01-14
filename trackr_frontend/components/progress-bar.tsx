import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  max?: number
  showLabel?: boolean
  variant?: "default" | "success" | "warning" | "destructive"
  className?: string
}

export default function ProgressBar({
  value,
  max = 100,
  showLabel = true,
  variant = "default",
  className,
}: ProgressBarProps) {
  const percentage = (value / max) * 100

  const variants = {
    default: "bg-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    destructive: "bg-destructive",
  }

  return (
    <div className={cn("space-y-1", className)}>
      <div className="w-full bg-muted rounded-full h-2.5">
        <div
          className={cn("h-full rounded-full transition-all duration-300", variants[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && <p className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</p>}
    </div>
  )
}
