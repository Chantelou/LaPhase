import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  HelpCircle,
  BookOpen,
  Lightbulb,
  Copy,
  Check,
  FileUp,
  FileText,
  Image as ImageIcon,
  X,
  Upload,
} from "lucide-react";
import Markdown from "react-markdown";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { VoiceInputButton, TextToSpeechButton } from "../ui/VoiceInputButton";
import { MediaViewer } from "../ui/MediaViewer";
import { MediaPayload, AttachmentFile } from "../../types";
import { getAuthHeaders, readFileAsBase64, formatFileSize } from "../../lib/api";

interface ExplainViewProps {
  initialAttachment?: AttachmentFile | null;
  onClearAttachment?: () => void;
}

const SAMPLE_CONCEPTS = [
  "La photosynthèse",
  "Le théorème de Pythagore",
  "L'entropie thermodynamique",
  "La première loi de Newton",
  "La Première Guerre mondiale",
  "Le tri rapide (Quicksort)",
];

export const ExplainView: React.FC<ExplainViewProps> = ({
  initialAttachment,
  onClearAttachment,
}) => {
  const [concept, setConcept] = useState("");
  const [level, setLevel] = useState<"explain_like_i_am_10" | "beginner" | "intermediate" | "advanced">("explain_like_i_am_10");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [media, setMedia] = useState<MediaPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [attachedFile, setAttachedFile] = useState<AttachmentFile | null>(initialAttachment || null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialAttachment) {
      setAttachedFile(initialAttachment);
      if (!concept && initialAttachment.name) {
        setConcept(`Document : ${initialAttachment.name.replace(/\.[^/.]+$/, "")}`);
      }
    }
  }, [initialAttachment]);

  const handleFilePicked = async (file: File) => {
    setError(null);
    if (!file.type.includes("pdf") && !file.type.includes("image")) {
      setError("Seuls les fichiers PDF et les images (JPG, PNG, WebP) sont acceptés.");
      return;
    }
    try {
      const data = await readFileAsBase64(file);
      setAttachedFile(data);
      if (!concept) {
        setConcept(`Document : ${file.name.replace(/\.[^/.]+$/, "")}`);
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors du traitement du fichier.");
    }
  };

  const handleClearFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onClearAttachment) onClearAttachment();
  };

  const handleGenerate = async (queryText?: string) => {
    const targetConcept = (queryText || concept).trim();
    if (!targetConcept && !attachedFile) {
      setError("Veuillez renseigner un concept à expliquer ou joindre un document (PDF/image).");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          concept: targetConcept || (attachedFile ? `Analyse et explication du document : ${attachedFile.name}` : ""),
          level,
          attachment: attachedFile
            ? {
                name: attachedFile.name,
                mimeType: attachedFile.mimeType,
                size: attachedFile.size,
                base64: attachedFile.base64,
              }
            : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setExplanation(data.explanation);
        setMedia(data.media || null);
      } else {
        setError(data.error?.message || "Erreur lors de l'explication par Erick.");
      }
    } catch {
      setError("Erreur réseau de communication avec Erick.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!explanation) return;
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVoiceTranscript = (text: string) => {
    setConcept((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${text}` : text;
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" /> Explication de Concepts & Documents — Erick AI
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Démystifiez les notions difficiles avec des explications claires, des vidéos YouTube et des schémas visuels
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Quelle notion ou cours souhaitez-vous comprendre ?</CardTitle>
          <CardDescription className="text-xs">
            Posez votre question à l'écrit, au micro ou en téléversant une photo/PDF de cours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Concept, formule, chapitre ou question
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Ex : Comment fonctionne la réfraction de la lumière ? ou Théorème de Thalès..."
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGenerate();
                }}
                className="text-xs"
              />
              <VoiceInputButton onTranscript={handleVoiceTranscript} disabled={loading} />
            </div>
          </div>

          {/* Document Upload Option */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document ou schéma à analyser (optionnel)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf,image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFilePicked(e.target.files[0]);
                }
              }}
            />

            {attachedFile ? (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    {attachedFile.mimeType.includes("pdf") ? (
                      <FileText className="w-4 h-4" />
                    ) : (
                      <ImageIcon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {attachedFile.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {formatFileSize(attachedFile.size)} • Document joint
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Retirer ce fichier"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files?.[0]) handleFilePicked(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-xl border border-dashed p-3 text-center transition-all ${
                  dragOver
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2 text-indigo-600 text-xs font-semibold">
                  <FileUp className="w-4 h-4" />
                  <span>Joindre une photo d'exercice, de schéma ou un PDF</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick concept pills */}
          {!attachedFile && (
            <div>
              <span className="text-[11px] text-slate-400 font-medium">Exemples fréquents :</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {SAMPLE_CONCEPTS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setConcept(item);
                      handleGenerate(item);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Niveau d'explication souhaité
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { id: "explain_like_i_am_10", label: "Comme à un enfant (10 ans)", badge: "Métaphores simples" },
                  { id: "beginner", label: "Débutant", badge: "Fondamentaux" },
                  { id: "intermediate", label: "Intermédiaire", badge: "Lycée / Prépa" },
                  { id: "advanced", label: "Avancé", badge: "Universitaire / Rigueur" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLevel(opt.id)}
                  className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    level === opt.id
                      ? "border-indigo-600 bg-indigo-50 text-indigo-950 font-semibold"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="text-xs font-medium">{opt.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{opt.badge}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <Button
            onClick={() => handleGenerate()}
            isLoading={loading}
            disabled={loading || (!concept.trim() && !attachedFile)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Demander l'explication à Erick
          </Button>
        </CardContent>
      </Card>

      {/* Output Section */}
      {explanation && (
        <Card className="animate-in fade-in duration-300">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <span>Explication Pédagogique — Erick AI</span>
                <Badge variant="indigo" className="text-[10px]">
                  {level === "explain_like_i_am_10" ? "Vulgarisation 10 ans" : level}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Structuré pour une assimilation pas-à-pas avec exemples concrets
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <TextToSpeechButton text={explanation} />
              <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs">
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1 text-slate-500" /> Copier
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-6">
            <div className="prose prose-sm max-w-none text-slate-800 space-y-3">
              <Markdown>{explanation}</Markdown>
            </div>

            {/* Educational YouTube Videos & Diagrams */}
            {media && (
              <MediaViewer
                videos={media.videos}
                images={media.images}
                title="Vidéos YouTube & Schémas explicatifs sélectionnés par Erick"
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExplainView;
