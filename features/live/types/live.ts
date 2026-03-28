export interface LiveChatConfig {
  model: string;
  systemInstruction?: string;
}

export interface LiveChatMessage {
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

export type ConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";
