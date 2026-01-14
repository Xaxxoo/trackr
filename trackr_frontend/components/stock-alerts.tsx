"use client"

import { AlertCircle, Package, Zap } from "lucide-react"

const alerts = [
  {
    id: 1,
    type: "critical",
    product: "Diapers Size L",
    threshold: 5000,
    current: 1200,
    icon: <AlertCircle size={20} />,
  },
  { id: 2, type: "warning", product: "Cotton Wool Rolls", threshold: 3000, current: 1800, icon: <Package size={20} /> },
  { id: 3, type: "info", product: "Sanitary Pads Premium", threshold: 2000, current: 800, icon: <Zap size={20} /> },
]

export default function StockAlerts() {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Stock Alerts</h2>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border-l-4 flex gap-4 ${
              alert.type === "critical"
                ? "bg-destructive/5 border-destructive"
                : alert.type === "warning"
                  ? "bg-accent/5 border-accent"
                  : "bg-primary/5 border-primary"
            }`}
          >
            <div
              className={`mt-1 ${
                alert.type === "critical"
                  ? "text-destructive"
                  : alert.type === "warning"
                    ? "text-accent"
                    : "text-primary"
              }`}
            >
              {alert.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{alert.product}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Current: {alert.current.toLocaleString()} / Threshold: {alert.threshold.toLocaleString()}
              </p>
              <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                <div
                  className={`h-full rounded-full ${
                    alert.type === "critical" ? "bg-destructive" : alert.type === "warning" ? "bg-accent" : "bg-primary"
                  }`}
                  style={{ width: `${(alert.current / alert.threshold) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
