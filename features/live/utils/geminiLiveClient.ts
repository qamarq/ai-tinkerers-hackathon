/**
 * Gemini Live API Client using official @google/genai SDK
 */
import {
  EndSensitivity,
  GoogleGenAI,
  Modality,
  StartSensitivity,
  Type,
  type Session,
} from "@google/genai";

export interface GeminiLiveConfig {
  model: string;
  apiKey: string;
  systemInstruction?: string;
  voiceName?: string;
  onAudioData: (base64Audio: string) => void;
  onInputTranscription: (text: string, isPartial: boolean) => void;
  onOutputTranscription: (text: string, isPartial: boolean) => void;
  onInterrupted?: () => void;
  onError: (error: Error) => void;
  onConnected: () => void;
  onDisconnected: () => void;
}

// Example tool: Get current time
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
                "Jesteś pomocnym asystentem AI. Odpowiadaj naturalnie i krótko po polsku. Widzisz użytkownika przez kamerę i możesz komentować to co widzisz. Możesz używać narzędzi gdy potrzebujesz dodatkowych informacji.",
            },
          ],
        },
        // Enable audio transcriptions
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        // Configure voice
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: this.config.voiceName || "Kore",
            },
          },
        },
        // Configure VAD for better interruption handling
        realtimeInputConfig: {
          automaticActivityDetection: {
            disabled: false,
            startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_LOW,
            endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_LOW,
            prefixPaddingMs: 200,
            silenceDurationMs: 800,
          },
        },
        // Add example tools
        tools: [getTimeTool],
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
          onmessage: (message: {
            serverContent?: any;
            text?: string;
            data?: any;
            usageMetadata?: any;
          }) => {
            this.handleServerMessage(message);
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

  private handleServerMessage(message: {
    serverContent?: any;
    text?: string;
    data?: any;
  }) {
    const content = message.serverContent;

    if (!content) return;

    // Handle interruption
    if (content.interrupted) {
      console.log("Generation was interrupted");
      this.inputTranscriptBuffer = "";
      this.outputTranscriptBuffer = "";
      this.config.onInterrupted?.();
    }

    // Handle audio response
    if (content.modelTurn?.parts) {
      for (const part of content.modelTurn.parts) {
        if (part.inlineData?.data) {
          this.config.onAudioData(part.inlineData.data);
        }
      }
    }

    const isTurnComplete = content.turnComplete === true;

    // Handle input transcription (what user said)
    if (content.inputTranscription?.text) {
      this.inputTranscriptBuffer += content.inputTranscription.text;
      this.config.onInputTranscription(
        this.inputTranscriptBuffer,
        !isTurnComplete,
      );

      if (isTurnComplete) {
        this.inputTranscriptBuffer = "";
      }
    }

    // Handle output transcription (what AI said)
    if (content.outputTranscription?.text) {
      this.outputTranscriptBuffer += content.outputTranscription.text;
      this.config.onOutputTranscription(
        this.outputTranscriptBuffer,
        !isTurnComplete,
      );

      if (isTurnComplete) {
        this.outputTranscriptBuffer = "";
      }
    }

    // Handle tool calls
    if (content.toolCall) {
      console.log("Tool call received:", content.toolCall);
      this.handleToolCall(content.toolCall);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleToolCall(toolCall: any) {
    // Handle get_current_time tool
    if (toolCall.functionCalls) {
      for (const call of toolCall.functionCalls) {
        if (call.name === "get_current_time") {
          const currentTime = new Date().toLocaleString("pl-PL", {
            timeZone: "Europe/Warsaw",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          // Send tool response back
          this.session?.sendToolResponse({
            functionResponses: [
              {
                id: call.id,
                name: call.name,
                response: {
                  result: `Aktualny czas: ${currentTime}`,
                },
              },
            ],
          });
        }
      }
    }
  }

  sendAudio(audioData: string) {
    if (!this.isConnected || !this.session) {
      console.warn("Session not connected");
      return;
    }

    this.session.sendRealtimeInput({
      audio: {
        data: audioData,
        mimeType: "audio/pcm;rate=16000",
      },
    });
  }

  sendVideo(videoData: string) {
    if (!this.isConnected || !this.session) {
      console.warn("Session not connected");
      return;
    }

    this.session.sendRealtimeInput({
      video: {
        data: videoData,
        mimeType: "image/jpeg",
      },
    });
  }

  sendText(text: string) {
    if (!this.isConnected || !this.session) {
      console.warn("Session not connected");
      return;
    }

    this.session.sendRealtimeInput({
      text: text,
    });
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
