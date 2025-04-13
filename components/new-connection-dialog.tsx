"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import type { ServerConnection } from "@/lib/types"

interface NewConnectionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (serverDetails: ServerConnection) => void
}

export default function NewConnectionDialog({ isOpen, onClose, onConnect }: NewConnectionDialogProps) {
  const [authType, setAuthType] = useState("password")
  const [serverDetails, setServerDetails] = useState<ServerConnection>({
    id: Date.now().toString(),
    name: "",
    host: "",
    port: 22,
    username: "",
    password: "",
    privateKey: "",
    saveCredentials: true,
    status: "unknown",
    tags: ["new"],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setServerDetails((prev) => ({
      ...prev,
      [name]: name === "port" ? Number.parseInt(value) : value,
    }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setServerDetails((prev) => ({ ...prev, saveCredentials: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConnect(serverDetails)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Connection</DialogTitle>
            <DialogDescription>Enter the details to connect to your server.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={serverDetails.name}
                onChange={handleChange}
                className="col-span-3"
                placeholder="My Server"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="host" className="text-right">
                Host
              </Label>
              <Input
                id="host"
                name="host"
                value={serverDetails.host}
                onChange={handleChange}
                className="col-span-3"
                placeholder="example.com"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="port" className="text-right">
                Port
              </Label>
              <Input
                id="port"
                name="port"
                value={serverDetails.port.toString()}
                onChange={handleChange}
                className="col-span-3"
                type="number"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={serverDetails.username}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            <Tabs value={authType} onValueChange={setAuthType} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="key">Private Key</TabsTrigger>
              </TabsList>
              <TabsContent value="password">
                <div className="grid grid-cols-4 items-center gap-4 mt-4">
                  <Label htmlFor="password" className="text-right">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    value={serverDetails.password}
                    onChange={handleChange}
                    className="col-span-3"
                    type="password"
                    required={authType === "password"}
                  />
                </div>
              </TabsContent>
              <TabsContent value="key">
                <div className="grid grid-cols-4 items-center gap-4 mt-4">
                  <Label htmlFor="privateKey" className="text-right">
                    Private Key
                  </Label>
                  <Input
                    id="privateKey"
                    name="privateKey"
                    value={serverDetails.privateKey}
                    onChange={handleChange}
                    className="col-span-3"
                    required={authType === "key"}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="saveCredentials"
                checked={serverDetails.saveCredentials}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="saveCredentials">Save credentials (encrypted)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Connect</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
