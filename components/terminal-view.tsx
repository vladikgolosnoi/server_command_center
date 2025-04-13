"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { X, Maximize2, Minimize2, Lightbulb, Copy, Download } from "lucide-react"
import { Terminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import { WebLinksAddon } from "xterm-addon-web-links"
import { SearchAddon } from "xterm-addon-search"
import type { ServerConnection } from "@/lib/types"
import { AICommandAssistant } from "@/components/ai-command-assistant"
import { useToast } from "@/components/ui/use-toast"

import "xterm/css/xterm.css"

interface TerminalViewProps {
  sessions: ServerConnection[]
  onDisconnect: (sessionId: string) => void
  socket: WebSocket | null
}

export default function TerminalView({ sessions, onDisconnect, socket }: TerminalViewProps) {
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const terminalsRef = useRef<Record<string, Terminal>>({})
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [currentCommand, setCurrentCommand] = useState("")
  const terminalRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const fitAddons = useRef<Record<string, FitAddon>>({})
  const { toast } = useToast()

  useEffect(() => {
    if (sessions.length > 0 && !activeSession) {
      setActiveSession(sessions[0].id)
    }

    sessions.forEach((session) => {
      if (!terminalsRef.current[session.id]) {
        const term = new Terminal({
          cursorBlink: true,
          theme: {
            background: "#1a1b26",
            foreground: "#c0caf5",
            cursor: "#c0caf5",
            selectionBackground: "#364A82",
          },
          fontSize: 14,
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
          lineHeight: 1.2,
        })

        const fitAddon = new FitAddon()
        term.loadAddon(fitAddon)
        term.loadAddon(new WebLinksAddon())
        term.loadAddon(new SearchAddon())
        fitAddons.current[session.id] = fitAddon

        terminalsRef.current[session.id] = term

        setTimeout(() => {
          const el = terminalRefs.current[session.id]
          if (el) {
            term.open(el)
            fitAddon.fit()
            term.writeln("\x1b[1;34m=== Server Command Center ===\x1b[0m")
            term.writeln(`\x1b[1;32mConnected to: \x1b[0m${session.name} (${session.host})`)
            term.writeln("\x1b[1;33mType commands to interact with the server.\x1b[0m")
            term.writeln("\x1b[1;33mPress the lightbulb icon for AI command assistance.\x1b[0m")
            term.write("\n$ ")

            let currentLine = ""

            term.onData((data) => {
              if (data === "\r") {
                term.write("\r\n")
                if (socket) {
                  socket.send(JSON.stringify({
                    type: "input",
                    payload: currentLine + "\n",
                  }))
                }
                currentLine = ""
                setCurrentCommand("")
                term.write("$ ")
              } else if (data === "\u007f") {
                if (currentLine.length > 0) {
                  currentLine = currentLine.slice(0, -1)
                  term.write("\b \b")
                }
              } else {
                currentLine += data
                term.write(data)
                setCurrentCommand(currentLine)
              }
            })
          }
        }, 100)
      }
    })

    if (socket) {
      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        if (msg.type === "data" && activeSession) {
          setTimeout(() => {
            const term = terminalsRef.current[activeSession!]
            if (term) {
              term.write(msg.payload)
            }
          }, 50)
        }

        if (msg.type === "error" && activeSession && terminalsRef.current[activeSession]) {
          terminalsRef.current[activeSession].writeln(`\r\n[ERROR] ${msg.message}`)
        }

        if (msg.type === "status" && activeSession && terminalsRef.current[activeSession]) {
          terminalsRef.current[activeSession].writeln(`\r\n[STATUS] ${msg.message}`)
        }
      }
    }

    const handleResize = () => {
      Object.entries(fitAddons.current).forEach(([sessionId, fitAddon]) => {
        try {
          fitAddon.fit()
        } catch (e) {
          console.error("Error fitting terminal:", e)
        }
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [sessions, activeSession, socket, toast])

  return (
    <div className={`flex flex-col w-full ${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}>
      <div className="flex justify-between items-center p-2 border-b">
        <h2 className="text-lg font-semibold">Terminal Sessions</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowAIAssistant(!showAIAssistant)} title="AI Command Assistant">
            <Lightbulb className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => {
            if (activeSession && terminalsRef.current[activeSession]) {
              const selection = terminalsRef.current[activeSession].getSelection()
              if (selection) {
                navigator.clipboard.writeText(selection)
                toast({ title: "Copied to clipboard", description: "Terminal selection copied to clipboard" })
              }
            }
          }} title="Copy Selection">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => {
            if (activeSession && terminalsRef.current[activeSession]) {
              const buffer = terminalsRef.current[activeSession].buffer.active
              let output = ""
              for (let i = 0; i < buffer.length; i++) {
                const line = buffer.getLine(i)
                if (line) output += line.translateToString() + "\n"
              }
              const blob = new Blob([output], { type: "text/plain" })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `terminal-output-${new Date().toISOString().slice(0, 10)}.txt`
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
              toast({ title: "Terminal output downloaded", description: "Terminal output saved as text file" })
            }
          }} title="Download Terminal Output">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex flex-1">
        <div className={`flex-1 flex flex-col ${showAIAssistant ? "w-2/3" : "w-full"}`}>
          <Tabs value={activeSession || ""} onValueChange={setActiveSession as any} className="flex-1 flex flex-col">
            <TabsList className="border-b rounded-none justify-start">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center">
                  <TabsTrigger value={session.id} className="data-[state=active]:bg-muted">
                    {session.name}
                  </TabsTrigger>
                  <Button variant="ghost" size="icon" className="h-7 w-7 ml-1" onClick={(e) => {
                    e.stopPropagation()
                    onDisconnect(session.id)
                  }}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </TabsList>

            {sessions.map((session) => (
              <TabsContent key={session.id} value={session.id} className="flex-1 p-0 m-0 data-[state=active]:flex">
                <Card className="flex-1 border-0 rounded-none terminal-container">
                  <div ref={(el): void => { terminalRefs.current[session.id] = el }} className="h-full w-full" />
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {showAIAssistant && (
          <div className="w-1/3 border-l p-4 overflow-auto">
            <AICommandAssistant
              currentCommand={currentCommand}
              onCommandSelect={(command) => {
                if (activeSession && terminalsRef.current[activeSession]) {
                  const term = terminalsRef.current[activeSession]
                  const currentLineLength = currentCommand.length

                  for (let i = 0; i < currentLineLength; i++) {
                    term.write("\b \b")
                  }

                  term.write(command)
                  setCurrentCommand(command)
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
