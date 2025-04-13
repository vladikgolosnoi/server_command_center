"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, Send, Share2, Copy, UserPlus, MessageSquare } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { ServerConnection } from "@/lib/types"

// Mock users
const mockUsers = [
  { id: "1", name: "John Doe", email: "john@example.com", avatar: "/placeholder-user.jpg", status: "online" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", avatar: "/placeholder-user.jpg", status: "offline" },
  { id: "3", name: "Bob Johnson", email: "bob@example.com", avatar: "/placeholder-user.jpg", status: "online" },
]

// Mock chat messages
const mockMessages = [
  { id: "1", userId: "1", text: "Hey team, I'm working on the database server configuration", timestamp: "10:15 AM" },
  { id: "2", userId: "3", text: "Great! I'll handle the web server setup", timestamp: "10:17 AM" },
  { id: "3", userId: "1", text: "Can someone help me with the firewall rules?", timestamp: "10:20 AM" },
  { id: "4", userId: "2", text: "I can help with that. Let me share my screen", timestamp: "10:22 AM" },
  { id: "5", userId: "3", text: "Check out this command: iptables -L", timestamp: "10:25 AM" },
]

// Mock shared sessions
const mockSharedSessions = [
  {
    id: "1",
    name: "Database Setup",
    server: "db-prod-01.example.com",
    owner: "1",
    participants: ["1", "2", "3"],
    created: "2023-04-10 14:30",
    status: "active",
  },
  {
    id: "2",
    name: "Web Server Configuration",
    server: "web-prod-01.example.com",
    owner: "3",
    participants: ["1", "3"],
    created: "2023-04-09 10:15",
    status: "active",
  },
]

interface CollaborationViewProps {
  sessions: ServerConnection[]
  socket: WebSocket | null
}

export default function CollaborationView({ sessions, socket }: CollaborationViewProps) {
  const [activeTab, setActiveTab] = useState("chat")
  const [users, setUsers] = useState(mockUsers)
  const [messages, setMessages] = useState(mockMessages)
  const [sharedSessions, setSharedSessions] = useState(mockSharedSessions)
  const [messageText, setMessageText] = useState("")
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [selectedSession, setSelectedSession] = useState<string>("")
  const [inviteEmail, setInviteEmail] = useState("")
  const { toast } = useToast()

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!messageText.trim()) return

    const newMessage = {
      id: Date.now().toString(),
      userId: "1", // Current user
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages([...messages, newMessage])
    setMessageText("")

    // In a real implementation, this would send the message to other users
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "chat-message",
          data: newMessage,
        }),
      )
    }
  }

  const handleShareSession = () => {
    if (!selectedSession) {
      toast({
        title: "Error",
        description: "Please select a session to share",
        variant: "destructive",
      })
      return
    }

    const session = sessions.find((s) => s.id === selectedSession)

    if (!session) return

    // In a real implementation, this would create a shared session
    const newSharedSession = {
      id: Date.now().toString(),
      name: session.name,
      server: session.host,
      owner: "1", // Current user
      participants: ["1"], // Initially just the current user
      created: new Date().toISOString().slice(0, 10) + " " + new Date().toTimeString().slice(0, 5),
      status: "active",
    }

    setSharedSessions([...sharedSessions, newSharedSession])
    setShowShareDialog(false)

    toast({
      title: "Session shared",
      description: `Created shared session: ${session.name}`,
    })
  }

  const handleInviteUser = () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    // In a real implementation, this would send an invitation email
    setShowInviteDialog(false)
    setInviteEmail("")

    toast({
      title: "Invitation sent",
      description: `Sent invitation to: ${inviteEmail}`,
    })
  }

  const getUserById = (id: string) => {
    return users.find((user) => user.id === id) || { name: "Unknown User", avatar: "" }
  }

  const copyInviteLink = () => {
    // In a real implementation, this would generate and copy a unique invitation link
    navigator.clipboard.writeText("https://server-command-center.example/invite/abc123")

    toast({
      title: "Link copied",
      description: "Invitation link copied to clipboard",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Collaboration</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowInviteDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
          <Button onClick={() => setShowShareDialog(true)}>
            <Share2 className="mr-2 h-4 w-4" />
            Share Session
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat">
            <MessageSquare className="mr-2 h-4 w-4" />
            Team Chat
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <Users className="mr-2 h-4 w-4" />
            Shared Sessions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="border rounded-md mt-4">
          <div className="flex h-[500px]">
            <div className="w-1/4 border-r">
              <div className="p-4 border-b">
                <h3 className="font-medium">Team Members</h3>
              </div>
              <ScrollArea className="h-[calc(500px-57px)]">
                <div className="p-2">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center p-2 rounded-md hover:bg-muted">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                      <Badge variant={user.status === "online" ? "default" : "outline"} className="ml-auto text-xs">
                        {user.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="w-3/4 flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-medium">Team Chat</h3>
              </div>
              <ScrollArea className="flex-1 p-4">
                {messages.map((message) => {
                  const user = getUserById(message.userId)
                  const isCurrentUser = message.userId === "1"

                  return (
                    <div key={message.id} className={`flex mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                      {!isCurrentUser && (
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <div className="flex items-center mb-1">
                          <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                          <span className="text-xs font-medium ml-2">{user.name}</span>
                        </div>
                        <div
                          className={`p-3 rounded-lg ${isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                        >
                          {message.text}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </ScrollArea>
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sharedSessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <CardTitle>{session.name}</CardTitle>
                  <CardDescription>{session.server}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-4">
                    <Badge variant="outline" className="mr-2">
                      {session.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Created: {session.created}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Participants</h4>
                    <div className="flex -space-x-2">
                      {session.participants.map((userId) => {
                        const user = getUserById(userId)
                        return (
                          <Avatar key={userId} className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )
                      })}
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full ml-1">
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex gap-2 w-full">
                    <Button className="flex-1">Join Session</Button>
                    <Button variant="outline" size="icon">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Share Session Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Session</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="session" className="text-right">
                Session
              </Label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a session" />
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleShareSession}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="col-span-3"
                placeholder="user@example.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right">
                <Label>Or</Label>
              </div>
              <div className="col-span-3">
                <Button variant="outline" className="w-full" onClick={copyInviteLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Invitation Link
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteUser}>
              <Send className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
