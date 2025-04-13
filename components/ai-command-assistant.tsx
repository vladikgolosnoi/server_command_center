"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lightbulb, Search, Copy, Info, Terminal, History } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Mock command suggestions
const mockSuggestions = {
  ls: {
    description: "List directory contents",
    examples: [
      { command: "ls -la", description: "List all files in long format" },
      { command: "ls -lh", description: "List files with human-readable sizes" },
      { command: "ls -lt", description: "List files sorted by modification time" },
    ],
  },
  cd: {
    description: "Change directory",
    examples: [
      { command: "cd ..", description: "Go up one directory" },
      { command: "cd ~", description: "Go to home directory" },
      { command: "cd -", description: "Go to previous directory" },
    ],
  },
  grep: {
    description: "Search for patterns in files",
    examples: [
      { command: "grep -i 'pattern' file.txt", description: "Case-insensitive search" },
      { command: "grep -r 'pattern' .", description: "Recursive search in current directory" },
      { command: "grep -v 'pattern' file.txt", description: "Show lines that don't match" },
    ],
  },
  find: {
    description: "Search for files in a directory hierarchy",
    examples: [
      { command: "find . -name '*.txt'", description: "Find all .txt files" },
      { command: "find . -type d -name 'logs'", description: "Find directories named 'logs'" },
      { command: "find . -mtime -7", description: "Find files modified in the last 7 days" },
    ],
  },
  ps: {
    description: "Report process status",
    examples: [
      { command: "ps aux", description: "Show all processes for all users" },
      { command: "ps -ef", description: "Full format listing" },
      { command: "ps aux | grep nginx", description: "Find nginx processes" },
    ],
  },
  df: {
    description: "Report file system disk space usage",
    examples: [
      { command: "df -h", description: "Show sizes in human-readable format" },
      { command: "df -i", description: "Show inode information" },
      { command: "df -T", description: "Show file system type" },
    ],
  },
  du: {
    description: "Estimate file space usage",
    examples: [
      { command: "du -sh *", description: "Summarize sizes of directories in current location" },
      { command: "du -h --max-depth=1", description: "Show sizes of subdirectories (1 level)" },
      { command: "du -a | sort -n -r | head -n 10", description: "Find the 10 largest files/directories" },
    ],
  },
  chmod: {
    description: "Change file mode bits",
    examples: [
      { command: "chmod 755 file.sh", description: "Make a script executable" },
      { command: "chmod -R 644 directory", description: "Recursively change permissions" },
      { command: "chmod u+x file", description: "Add execute permission for the owner" },
    ],
  },
  chown: {
    description: "Change file owner and group",
    examples: [
      { command: "chown user:group file", description: "Change owner and group" },
      { command: "chown -R user directory", description: "Recursively change owner" },
      { command: "chown :group file", description: "Change only the group" },
    ],
  },
  tar: {
    description: "Archive files",
    examples: [
      { command: "tar -czvf archive.tar.gz directory/", description: "Create a compressed archive" },
      { command: "tar -xzvf archive.tar.gz", description: "Extract a compressed archive" },
      { command: "tar -tvf archive.tar", description: "List contents of an archive" },
    ],
  },
}

// Mock command history
const mockHistory = [
  { command: "ls -la", timestamp: "10:15 AM" },
  { command: "cd /var/log", timestamp: "10:17 AM" },
  { command: "grep -i error *.log", timestamp: "10:20 AM" },
  { command: "tail -f system.log", timestamp: "10:22 AM" },
  { command: "ps aux | grep nginx", timestamp: "10:25 AM" },
  { command: "df -h", timestamp: "10:30 AM" },
  { command: "du -sh *", timestamp: "10:35 AM" },
  { command: "find . -name '*.conf'", timestamp: "10:40 AM" },
]

interface AICommandAssistantProps {
  currentCommand: string
  onCommandSelect: (command: string) => void
}

