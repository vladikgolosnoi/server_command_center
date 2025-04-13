"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusCircle, Server, FileText, Settings, Terminal, Code, Users } from "lucide-react"
import Sidebar from "@/components/sidebar"
import TerminalView from "@/components/TerminalWrapper";
import FileManager from "@/components/file-manager"
import ServerList from "@/components/server-list"
import NewConnectionDialog from "@/components/new-connection-dialog"
import ScriptLibrary from "@/components/script-library"
import CollaborationView from "@/components/collaboration-view"
import { useToast } from "@/components/ui/use-toast"
import { initializeSocketConnection } from "@/lib/socket-client"
import type { ServerConnection } from "@/lib/types"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("servers")
  const [isNewConnectionOpen, setIsNewConnectionOpen] = useState(false)
  const [activeSessions, setActiveSessions] = useState<ServerConnection[]>([])
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = initializeSocketConnection()

    newSocket.onopen = () => {
      console.log("WebSocket connection established")
      toast({
        title: "Connected to server",
        description: "WebSocket connection established successfully",
      })
    }

    newSocket.onclose = () => {
      console.log("WebSocket connection closed")
      toast({
        title: "Disconnected from server",
        description: "WebSocket connection closed",
        variant: "destructive",
      })
    }

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error)
      toast({
        title: "Connection error",
        description: "Failed to establish WebSocket connection",
        variant: "destructive",
      })
    }

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [toast])

  const handleNewConnection = () => {
    setIsNewConnectionOpen(true)
  }

  const handleConnect = async (serverDetails: ServerConnection) => {
    try {
      if (!socket) {
        throw new Error("WebSocket connection not established")
      }

      // Send connection request to server
      socket.send(
        JSON.stringify({
          type: "connect",
          data: serverDetails,
        }),
      )

      // In a real implementation, we would wait for a response from the server
      // For now, we'll simulate a successful connection
      setTimeout(() => {
        setActiveSessions([...activeSessions, serverDetails])
        setActiveTab("terminal")
        setIsNewConnectionOpen(false)

        toast({
          title: "Connected to server",
          description: `Successfully connected to ${serverDetails.name}`,
        })
      }, 1000)
    } catch (error) {
      console.error("Connection error:", error)
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to connect to server",
        variant: "destructive",
      })
    }
  }

  const handleDisconnect = (sessionId: string) => {
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "disconnect",
          data: { sessionId },
        }),
      )
    }

    setActiveSessions(activeSessions.filter((session) => session.id !== sessionId))

    toast({
      title: "Disconnected",
      description: `Session closed`,
    })
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <header className="border-b px-6 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Server Command Center</h1>
          <Button onClick={handleNewConnection}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Connection
          </Button>
        </header>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="px-6 pt-2 border-b rounded-none justify-start">
            <TabsTrigger value="servers" className="data-[state=active]:bg-muted">
              <Server className="mr-2 h-4 w-4" />
              Servers
            </TabsTrigger>
            <TabsTrigger value="terminal" className="data-[state=active]:bg-muted">
              <Terminal className="mr-2 h-4 w-4" />
              Terminal
            </TabsTrigger>
            <TabsTrigger value="files" className="data-[state=active]:bg-muted">
              <FileText className="mr-2 h-4 w-4" />
              Files
            </TabsTrigger>
            <TabsTrigger value="scripts" className="data-[state=active]:bg-muted">
              <Code className="mr-2 h-4 w-4" />
              Scripts
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="data-[state=active]:bg-muted">
              <Users className="mr-2 h-4 w-4" />
              Collaboration
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-muted">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="servers" className="flex-1 p-6">
            <ServerList onConnect={handleNewConnection} socket={socket} />
          </TabsContent>
          <TabsContent value="terminal" className="flex-1 p-0 flex">
            <TerminalView sessions={activeSessions} onDisconnect={handleDisconnect} socket={socket} />
          </TabsContent>
          <TabsContent value="files" className="flex-1 p-0">
            <FileManager sessions={activeSessions} socket={socket} />
          </TabsContent>
          <TabsContent value="scripts" className="flex-1 p-6">
            <ScriptLibrary sessions={activeSessions} socket={socket} />
          </TabsContent>
          <TabsContent value="collaboration" className="flex-1 p-6">
            <CollaborationView sessions={activeSessions} socket={socket} />
          </TabsContent>
          <TabsContent value="settings" className="flex-1 p-6">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p>Application settings will go here.</p>
          </TabsContent>
        </Tabs>
      </div>
      <NewConnectionDialog
        isOpen={isNewConnectionOpen}
        onClose={() => setIsNewConnectionOpen(false)}
        onConnect={handleConnect}
      />
    </div>
  )
}
