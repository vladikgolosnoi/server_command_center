"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Terminal, FileText, Edit, Trash2, Copy, PlusCircle, Activity } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

// Mock server data
const mockServers = [
  {
    id: "1",
    name: "Production Web Server",
    host: "web-prod-01.example.com",
    port: 22,
    username: "admin",
    password: "********",
    status: "online",
    tags: ["production", "web"],
  },
  {
    id: "2",
    name: "Database Server",
    host: "db-prod-01.example.com",
    port: 22,
    username: "dbadmin",
    password: "********",
    status: "online",
    tags: ["production", "database"],
  },
  {
    id: "3",
    name: "Development Server",
    host: "dev-01.example.com",
    port: 22,
    username: "developer",
    password: "********",
    status: "offline",
    tags: ["development"],
  },
]

interface ServerListProps {
  onConnect: () => void
  socket: WebSocket | null
}

export default function ServerList({ onConnect, socket }: ServerListProps) {
  const [servers, setServers] = useState(mockServers)
  const [searchTerm, setSearchTerm] = useState("")
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingServer, setEditingServer] = useState<any>(null)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // In a real implementation, we would fetch servers from a database or config file
    // For demo purposes, we'll use mock data
  }, [])

  const filteredServers = servers.filter(
    (server) =>
      server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleDeleteServer = (id: string) => {
    setServers(servers.filter((server) => server.id !== id))

    toast({
      title: "Server deleted",
      description: "Server has been removed from your list",
    })
  }

  const handleEditServer = (server: any) => {
    setEditingServer({ ...server })
    setShowEditDialog(true)
  }

  const handleSaveServer = () => {
    if (editingServer) {
      setServers(servers.map((server) => (server.id === editingServer.id ? editingServer : server)))

      setShowEditDialog(false)
      setEditingServer(null)

      toast({
        title: "Server updated",
        description: "Server details have been updated",
      })
    }
  }

  const handleDuplicateServer = (server: any) => {
    const newServer = {
      ...server,
      id: Date.now().toString(),
      name: `${server.name} (Copy)`,
    }

    setServers([...servers, newServer])

    toast({
      title: "Server duplicated",
      description: "A copy of the server has been created",
    })
  }

  const handleCheckStatus = () => {
    setIsCheckingStatus(true)

    // In a real implementation, we would check the status of each server
    // For demo purposes, we'll simulate a status check with a delay
    setTimeout(() => {
      const updatedServers = servers.map((server) => ({
        ...server,
        status: Math.random() > 0.2 ? "online" : "offline",
      }))

      setServers(updatedServers)
      setIsCheckingStatus(false)

      toast({
        title: "Status check complete",
        description: "Server statuses have been updated",
      })
    }, 2000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (editingServer) {
      setEditingServer({
        ...editingServer,
        [name]: value,
      })
    }
  }

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingServer) {
      const tags = e.target.value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)

      setEditingServer({
        ...editingServer,
        tags,
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Servers</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCheckStatus} disabled={isCheckingStatus}>
            <Activity className={`mr-2 h-4 w-4 ${isCheckingStatus ? "animate-spin" : ""}`} />
            Check Status
          </Button>
          <Button onClick={onConnect}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Server
          </Button>
        </div>
      </div>

      <div className="flex w-full max-w-sm items-center space-x-2 mb-4">
        <Input placeholder="Search servers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredServers.map((server) => (
          <Card key={server.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{server.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditServer(server)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicateServer(server)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteServer(server.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>
                {server.host}:{server.port}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant={server.status === "online" ? "default" : "destructive"}>{server.status}</Badge>
                <span className="text-sm text-muted-foreground">
                  {server.username}@{server.host}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {server.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <div className="flex space-x-2">
                <Button size="sm" onClick={onConnect}>
                  <Terminal className="h-4 w-4 mr-2" />
                  Terminal
                </Button>
                <Button size="sm" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Files
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Edit Server Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Server</DialogTitle>
          </DialogHeader>
          {editingServer && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={editingServer.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="host" className="text-right">
                  Host
                </Label>
                <Input
                  id="host"
                  name="host"
                  value={editingServer.host}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="port" className="text-right">
                  Port
                </Label>
                <Input
                  id="port"
                  name="port"
                  value={editingServer.port}
                  onChange={handleInputChange}
                  className="col-span-3"
                  type="number"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  value={editingServer.username}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  value={editingServer.password}
                  onChange={handleInputChange}
                  className="col-span-3"
                  type="password"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tags" className="text-right">
                  Tags
                </Label>
                <Input
                  id="tags"
                  name="tags"
                  value={editingServer.tags.join(", ")}
                  onChange={handleTagChange}
                  className="col-span-3"
                  placeholder="production, web, etc."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveServer}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
