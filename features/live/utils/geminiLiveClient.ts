/**
 * Gemini Live API Client using official @google/genai SDK
 */
import {
  EndSensitivity,
  GoogleGenAI,
  Modality,
  StartSensitivity,
  Type,
  type FunctionDeclaration,
  type LiveServerMessage,
  type LiveServerToolCall,
  type Session,
} from "@google/genai";

export type ToolCallRespond = (result: unknown) => void;

export interface GeminiLiveConfig {
  model: string;
  apiKey: string;
  systemInstruction?: string;
  voiceName?: string;
  tools?: { functionDeclarations: FunctionDeclaration[] }[];
  onAudioData: (base64Audio: string) => void;
  onInputTranscription: (text: string, isPartial: boolean) => void;
  onOutputTranscription: (text: string, isPartial: boolean) => void;
  onInterrupted?: () => void;
  onToolCall?: (
    name: string,
    args: Record<string, unknown>,
    respond: ToolCallRespond,
  ) => void;
  onError: (error: Error) => void;
  onConnected: () => void;
  onDisconnected: () => void;
}

// Default tool: Get current time
const getTimeTool = {
  functionDeclarations: [
    {
      name: "get_current_time",
      description: "Pobiera aktualny czas w strefie czasowej użytkownika",
      parameters: {
        type: Type.OBJECT,
        properties: {},
      },
    },
  ],
};

export class GeminiLiveClient {
  private session: Session | null = null;
  private config: GeminiLiveConfig;
  private isConnected = false;
  private ai: GoogleGenAI;
  private inputTranscriptBuffer = "";
  private outputTranscriptBuffer = "";

  constructor(config: GeminiLiveConfig) {
    this.config = config;
    this.ai = new GoogleGenAI({ apiKey: config.apiKey });
  }

  async connect() {
    try {
      const sessionConfig = {
        responseModalities: [Modality.AUDIO],
        systemInstruction: {
          parts: [
            {
              text:
                this.config.systemInstruction ||
                "You are a helpful AI assistant. Respond naturally and briefly in English OR Polish - match the user's language. You can see the user through the camera. IMPORTANT: ONLY use English or Polish, NO other languages.",
            },
          ],
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: this.config.voiceName || "Kore",
            },
          },
        },
        realtimeInputConfig: {
          automaticActivityDetection: {
            disabled: false,
            startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_LOW,
            endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_LOW,
            prefixPaddingMs: 200,
            silenceDurationMs: 800,
          },
        },
        tools: this.config.tools ?? [getTimeTool],
      };

      this.session = await this.ai.live.connect({
        model: this.config.model,
        config: sessionConfig,
        callbacks: {
          onopen: () => {
            console.log("Connected to Gemini Live API");
            this.isConnected = true;
            this.config.onConnected();
          },
          onmessage: (message) => {
            this.handleServerMessage(message as LiveServerMessage);
          },
          onerror: (e: ErrorEvent) => {
            console.error("Live API Error:", e.message);
            this.config.onError(new Error(e.message));
          },
          onclose: (e: CloseEvent) => {
            console.log("Disconnected from Gemini Live API:", e.reason);
            this.isConnected = false;
            this.config.onDisconnected();
          },
        },
      });
    } catch (error) {
      console.error("Failed to connect:", error);
      this.config.onError(error as Error);
    }
  }

  private handleServerMessage(message: LiveServerMessage) {
    // Tool calls live at the message level, not inside serverContent
    if (message.toolCall) {
      this.handleToolCall(message.toolCall);
    }

    const content = message.serverContent;
    if (!content) return;

    if (content.interrupted) {
      this.inputTranscriptBuffer = "";
      this.outputTranscriptBuffer = "";
      this.config.onInterrupted?.();
    }

    if (content.modelTurn?.parts) {
      for (const part of content.modelTurn.parts) {
        if (part.inlineData?.data) {
          this.config.onAudioData(part.inlineData.data);
        }
      }
    }

    const isTurnComplete = content.turnComplete === true;

    if (content.inputTranscription?.text) {
      this.inputTranscriptBuffer += content.inputTranscription.text;
      this.config.onInputTranscription(
        this.inputTranscriptBuffer,
        !isTurnComplete,
      );
      if (isTurnComplete) this.inputTranscriptBuffer = "";
    }

    if (content.outputTranscription?.text) {
      this.outputTranscriptBuffer += content.outputTranscription.text;
      this.config.onOutputTranscription(
        this.outputTranscriptBuffer,
        !isTurnComplete,
      );
      if (isTurnComplete) this.outputTranscriptBuffer = "";
    }
  }

  private handleToolCall(toolCall: LiveServerToolCall) {
    if (!toolCall.functionCalls) return;

    for (const call of toolCall.functionCalls) {
      const respond: ToolCallRespond = (result) => {
        this.session?.sendToolResponse({
          functionResponses: [
            {
              id: call.id ?? "",
              name: call.name ?? "",
              response: { result: String(result) },
            },
          ],
        });
      };

      if (call.name === "get_current_time") {
        const currentTime = new Date().toLocaleString("pl-PL", {
          timeZone: "Europe/Warsaw",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        respond(`Aktualny czas: ${currentTime}`);
      } else {
        this.config.onToolCall?.(call.name ?? "", call.args ?? {}, respond);
      }
    }
  }

  sendAudio(audioData: string) {
    if (!this.isConnected || !this.session) return;
    this.session.sendRealtimeInput({
      audio: { data: audioData, mimeType: "audio/pcm;rate=16000" },
    });
  }

  sendVideo(videoData: string) {
    if (!this.isConnected || !this.session) return;
    this.session.sendRealtimeInput({
      video: { data: videoData, mimeType: "image/jpeg" },
    });
  }

  sendText(text: string) {
    if (!this.isConnected || !this.session) return;
    this.session.sendRealtimeInput({ text });
  }

  disconnect() {
    if (this.session) {
      this.session.close();
      this.session = null;
    }
    this.isConnected = false;
  }

  isActive(): boolean {
    return this.isConnected;
  }
}
