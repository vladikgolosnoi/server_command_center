"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  File,
  Folder,
  Upload,
  Download,
  MoreVertical,
  RefreshCw,
  FolderPlus,
  FilePlus,
  Trash2,
  Edit,
  Copy,
  Scissors,
  Server,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { ServerConnection } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

// Mock file data
const mockFiles = [
  { name: "Documents", type: "folder", size: "-", modified: "2023-04-10 14:30", permissions: "drwxr-xr-x" },
  { name: "Downloads", type: "folder", size: "-", modified: "2023-04-09 10:15", permissions: "drwxr-xr-x" },
  { name: "Pictures", type: "folder", size: "-", modified: "2023-04-08 16:20", permissions: "drwxr-xr-x" },
  { name: "Videos", type: "folder", size: "-", modified: "2023-04-07 09:45", permissions: "drwxr-xr-x" },
  { name: "example.txt", type: "file", size: "2.3 KB", modified: "2023-04-06 11:30", permissions: "-rw-r--r--" },
  { name: "config.json", type: "file", size: "4.1 KB", modified: "2023-04-05 15:20", permissions: "-rw-r--r--" },
  { name: "data.csv", type: "file", size: "1.2 MB", modified: "2023-04-04 13:10", permissions: "-rw-r--r--" },
  { name: "script.sh", type: "file", size: "512 B", modified: "2023-04-03 10:05", permissions: "-rwxr-xr-x" },
]

interface FileManagerProps {
  sessions: ServerConnection[]
  socket: WebSocket | null
}

