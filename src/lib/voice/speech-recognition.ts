// ─── Browser SpeechRecognition Wrapper ───────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */

interface SpeechRecognitionConfig {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onStateChange: (listening: boolean) => void;
  language?: string;
  continuous?: boolean;
}

export class SpeechRecognitionManager {
  private recognition: any = null;
  private config: SpeechRecognitionConfig;
  private isListening = false;

  constructor(config: SpeechRecognitionConfig) {
    this.config = config;
  }

  init(): boolean {
    const w = window as any;
    const SpeechRecognitionAPI = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      this.config.onError("Speech recognition not supported in this browser.");
      return false;
    }

    this.recognition = new SpeechRecognitionAPI();
    this.recognition.continuous = this.config.continuous ?? false;
    this.recognition.interimResults = true;
    this.recognition.lang = this.config.language || "en-US";

    this.recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        this.config.onResult(finalTranscript, true);
      } else if (interimTranscript) {
        this.config.onResult(interimTranscript, false);
      }
    };

    this.recognition.onerror = (event: any) => {
      if (event.error !== "aborted") {
        this.config.onError(`Speech recognition error: ${event.error}`);
      }
      this.isListening = false;
      this.config.onStateChange(false);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.config.onStateChange(false);
    };

    return true;
  }

  start(): void {
    if (!this.recognition) {
      if (!this.init()) return;
    }
    try {
      this.recognition!.start();
      this.isListening = true;
      this.config.onStateChange(true);
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
    }
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.config.onStateChange(false);
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}
