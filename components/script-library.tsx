"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Play, Edit, Trash2, Copy, PlusCircle, Save, Clock, Tag } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import type { ServerConnection } from "@/lib/types"

// Mock script data
const mockScripts = [
  {
    id: "1",
    name: "Update System",
    description: "Update system packages",
    content: "apt-get update && apt-get upgrade -y",
    tags: ["system", "maintenance"],
    lastRun: "2023-04-10 14:30",
    version: "1.0",
  },
  {
    id: "2",
    name: "Backup Database",
    description: "Create a backup of the MySQL database",
    content: "mysqldump -u root -p mydatabase > /backup/mydatabase_$(date +%Y%m%d).sql",
    tags: ["database", "backup"],
    lastRun: "2023-04-09 10:15",
    version: "1.2",
  },
  {
    id: "3",
    name: "Check Disk Space",
    description: "Check available disk space",
    content: "df -h",
    tags: ["system", "monitoring"],
    lastRun: "2023-04-08 09:45",
    version: "1.0",
  },
]

interface ScriptLibraryProps {
  sessions: ServerConnection[]
  socket: WebSocket | null
}

export default function ScriptLibrary({ sessions, socket }: ScriptLibraryProps) {
  const [scripts, setScripts] = useState(mockScripts)
  const [searchTerm, setSearchTerm] = useState("")
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showRunDialog, setShowRunDialog] = useState(false)
  const [editingScript, setEditingScript] = useState<any>(null)
  const [runningScript, setRunningScript] = useState<any>(null)
  const [selectedServer, setSelectedServer] = useState<string>("")
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  const filteredScripts = scripts.filter(
    (script) =>
      script.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      script.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      script.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const tagFilteredScripts =
    activeTab === "all" ? filteredScripts : filteredScripts.filter((script) => script.tags.includes(activeTab))

  const uniqueTags = Array.from(new Set(scripts.flatMap((script) => script.tags)))

  const handleDeleteScript = (id: string) => {
    setScripts(scripts.filter((script) => script.id !== id))

    toast({
      title: "Script deleted",
      description: "Script has been removed from your library",
    })
  }

  const handleEditScript = (script: any) => {
    setEditingScript({ ...script })
    setShowEditDialog(true)
  }

  const handleSaveScript = () => {
    if (editingScript) {
      if (editingScript.id) {
        // Update existing script
        setScripts(
          scripts.map((script) =>
            script.id === editingScript.id
              ? {
                  ...editingScript,
                  version: (Number.parseFloat(editingScript.version) + 0.1).toFixed(1),
                }
              : script,
          ),
        )
      } else {
        // Add new script
        setScripts([
          ...scripts,
          {
            ...editingScript,
            id: Date.now().toString(),
            lastRun: "Never",
            version: "1.0",
          },
        ])
      }

      setShowEditDialog(false)
      setEditingScript(null)

      toast({
        title: "Script saved",
        description: "Script has been saved to your library",
      })
    }
  }

  const handleDuplicateScript = (script: any) => {
    const newScript = {
      ...script,
      id: Date.now().toString(),
      name: `${script.name} (Copy)`,
      version: "1.0",
      lastRun: "Never",
    }

    setScripts([...scripts, newScript])

    toast({
      title: "Script duplicated",
      description: "A copy of the script has been created",
    })
  }

  const handleNewScript = () => {
    setEditingScript({
      id: "",
      name: "",
      description: "",
      content: "",
      tags: [],
      lastRun: "Never",
      version: "1.0",
    })
    setShowEditDialog(true)
  }

  const handleRunScript = (script: any) => {
    setRunningScript(script)
    setSelectedServer(sessions.length > 0 ? sessions[0].id : "")
    setShowRunDialog(true)
  }

  const executeScript = () => {
    if (!runningScript || !selectedServer) {
      toast({
        title: "Error",
        description: "Please select a server to run the script on",
        variant: "destructive",
      })
      return
    }

    // In a real implementation, this would send the script to the server for execution
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "run-script",
          data: {
            serverId: selectedServer,
            script: runningScript.content,
          },
        }),
      )
    }

    // Update last run time
    setScripts(
      scripts.map((script) =>
        script.id === runningScript.id
          ? {
              ...script,
              lastRun: new Date().toISOString().slice(0, 10) + " " + new Date().toTimeString().slice(0, 5),
            }
          : script,
      ),
    )

    setShowRunDialog(false)
    setRunningScript(null)

    toast({
      title: "Script executed",
      description: `Running script on ${sessions.find((s) => s.id === selectedServer)?.name}`,
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (editingScript) {
      setEditingScript({
        ...editingScript,
        [name]: value,
      })
    }
  }

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingScript) {
      const tags = e.target.value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)

      setEditingScript({
        ...editingScript,
        tags,
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Script Library</h2>
        <Button onClick={handleNewScript}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Script
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <Input
          placeholder="Search scripts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {uniqueTags.map((tag) => (
              <TabsTrigger key={tag} value={tag}>
                {tag}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tagFilteredScripts.map((script) => (
          <Card key={script.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{script.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditScript(script)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicateScript(script)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteScript(script.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>{script.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="bg-muted p-2 rounded-md mb-2 font-mono text-xs overflow-auto max-h-24">
                {script.content}
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {script.lastRun}
                </div>
                <div className="flex items-center">
                  <Tag className="h-3 w-3 mr-1" />v{script.version}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <div className="flex flex-col w-full gap-2">
                <div className="flex flex-wrap gap-1">
                  {script.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => handleRunScript(script)}
                  disabled={sessions.length === 0}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Script
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Edit Script Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingScript?.id ? "Edit Script" : "New Script"}</DialogTitle>
          </DialogHeader>
          {editingScript && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={editingScript.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Script Name"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={editingScript.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Brief description of what the script does"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="content" className="text-right pt-2">
                  Script
                </Label>
                <textarea
                  id="content"
                  name="content"
                  value={editingScript.content}
                  onChange={handleInputChange}
                  className="col-span-3 flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="#!/bin/bash\n# Your script here"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tags" className="text-right">
                  Tags
                </Label>
                <Input
                  id="tags"
                  name="tags"
                  value={editingScript.tags.join(", ")}
                  onChange={handleTagChange}
                  className="col-span-3"
                  placeholder="system, backup, etc."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveScript}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Run Script Dialog */}
      <Dialog open={showRunDialog} onOpenChange={setShowRunDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run Script</DialogTitle>
          </DialogHeader>
          {runningScript && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="server" className="text-right">
                  Server
                </Label>
                <Select value={selectedServer} onValueChange={setSelectedServer}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a server" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Script</Label>
                <div className="col-span-3 bg-muted p-2 rounded-md font-mono text-xs overflow-auto max-h-[200px]">
                  {runningScript.content}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRunDialog(false)}>
              Cancel
            </Button>
            <Button onClick={executeScript}>
              <Play className="h-4 w-4 mr-2" />
              Execute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