export default function FileManager({ sessions, socket }: FileManagerProps) {
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [path, setPath] = useState("/home/user")
  const [files, setFiles] = useState(mockFiles)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [newFileName, setNewFileName] = useState("")
  const [newFileContent, setNewFileContent] = useState("")
  const [renameItem, setRenameItem] = useState<{ name: string; type: string } | null>(null)
  const [newName, setNewName] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Set the first session as active if there's no active session and sessions exist
    if (sessions.length > 0 && !activeSession) {
      setActiveSession(sessions[0].id)
    }

    // If the active session is removed, select the first available session
    if (activeSession && !sessions.find((s) => s.id === activeSession)) {
      setActiveSession(sessions.length > 0 ? sessions[0].id : null)
    }
  }, [sessions, activeSession])

  useEffect(() => {
    // Simulate loading files when path or session changes
    if (activeSession) {
      loadFiles()
    }
  }, [path, activeSession])

  const loadFiles = () => {
    setIsLoading(true)

    // In a real implementation, we would fetch files from the server
    // For demo purposes, we'll use mock data with a simulated delay
    setTimeout(() => {
      setFiles(mockFiles)
      setIsLoading(false)
    }, 500)
  }

  const handlePathChange = (newPath: string) => {
    setPath(newPath)
    setSelectedFiles([])
  }

  const handleFileClick = (file: any) => {
    if (file.type === "folder") {
      handlePathChange(`${path}/${file.name}`)
    } else {
      // In a real implementation, this would open the file
      toast({
        title: "File selected",
        description: `Opening ${file.name}`,
      })
    }
  }

  const toggleFileSelection = (fileName: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileName) ? prev.filter((name) => name !== fileName) : [...prev, fileName],
    )
  }

  const isSelected = (fileName: string) => selectedFiles.includes(fileName)

  const pathParts = path.split("/").filter(Boolean)

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty",
        variant: "destructive",
      })
      return
    }

    // In a real implementation, this would create a folder on the server
    setFiles([
      ...files,
      {
        name: newFolderName,
        type: "folder",
        size: "-",
        modified: new Date().toISOString().slice(0, 10) + " " + new Date().toTimeString().slice(0, 5),
        permissions: "drwxr-xr-x",
      },
    ])

    setShowNewFolderDialog(false)
    setNewFolderName("")

    toast({
      title: "Folder created",
      description: `Created folder: ${newFolderName}`,
    })
  }

  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      toast({
        title: "Error",
        description: "File name cannot be empty",
        variant: "destructive",
      })
      return
    }

    // In a real implementation, this would create a file on the server
    setFiles([
      ...files,
      {
        name: newFileName,
        type: "file",
        size: `${newFileContent.length} B`,
        modified: new Date().toISOString().slice(0, 10) + " " + new Date().toTimeString().slice(0, 5),
        permissions: "-rw-r--r--",
      },
    ])

    setShowNewFileDialog(false)
    setNewFileName("")
    setNewFileContent("")

    toast({
      title: "File created",
      description: `Created file: ${newFileName}`,
    })
  }

  const handleRename = () => {
    if (!renameItem || !newName.trim()) {
      toast({
        title: "Error",
        description: "New name cannot be empty",
        variant: "destructive",
      })
      return
    }

    // In a real implementation, this would rename the file/folder on the server
    setFiles(files.map((file) => (file.name === renameItem.name ? { ...file, name: newName } : file)))

    setShowRenameDialog(false)
    setRenameItem(null)
    setNewName("")

    toast({
      title: "Item renamed",
      description: `Renamed ${renameItem.type}: ${renameItem.name} to ${newName}`,
    })
  }

  const handleDelete = (fileName: string) => {
    // In a real implementation, this would delete the file/folder on the server
    setFiles(files.filter((file) => file.name !== fileName))
    setSelectedFiles(selectedFiles.filter((name) => name !== fileName))

    toast({
      title: "Item deleted",
      description: `Deleted: ${fileName}`,
    })
  }

  const handleDeleteSelected = () => {
    if (selectedFiles.length === 0) return

    // In a real implementation, this would delete the files/folders on the server
    setFiles(files.filter((file) => !selectedFiles.includes(file.name)))
    setSelectedFiles([])

    toast({
      title: "Items deleted",
      description: `Deleted ${selectedFiles.length} item(s)`,
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    // In a real implementation, this would upload the files to the server
    if (e.dataTransfer.files.length > 0) {
      const uploadedFiles = Array.from(e.dataTransfer.files)

      // Simulate file upload
      const newFiles = uploadedFiles.map((file) => ({
        name: file.name,
        type: "file",
        size: `${(file.size / 1024).toFixed(1)} KB`,
        modified: new Date().toISOString().slice(0, 10) + " " + new Date().toTimeString().slice(0, 5),
        permissions: "-rw-r--r--",
      }))

      setFiles([...files, ...newFiles])

      toast({
        title: "Files uploaded",
        description: `Uploaded ${uploadedFiles.length} file(s)`,
      })
    }
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-6">
        <Server className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Active Sessions</h2>
        <p className="text-muted-foreground mb-4">Connect to a server to browse files.</p>
        <Button onClick={() => {}}>New Connection</Button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Select value={activeSession || ""} onValueChange={setActiveSession as any}>
            <SelectTrigger className="w-[200px]">
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

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => handlePathChange("/")}>/</BreadcrumbLink>
              </BreadcrumbItem>
              {pathParts.map((part, index) => (
                <BreadcrumbItem key={index}>
                  <BreadcrumbSeparator />
                  <BreadcrumbLink onClick={() => handlePathChange("/" + pathParts.slice(0, index + 1).join("/"))}>
                    {part}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={loadFiles} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setShowNewFolderDialog(true)}>
            <FolderPlus className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setShowNewFileDialog(true)}>
            <FilePlus className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Upload className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" disabled={selectedFiles.length === 0}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" disabled={selectedFiles.length === 0} onClick={handleDeleteSelected}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        className={`border rounded-md flex-1 overflow-auto ${isDragging ? "dropzone active" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging ? (
          <div className="dropzone h-full flex items-center justify-center">
            <div className="text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium">Drop files here to upload</h3>
              <p className="text-sm text-muted-foreground">Files will be uploaded to the current directory</p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Modified</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow
                  key={file.name}
                  className={`file-row ${isSelected(file.name) ? "selected" : ""}`}
                  onClick={() => toggleFileSelection(file.name)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {file.type === "folder" ? (
                        <Folder className="h-4 w-4 mr-2 text-blue-500" />
                      ) : (
                        <File className="h-4 w-4 mr-2 text-gray-500" />
                      )}
                      <span
                        className="cursor-pointer hover:underline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFileClick(file)
                        }}
                      >
                        {file.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{file.size}</TableCell>
                  <TableCell>{file.modified}</TableCell>
                  <TableCell>{file.permissions}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setRenameItem(file)
                            setNewName(file.name)
                            setShowRenameDialog(true)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Scissors className="h-4 w-4 mr-2" />
                          Cut
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(file.name)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folderName" className="text-right">
                Folder Name
              </Label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="col-span-3"
                placeholder="New Folder"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New File Dialog */}
      <Dialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fileName" className="text-right">
                File Name
              </Label>
              <Input
                id="fileName"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="col-span-3"
                placeholder="new-file.txt"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fileContent" className="text-right">
                Content
              </Label>
              <textarea
                id="fileContent"
                value={newFileContent}
                onChange={(e) => setNewFileContent(e.target.value)}
                className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="File content..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFileDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFile}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename {renameItem?.type}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newName" className="text-right">
                New Name
              </Label>
              <Input
                id="newName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3"
                placeholder={renameItem?.name}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
