// Real WebSocket client for connecting to local SSH WebSocket server

export function initializeSocketConnection(): WebSocket {
  const socket = new WebSocket("ws://localhost:3001");
  return socket;
}