export function AICommandAssistant({ currentCommand, onCommandSelect }: AICommandAssistantProps) {
  const [activeTab, setActiveTab] = useState("suggestions")
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [history, setHistory] = useState(mockHistory)
  const [commandExplanation, setCommandExplanation] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Update suggestions based on current command
    if (currentCommand) {
      const command = currentCommand.split(" ")[0]

      if (mockSuggestions[command]) {
        setSuggestions(mockSuggestions[command].examples)
      } else {
        // Find partial matches
        const matches = Object.entries(mockSuggestions)
          .filter(([cmd]) => cmd.startsWith(command))
          .flatMap(([cmd, data]) =>
            data.examples.map((example) => ({
              ...example,
              baseCommand: cmd,
            })),
          )

        setSuggestions(matches)
      }
    } else {
      // Show popular commands when no input
      const popularCommands = Object.entries(mockSuggestions)
        .slice(0, 5)
        .flatMap(([cmd, data]) =>
          data.examples.slice(0, 1).map((example) => ({
            ...example,
            baseCommand: cmd,
          })),
        )

      setSuggestions(popularCommands)
    }
  }, [currentCommand])

  const handleSearch = () => {
    if (!searchTerm.trim()) return

    // Search through all commands and examples
    const results = Object.entries(mockSuggestions)
      .filter(
        ([cmd, data]) => cmd.includes(searchTerm) || data.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .flatMap(([cmd, data]) =>
        data.examples.map((example) => ({
          ...example,
          baseCommand: cmd,
        })),
      )

    setSuggestions(results)
  }

  const handleExplain = (command: string) => {
    // Find the command in our database
    const baseCommand = command.split(" ")[0]

    if (mockSuggestions[baseCommand]) {
      setCommandExplanation({
        command,
        baseCommand,
        description: mockSuggestions[baseCommand].description,
        details:
          "This command is used to " +
          mockSuggestions[baseCommand].description.toLowerCase() +
          ". " +
          "It's commonly used for managing files and directories on Unix-like systems.",
        examples: mockSuggestions[baseCommand].examples,
        options: [
          { flag: "-a", description: "Show all files (including hidden)" },
          { flag: "-l", description: "Use long listing format" },
          { flag: "-h", description: "Human-readable sizes" },
        ],
      })
    } else {
      setCommandExplanation({
        command,
        baseCommand: "unknown",
        description: "Unknown command",
        details: "This command is not in our database. Would you like to search online for more information?",
        examples: [],
        options: [],
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)

    toast({
      title: "Copied to clipboard",
      description: `Command copied: ${text}`,
    })
  }

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
            AI Command Assistant
          </CardTitle>
          <CardDescription>Get suggestions, explanations, and help with terminal commands</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex items-center space-x-2 mb-4">
            <Input
              placeholder="Search commands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button size="icon" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="suggestions">
                <Terminal className="h-4 w-4 mr-2" />
                Suggestions
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
              <TabsTrigger value="explanation" disabled={!commandExplanation}>
                <Info className="h-4 w-4 mr-2" />
                Explanation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="suggestions" className="flex-1 mt-4">
              <ScrollArea className="h-[calc(100vh-350px)]">
                <div className="space-y-2">
                  {currentCommand && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">Current Command</h3>
                      <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                        <code className="text-sm">{currentCommand}</code>
                        <Button variant="ghost" size="icon" onClick={() => handleExplain(currentCommand)}>
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <h3 className="text-sm font-medium mb-2">
                    {searchTerm ? "Search Results" : currentCommand ? "Suggestions" : "Popular Commands"}
                  </h3>

                  {suggestions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No suggestions available</p>
                  ) : (
                    suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="bg-card border rounded-md p-3 hover:bg-muted cursor-pointer"
                        onClick={() => onCommandSelect(suggestion.command)}
                      >
                        <div className="flex items-center justify-between">
                          <code className="text-sm font-bold">{suggestion.command}</code>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(suggestion.command)
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleExplain(suggestion.command)
                                setActiveTab("explanation")
                              }}
                            >
                              <Info className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="history" className="flex-1 mt-4">
              <ScrollArea className="h-[calc(100vh-350px)]">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium mb-2">Command History</h3>

                  {history.map((item, index) => (
                    <div
                      key={index}
                      className="bg-card border rounded-md p-3 hover:bg-muted cursor-pointer"
                      onClick={() => onCommandSelect(item.command)}
                    >
                      <div className="flex items-center justify-between">
                        <code className="text-sm">{item.command}</code>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(item.command)
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="explanation" className="flex-1 mt-4">
              {commandExplanation && (
                <ScrollArea className="h-[calc(100vh-350px)]">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Command</h3>
                      <div className="bg-muted p-2 rounded-md">
                        <code className="text-sm">{commandExplanation.command}</code>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Description</h3>
                      <p className="text-sm">{commandExplanation.description}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Details</h3>
                      <p className="text-sm">{commandExplanation.details}</p>
                    </div>

                    {commandExplanation.options.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-2">Common Options</h3>
                        <div className="space-y-1">
                          {commandExplanation.options.map((option, index) => (
                            <div key={index} className="grid grid-cols-[80px_1fr] text-sm">
                              <code className="text-sm">{option.flag}</code>
                              <span>{option.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {commandExplanation.examples.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-2">Examples</h3>
                        <div className="space-y-2">
                          {commandExplanation.examples.map((example, index) => (
                            <div
                              key={index}
                              className="bg-card border rounded-md p-3 hover:bg-muted cursor-pointer"
                              onClick={() => onCommandSelect(example.command)}
                            >
                              <div className="flex items-center justify-between">
                                <code className="text-sm">{example.command}</code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    copyToClipboard(example.command)
                                  }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{example.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
