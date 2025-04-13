export interface ServerConnection {
  id: string
  name: string
  host: string
  port: number
  username: string
  password?: string
  privateKey?: string
  saveCredentials?: boolean
  status: "online" | "offline" | "unknown"
  tags: string[]
}

export interface FileItem {
  name: string
  type: "file" | "folder"
  size: string
  modified: string
  permissions: string
}

export interface Script {
  id: string
  name: string
  description: string
  content: string
  tags: string[]
  lastRun: string
  version: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  status: "online" | "offline"
}

export interface ChatMessage {
  id: string
  userId: string
  text: string
  timestamp: string
}

export interface SharedSession {
  id: string
  name: string
  server: string
  owner: string
  participants: string[]
  created: string
  status: "active" | "inactive"
}
