declare module 'ssh2' {
  import { EventEmitter } from 'events';

  export interface ConnectConfig {
    host: string;
    port: number;
    username: string;
    password?: string;
    privateKey?: string;
  }

  export class Client extends EventEmitter {
    connect(config: ConnectConfig): this;
    end(): void;
    shell(callback: (err: Error | undefined, stream: any) => void): void;
    exec(command: string, callback: (err: Error | undefined, stream: any) => void): void;
    on(event: 'ready', listener: () => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
  }
}
