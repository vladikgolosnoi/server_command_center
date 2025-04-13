"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const ws_1 = require("ws");
const ssh2_1 = require("ssh2");
const server = (0, http_1.createServer)();
const wss = new ws_1.WebSocketServer({ server });
wss.on('connection', (ws) => {
    let sshClient = null;
    let stream = null;
    let userInputBuffer = "";
    ws.on('message', (msg) => {
        try {
            const data = JSON.parse(msg.toString());
            if (data.type === 'connect') {
                console.log("🛠 CONNECT payload:", data);
                const payload = data.data || data;
                const { host, port, username, password, privateKey } = payload;
                sshClient = new ssh2_1.Client();
                sshClient
                    .on('ready', () => {
                    console.log('✅ SSH connection ready');
                    ws.send(JSON.stringify({ type: 'status', message: 'SSH connection ready' }));
                    sshClient.shell((err, shellStream) => {
                        if (err) {
                            ws.send(JSON.stringify({ type: 'error', message: 'Failed to open shell' }));
                            sshClient === null || sshClient === void 0 ? void 0 : sshClient.end();
                            return;
                        }
                        stream = shellStream;
                        stream.on('data', (chunk) => {
                            const output = chunk.toString();
                            console.log("📤 SSH RAW OUTPUT:", output);
                            console.log("📡 SENDING TO CLIENT:", JSON.stringify({ type: 'data', payload: output }));
                            ws.send(JSON.stringify({ type: 'data', payload: output }));
                        });
                        stream.stderr.on('data', (chunk) => {
                            ws.send(JSON.stringify({ type: 'error', payload: chunk.toString() }));
                        });
                        stream.on('close', () => {
                            ws.send(JSON.stringify({ type: 'status', message: 'SSH shell closed' }));
                        });
                        ws.on('close', () => {
                            stream.end();
                            sshClient === null || sshClient === void 0 ? void 0 : sshClient.end();
                        });
                    });
                })
                    .on('error', (err) => {
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
                }
                else if (char === '\u0003') {
                    stream.write('\x03');
                }
                else {
                    userInputBuffer += char;
                }
            }
        }
        catch (err) {
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
    });
    ws.on('close', () => {
        sshClient === null || sshClient === void 0 ? void 0 : sshClient.end();
    });
});
server.listen(3001, () => {
    console.log('🔌 WebSocket SSH server running on ws://localhost:3001');
});
