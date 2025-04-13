import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { Client } from 'ssh2';

const server = createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  let sshClient: Client | null = null;
  let stream: any = null;
  let userInputBuffer = "";

  ws.on('message', (msg: string) => {
    try {
      const data = JSON.parse(msg.toString());

      if (data.type === 'connect') {
        console.log("🛠 CONNECT payload:", data);
        const payload = data.data || data;
        const { host, port, username, password, privateKey } = payload;
        sshClient = new Client();

        sshClient
          .on('ready', () => {
            console.log('✅ SSH connection ready');
            ws.send(JSON.stringify({ type: 'status', message: 'SSH connection ready' }));

            sshClient!.shell((err: any, shellStream: any) => {
              if (err) {
                ws.send(JSON.stringify({ type: 'error', message: 'Failed to open shell' }));
                sshClient?.end();
                return;
              }

              stream = shellStream;

              stream.on('data', (chunk: Buffer) => {
                const output = chunk.toString();
                console.log("📤 SSH RAW OUTPUT:", output);
                console.log("📡 SENDING TO CLIENT:", JSON.stringify({ type: 'data', payload: output }));
                ws.send(JSON.stringify({ type: 'data', payload: output }));
              });

              stream.stderr.on('data', (chunk: Buffer) => {
                ws.send(JSON.stringify({ type: 'error', payload: chunk.toString() }));
              });

              stream.on('close', () => {
                ws.send(JSON.stringify({ type: 'status', message: 'SSH shell closed' }));
              });

              ws.on('close', () => {
                stream.end();
                sshClient?.end();
              });
            });
          })
          .on('error', (err: any) => {
            ws.send(JSON.stringify({ type: 'error', message: 'SSH error: ' + err.message }));
          })
          .connect({
            host,
            port,
            username,
            password,
            privateKey,
          });
      }

      if (data.type === 'input' && typeof data.payload === 'string' && stream) {
        const char = data.payload;

        if (char === '\r') {
          stream.write(userInputBuffer + '\n');
          console.log("🖋 FULL CMD to SSH:", JSON.stringify(userInputBuffer));
          userInputBuffer = "";
        } else if (char === '\u0003') {
          stream.write('\x03');
        } else {
          userInputBuffer += char;
        }
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    sshClient?.end();
  });
});

server.listen(3001, () => {
  console.log('🔌 WebSocket SSH server running on ws://localhost:3001');
});
