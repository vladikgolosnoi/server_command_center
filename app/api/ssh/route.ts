import { NextResponse } from "next/server";
import { Client } from "ssh2";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { host, port, username, password, privateKey, command = "whoami" } = body;

    if (!host || !port || !username || (!password && !privateKey)) {
      return NextResponse.json({ error: "Missing required connection parameters" }, { status: 400 });
    }

    const conn = new Client();

    return new Promise((resolve) => {
      conn
        .on("ready", () => {
          conn.exec(command, (err, stream) => {
            if (err) {
              conn.end();
              return resolve(
                NextResponse.json({ error: "Command execution failed" }, { status: 500 })
              );
            }

            let data = "";
            stream
              .on("close", () => {
                conn.end();
                resolve(
                  NextResponse.json({
                    success: true,
                    output: data,
                    message: `Command executed on ${host}:${port} as ${username}`,
                  })
                );
              })
              .on("data", (chunk: Buffer) => {
                data += chunk;
              })
              .stderr.on("data", (errData: Buffer) => {
                data += `STDERR: ${errData}`;
              });
          });
        })
        .on("error", (err) => {
          resolve(NextResponse.json({ error: "SSH connection failed", detail: err.message }, { status: 500 }));
        })
        .connect({
          host,
          port: parseInt(port),
          username,
          password,
          privateKey,
        });
    });
  } catch (error) {
    console.error("SSH connection error:", error);
    return NextResponse.json({ error: "Failed to establish SSH connection" }, { status: 500 });
  }
}
