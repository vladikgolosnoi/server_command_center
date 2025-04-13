"use client"

import { Button } from "@/components/ui/button"
import { Home, Server, Terminal, FileText, Settings, Users, Code, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navItems = [
    { icon: Home, label: "Dashboard", value: "dashboard" },
    { icon: Server, label: "Servers", value: "servers" },
    { icon: Terminal, label: "Terminal", value: "terminal" },
    { icon: FileText, label: "Files", value: "files" },
    { icon: Code, label: "Scripts", value: "scripts" },
    { icon: Users, label: "Collaboration", value: "collaboration" },
    { icon: BookOpen, label: "Documentation", value: "docs" },
    { icon: Settings, label: "Settings", value: "settings" },
  ]

  return (
    <div className="w-16 md:w-64 border-r bg-card flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-bold text-xl hidden md:block">SCC</h2>
        <h2 className="font-bold text-xl md:hidden">S</h2>
      </div>
      <nav className="flex-1 p-2">
        {navItems.map((item) => (
          <Button
            key={item.value}
            variant="ghost"
            className={cn("w-full justify-start mb-1", activeTab === item.value && "bg-muted")}
            onClick={() => onTabChange(item.value)}
          >
            <item.icon className="h-5 w-5 mr-2" />
            <span className="hidden md:inline-block">{item.label}</span>
          </Button>
        ))}
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            U
          </div>
          <div className="ml-2 hidden md:block">
            <p className="text-sm font-medium">User</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
      </div>
    </div>
  )
}
