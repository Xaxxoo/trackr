"use client"

import { cn } from "@/lib/utils"

interface ButtonGroupProps {
  buttons: {
    label: string
    value: string
    active?: boolean
  }[]
  onChange: (value: string) => void
  className?: string
}

export default function ButtonGroup({ buttons, onChange, className }: ButtonGroupProps) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-2", className)}>
      {buttons.map((btn) => (
        <button
          key={btn.value}
          onClick={() => onChange(btn.value)}
          className={cn(
            "px-4 py-2 rounded-lg whitespace-nowrap transition-colors",
            btn.active
              ? "bg-primary text-primary-foreground"
              : "border border-border text-foreground hover:bg-secondary",
          )}
        >
          {btn.label}
        </button>
      ))}
    </div>
  )
}
