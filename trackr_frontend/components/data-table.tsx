"use client"

import type React from "react"

import { ChevronUp, ChevronDown } from "lucide-react"
import { useState } from "react"

interface Column {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  rowClassName?: string
}

export default function DataTable({ columns, data, rowClassName }: DataTableProps) {
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(key)
      setSortOrder("asc")
    }
  }

  const sortedData = sortBy
    ? [...data].sort((a, b) => {
        const aVal = a[sortBy]
        const bVal = b[sortBy]
        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0
        return sortOrder === "asc" ? comparison : -comparison
      })
    : data

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-secondary border-b border-border">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                className={`text-left py-3 px-6 text-xs font-semibold text-muted-foreground ${
                  col.sortable ? "cursor-pointer hover:text-foreground" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {col.label}
                  {col.sortable && sortBy === col.key && (
                    <span className="text-primary">
                      {sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, idx) => (
            <tr key={idx} className={`border-b border-border hover:bg-secondary/30 transition-colors ${rowClassName}`}>
              {columns.map((col) => (
                <td key={col.key} className="py-4 px-6 text-sm text-foreground">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
