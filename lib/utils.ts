import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Encrypt sensitive data (for demo purposes only)
export function encryptData(data: string, key: string): string {
  // In a real implementation, this would use a proper encryption algorithm
  // For demo purposes, we'll just do a simple encoding
  return btoa(data)
}

// Decrypt sensitive data (for demo purposes only)
export function decryptData(encryptedData: string, key: string): string {
  // In a real implementation, this would use a proper decryption algorithm
  // For demo purposes, we'll just do a simple decoding
  return atob(encryptedData)
}

// Generate a unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Format date
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10) + " " + date.toTimeString().slice(0, 5)
}

// Parse command for auto-completion
export function parseCommand(command: string): { base: string; args: string[] } {
  const parts = command.trim().split(/\s+/)
  return {
    base: parts[0] || "",
    args: parts.slice(1),
  }
}

// Escape shell special characters
export function escapeShellArg(arg: string): string {
  return `'${arg.replace(/'/g, "'\\''")}'`
}
