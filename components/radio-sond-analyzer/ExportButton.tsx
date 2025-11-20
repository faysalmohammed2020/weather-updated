// components/radio-sond-analyzer/ExportButton.tsx
"use client"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

interface ExportButtonProps {
  type: string
  onExport: () => void
  icon: React.ComponentType<{ className?: string }>
  color: string
  description: string
}

export function ExportButton({ type, onExport, icon: Icon, color, description }: ExportButtonProps) {
  return (
    <DropdownMenuItem
      onClick={onExport}
      className={`flex items-center gap-3 p-3 cursor-pointer hover:${color} transition-colors`}
    >
      <div className={`p-2 rounded-lg ${color.replace("hover:", "")} bg-opacity-10`}>
        <Icon className={`h-4 w-4 ${color.replace("hover:", "").replace("bg-", "text-")}`} />
      </div>
      <div className="flex-1">
        <div className="font-medium text-sm">{type} Format</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </DropdownMenuItem>
  )
}
