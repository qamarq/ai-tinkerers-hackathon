/**
 * Audio utilities for Gemini Live API
 * Input: 16-bit PCM, 16kHz, little-endian
 * Output: 16-bit PCM, 24kHz, little-endian
 */

export class AudioProcessor {
  private audioContext: AudioContext | null = null;
  private audioWorkletNode: AudioWorkletNode | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private audioQueue: AudioBuffer[] = [];
  private isPlaying = false;
  private currentSource: AudioBufferSourceNode | null = null;

  async initialize() {
    // Create AudioContext with 16kHz sample rate for input
    this.audioContext = new AudioContext({ sampleRate: 16000 });
  }

  async startCapture(stream: MediaStream): Promise<Float32Array[]> {
    if (!this.audioContext) {
      throw new Error("AudioContext not initialized");
    }

    this.mediaStream = stream;
    this.sourceNode = this.audioContext.createMediaStreamSource(stream);

    const chunks: Float32Array[] = [];

    // Use ScriptProcessor for capturing audio
    const processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      chunks.push(new Float32Array(inputData));
    };

    this.sourceNode.connect(processor);
    processor.connect(this.audioContext.destination);

    return chunks;
  }

  // Convert Float32Array to 16-bit PCM
  float32ToPCM16(float32Array: Float32Array): ArrayBuffer {
    const int16Array = new Int16Array(float32Array.length);

    for (let i = 0; i < float32Array.length; i++) {
      // Clamp to [-1, 1] range and convert to 16-bit integer
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    return int16Array.buffer;
  }

  // Convert ArrayBuffer to base64
  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Play received PCM audio (24kHz) - queued for sequential playback
  async playAudio(base64Data: string) {
    if (!this.audioContext) {
      this.audioContext = new AudioContext({ sampleRate: 24000 });
    }

    // Decode base64 to ArrayBuffer
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Convert Int16 PCM to Float32 for Web Audio API
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);

    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / (int16Array[i] < 0 ? 0x8000 : 0x7fff);
    }

    // Create audio buffer
    const audioBuffer = this.audioContext.createBuffer(
      1,
      float32Array.length,
      24000,
    );
    audioBuffer.getChannelData(0).set(float32Array);

    // Add to queue
    this.audioQueue.push(audioBuffer);

    // Start playing if not already playing
    if (!this.isPlaying) {
      this.playNextInQueue();
    }
  }

  private playNextInQueue() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      return;
    }

    if (!this.audioContext) {
      return;
    }

    this.isPlaying = true;
    const audioBuffer = this.audioQueue.shift()!;

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);

    // When this chunk ends, play the next one
    source.onended = () => {
      this.currentSource = null;
      this.playNextInQueue();
    };

    this.currentSource = source;
    source.start(0);
  }

  // Stop playback and clear queue (for interruptions)
  stopPlayback() {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch (e) {
        // Ignore if already stopped
      }
      this.currentSource = null;
    }
    this.audioQueue = [];
    this.isPlaying = false;
  }

  cleanup() {
    this.stopPlayback();
    if (this.sourceNode) {
      this.sourceNode.disconnect();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
