import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react";

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
  autoSendOnStop?: boolean;
  onAutoSend?: () => void;
}

// Global declaration for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  disabled = false,
  className = "",
  autoSendOnStop = false,
  onAutoSend,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "fr-FR";

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interim = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          onTranscript(finalTranscript);
          setInterimText("");
        } else {
          setInterimText(interim);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText("");
        if (autoSendOnStop && onAutoSend) {
          setTimeout(() => {
            onAutoSend();
          }, 300);
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn("Failed to init SpeechRecognition:", e);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [onTranscript, autoSendOnStop, onAutoSend]);

  const toggleListening = () => {
    if (!isSupported) {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur. Essayez Google Chrome, Microsoft Edge ou Safari.");
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        setInterimText("");
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Failed to start speech recognition:", err);
      }
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        title={
          isListening
            ? "Arrêter la dictée vocale"
            : "Dictée vocale : Parlez pour poser votre question à Erick"
        }
        className={`p-2 rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer ${
          isListening
            ? "bg-rose-600 text-white shadow-md shadow-rose-500/30 animate-pulse ring-4 ring-rose-200"
            : "bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      >
        {isListening ? (
          <div className="flex items-center gap-1.5 px-1">
            <Mic className="w-4 h-4 text-white animate-bounce" />
            <span className="text-xs font-semibold pr-1">À l'écoute...</span>
          </div>
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>

      {/* Live speech preview overlay */}
      {isListening && interimText && (
        <div className="absolute bottom-full mb-2 left-0 z-50 bg-slate-900/95 text-white text-xs px-3 py-2 rounded-xl shadow-xl backdrop-blur-sm max-w-xs whitespace-normal pointer-events-none animate-in fade-in slide-in-from-bottom-2">
          <p className="font-semibold text-indigo-300 text-[10px] uppercase tracking-wider mb-0.5">
            Transcription en direct :
          </p>
          <p className="italic">"{interimText}"</p>
        </div>
      )}
    </div>
  );
};

interface TextToSpeechButtonProps {
  text: string;
  className?: string;
}

export const TextToSpeechButton: React.FC<TextToSpeechButtonProps> = ({
  text,
  className = "",
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = () => {
    if (!window.speechSynthesis) {
      alert("La synthèse vocale n'est pas supportée par votre navigateur.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text from markdown formatting
    const cleanedText = text
      .replace(/#+\s/g, "")
      .replace(/\*{1,3}/g, "")
      .replace(/`{1,3}/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = "fr-FR";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick a French voice if available
    const voices = window.speechSynthesis.getVoices();
    const frenchVoice = voices.find((v) => v.lang.startsWith("fr"));
    if (frenchVoice) {
      utterance.voice = frenchVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      title={isSpeaking ? "Arrêter la lecture" : "Écouter la réponse d'Erick à haute voix"}
      className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
        isSpeaking
          ? "bg-indigo-600 text-white animate-pulse"
          : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
      } ${className}`}
    >
      {isSpeaking ? (
        <>
          <VolumeX className="w-3.5 h-3.5" />
          <span className="text-[11px]">Arrêter</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5" />
          <span className="text-[11px]">Écouter</span>
        </>
      )}
    </button>
  );
};
