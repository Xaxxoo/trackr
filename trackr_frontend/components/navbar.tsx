"use client"

import { Bell, Settings } from "lucide-react"

interface NavbarProps {
  user: {
    name: string
    role: string
  }
  onSettingsClick?: () => void
}

export default function Navbar({ user, onSettingsClick }: NavbarProps) {
  return (
    <nav className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground">Inventory Management System</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
            {user.name.charAt(0)}
          </div>
        </div>

        <button onClick={onSettingsClick} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Settings size={20} />
        </button>
      </div>
    </nav>
  )
}
