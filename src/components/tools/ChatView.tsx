import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  ArrowRight,
  FileCheck,
} from "lucide-react";
import Markdown from "react-markdown";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { VoiceInputButton, TextToSpeechButton } from "../ui/VoiceInputButton";
import { MediaViewer } from "../ui/MediaViewer";
import { MediaPayload, AttachmentFile } from "../../types";
import { getAuthHeaders, readFileAsBase64, formatFileSize } from "../../lib/api";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  provider?: string;
  timestamp: string;
  media?: MediaPayload;
  attachment?: {
    name: string;
    mimeType: string;
    size: number;
  };
}

interface ChatViewProps {
  initialAttachment?: AttachmentFile | null;
  onClearAttachment?: () => void;
}

const SUGGESTIONS = [
  "Explique-moi la photosynthèse avec des schémas simples",
  "Comment fonctionne le théorème de Pythagore ?",
  "Quelles sont les lois de Newton en physique ?",
  "Raconte-moi les origines de la Première Guerre mondiale",
  "Donne-moi une méthode simple pour mémoriser mon cours d'anglais",
];

export const ChatView: React.FC<ChatViewProps> = ({
  initialAttachment,
  onClearAttachment,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Bonjour ! Je suis **Erick**, ton assistant d'étude personnel. Tu peux me poser n'importe quelle question par écrit, **au micro** si tu préfères parler, ou en **téléversant un document de cours (PDF ou image)**. Je t'expliquerai tout pas à pas avec des vidéos explicatives YouTube et des schémas clairs !",
      provider: "erick",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<AttachmentFile | null>(initialAttachment || null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialAttachment) {
      setAttachedFile(initialAttachment);
    }
  }, [initialAttachment]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("pdf") && !file.type.includes("image")) {
      setUploadError("Seuls les fichiers PDF et les images (JPG, PNG, WebP) sont acceptés.");
      return;
    }

    try {
      const data = await readFileAsBase64(file);
      setAttachedFile(data);
    } catch (err: any) {
      setUploadError(err.message || "Erreur lors de la lecture du fichier.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClearAttachment = () => {
    setAttachedFile(null);
    setUploadError(null);
    if (onClearAttachment) onClearAttachment();
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if ((!query && !attachedFile) || loading) return;

    const currentAttachment = attachedFile;

    const userMsg: ChatMessage = {
      id: "user_" + Date.now(),
      role: "user",
      content: query || (currentAttachment ? `Explique-moi le document : "${currentAttachment.name}"` : ""),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachment: currentAttachment
        ? {
            name: currentAttachment.name,
            mimeType: currentAttachment.mimeType,
            size: currentAttachment.size,
          }
        : undefined,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setAttachedFile(null);
    if (onClearAttachment) onClearAttachment();
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          message: query || (currentAttachment ? `Analyse ce document de cours ("${currentAttachment.name}") et explique-moi en détail son contenu pas à pas avec des exemples concrets.` : "Bonjour Erick"),
          history: newHistory
            .filter((m) => m.id !== "welcome")
            .slice(-6)
            .map((m) => ({ role: m.role, content: m.content })),
          attachment: currentAttachment
            ? {
                name: currentAttachment.name,
                mimeType: currentAttachment.mimeType,
                size: currentAttachment.size,
                base64: currentAttachment.base64,
              }
            : undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: "bot_" + Date.now(),
            role: "assistant",
            content: data.message,
            provider: "erick",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            media: data.media,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: "bot_err_" + Date.now(),
            role: "assistant",
            content:
              "⚠️ Désolé, une erreur est survenue : " +
              (data.error?.message || "Impossible de joindre Erick."),
            provider: "erick",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: "bot_err_net_" + Date.now(),
          role: "assistant",
          content: "❌ Erreur réseau : impossible de communiquer avec Erick AI.",
          provider: "erick",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceTranscript = (text: string) => {
    setInput((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${text}` : text;
    });
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Conversation réinitialisée. Comment puis-je t'aider dans tes révisions aujourd'hui ? Tu peux me parler au micro ou joindre un cours (PDF, image).",
        provider: "erick",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            E
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              Erick AI — Tuteur Pédagogique
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-[11px] text-slate-500">
              Assistance vocale, analyse de documents (PDF/images), vidéos YouTube et schémas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearHistory}
            className="text-xs text-slate-400 hover:text-rose-600"
            title="Effacer la discussion"
          >
            Nouvelle discussion
          </Button>
        </div>
      </div>

      {/* Upload error banner */}
      {uploadError && (
        <div className="mb-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center justify-between">
          <span>{uploadError}</span>
          <button onClick={() => setUploadError(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-indigo-700 shadow-xs"
              }`}
            >
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-sm shadow-xs"
                  : "bg-white border border-slate-200/90 text-slate-800 rounded-tl-sm shadow-xs"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="flex items-center justify-between mb-2 text-[11px] text-slate-400 border-b border-slate-100 pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-500" /> Erick AI
                    </span>
                    <TextToSpeechButton text={msg.content} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="indigo" className="text-[10px] py-0">
                      Erick
                    </Badge>
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
              )}

              {/* Attached file indicator in user bubble */}
              {msg.attachment && (
                <div className="mb-2 p-2 bg-indigo-700/60 rounded-lg flex items-center gap-2 text-xs border border-indigo-500/30">
                  {msg.attachment.mimeType.includes("pdf") ? (
                    <FileText className="w-4 h-4 text-indigo-200 shrink-0" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-indigo-200 shrink-0" />
                  )}
                  <div className="truncate">
                    <span className="font-semibold">{msg.attachment.name}</span>
                    <span className="text-[10px] text-indigo-200 ml-1.5">
                      ({formatFileSize(msg.attachment.size)})
                    </span>
                  </div>
                </div>
              )}

              {msg.role === "user" ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="space-y-2">
                  <div className="prose prose-sm max-w-none text-slate-800">
                    <Markdown>{msg.content}</Markdown>
                  </div>

                  {/* Educational YouTube Videos & Explanatory Diagrams */}
                  {msg.media && (
                    <MediaViewer
                      videos={msg.media.videos}
                      images={msg.media.images}
                      title="Vidéos YouTube & Schémas explicatifs recommandés par Erick"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-sm p-4 text-xs text-slate-500 flex items-center gap-2 shadow-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Erick analyse votre demande, vos documents et recherche des explications pédagogiques...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts (if few messages) */}
      {messages.length <= 2 && !loading && !attachedFile && (
        <div className="py-2">
          <p className="text-[11px] font-medium text-slate-400 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" /> Suggestions pour démarrer :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(s)}
                className="text-left text-xs bg-white hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200 p-2 rounded-lg text-slate-700 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <span className="truncate mr-2">{s}</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attached file preview chip */}
      {attachedFile && (
        <div className="mb-2 p-2 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between gap-2 animate-in fade-in slide-in-from-bottom-1">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              {attachedFile.mimeType.includes("pdf") ? (
                <FileText className="w-4 h-4" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {attachedFile.name}
              </p>
              <p className="text-[10px] text-slate-500">
                {formatFileSize(attachedFile.size)} • Prêt pour analyse par Erick
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearAttachment}
            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            title="Supprimer le fichier joint"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input bar with Voice Input & File Upload */}
      <div className="pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center bg-white rounded-2xl border border-slate-300 shadow-xs focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 px-2"
        >
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="application/pdf,image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            title="Joindre un cours (PDF ou image)"
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Voice Input Button */}
          <div className="mr-1">
            <VoiceInputButton
              onTranscript={handleVoiceTranscript}
              disabled={loading}
            />
          </div>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              attachedFile
                ? `Pose ta question sur "${attachedFile.name}" ou appuie sur Envoyer pour une analyse complète...`
                : "Écris ou clique sur le micro pour parler à Erick..."
            }
            disabled={loading}
            className="w-full py-3.5 px-2 text-sm text-slate-900 bg-transparent focus:outline-none disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={(!input.trim() && !attachedFile) || loading}
            title="Envoyer à Erick"
            className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-1.5">
          Erick AI est configuré pour écouter vos questions vocales, analyser vos PDF / photos de cours et intégrer des vidéos et schémas.
        </p>
      </div>
    </div>
  );
};

export default ChatView;
