import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  BookOpen,
  Upload,
  X,
  FileUp,
  Image as ImageIcon,
} from "lucide-react";
import Markdown from "react-markdown";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { AttachmentFile } from "../../types";
import { getAuthHeaders, readFileAsBase64, formatFileSize } from "../../lib/api";

interface SummaryViewProps {
  initialAttachment?: AttachmentFile | null;
  onClearAttachment?: () => void;
}

const SAMPLE_TEXT = `La photosynthèse est un processus bioénergétique qui permet aux plantes, aux algues et à certaines bactéries de synthétiser de la matière organique en utilisant la lumière du soleil. L'énergie lumineuse est absorbée par des pigments photosynthétiques, principalement la chlorophylle, situés dans les chloroplastes des cellules végétales.

Ce mécanisme se déroule en deux phases distinctes :
1. La phase photochimique (dite lumineuse) : elle se déroule dans les thylakoïdes. L'énergie solaire absorbée permet la photolyse de l'eau (H2O), libérant ainsi du dioxygène (O2) dans l'atmosphère et produisant de l'ATP et du NADPH riches en énergie.
2. La phase non photochimique (cycle de Calvin ou phase sombre) : elle a lieu dans le stroma. Grâce à l'ATP et au NADPH produits précédemment, le dioxyde de carbone (CO2) atmosphérique est fixé et converti en glucides simples (comme le glucose).

Ce cycle est fondamental pour la biosphère car il constitue la source primaire de matière organique pour la quasi-totalité des chaînes trophiques terrestres et régule la teneur en oxygène et CO2 de l'atmosphère.`;

export const SummaryView: React.FC<SummaryViewProps> = ({
  initialAttachment,
  onClearAttachment,
}) => {
  const [text, setText] = useState("");
  const [subject, setSubject] = useState("");
  const [length, setLength] = useState<"short" | "medium" | "detailed">("medium");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<AttachmentFile | null>(initialAttachment || null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialAttachment) {
      setAttachedFile(initialAttachment);
      if (!subject && initialAttachment.name) {
        setSubject(initialAttachment.name.replace(/\.[^/.]+$/, ""));
      }
    }
  }, [initialAttachment]);

  const handleFilePicked = async (file: File) => {
    setError(null);
    if (!file.type.includes("pdf") && !file.type.includes("image")) {
      setError("Seuls les fichiers PDF et les images sont acceptés.");
      return;
    }
    try {
      const data = await readFileAsBase64(file);
      setAttachedFile(data);
      if (!subject) {
        setSubject(file.name.replace(/\.[^/.]+$/, ""));
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la lecture du fichier.");
    }
  };

  const handleClearFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onClearAttachment) onClearAttachment();
  };

  const handleGenerate = async () => {
    if (!attachedFile && (!text.trim() || text.length < 20)) {
      setError("Veuillez saisir un texte d'au moins 20 caractères ou téléverser un document (PDF / image) à résumer.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          text: text.trim() || undefined,
          subject: subject.trim() || undefined,
          length,
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
        setSummary(data.summary);
      } else {
        setError(data.error?.message || "Erreur lors de la génération du résumé par Erick.");
      }
    } catch {
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Résumer un Cours ou Document — Erick AI
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Téléversez vos polycopiés PDF, notes de cours ou collez votre texte pour en obtenir une fiche de révision structurée
          </p>
        </div>
        {!attachedFile && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setText(SAMPLE_TEXT);
              setSubject("Biologie : La Photosynthèse");
              setError(null);
            }}
            className="text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1" /> Exemple de cours
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column : Input form */}
        <div className="lg:col-span-6 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Paramètres du Résumé</CardTitle>
              <CardDescription className="text-xs">
                Définissez la matière, la longueur et le document source
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Matière ou Chapitre (optionnel)
                </label>
                <Input
                  placeholder="Ex : Histoire Contemporaine, Algèbre linéaire, SVT..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="text-xs"
                />
              </div>

              {/* Upload Document zone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document de cours joint (PDF ou Image)
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
                          {formatFileSize(attachedFile.size)} • Document sélectionné
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
                    className={`cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all ${
                      dragOver
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 text-indigo-600 mb-1">
                      <FileUp className="w-4 h-4" />
                      <span className="text-xs font-semibold">Téléverser un cours (PDF ou Image)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Glissez un polycopié ou cliquez pour parcourir (jusqu'à 25 Mo)
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Format et Longueur
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: "short", label: "Synthétique", desc: "Points clés & flash" },
                      { id: "medium", label: "Équilibré", desc: "Standard examen" },
                      { id: "detailed", label: "Détaillé", desc: "Complet & exemples" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setLength(opt.id)}
                      className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                        length === opt.id
                          ? "border-indigo-600 bg-indigo-50 text-indigo-950 font-semibold"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="text-xs font-medium">{opt.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {attachedFile ? "Instructions ou notes complémentaires (optionnel)" : "Texte du cours ou des notes"}
                </label>
                <Textarea
                  placeholder={
                    attachedFile
                      ? "Ajoutez des consignes particulières pour Erick (ex: se concentrer sur les formules, insister sur les définitions...)"
                      : "Collez ici le cours, le chapitre ou le paragraphe que vous souhaitez résumer..."
                  }
                  rows={attachedFile ? 4 : 8}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="text-xs"
                />
                {!attachedFile && (
                  <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
                    <span>Minimum 20 caractères recommandés</span>
                    <span>{text.length} caractères</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {error}
                </div>
              )}

              <Button
                onClick={handleGenerate}
                isLoading={loading}
                disabled={loading || (!attachedFile && text.length < 20)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {attachedFile ? "Résumer ce document avec Erick" : "Générer la Fiche de Révision"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column : Output */}
        <div className="lg:col-span-6">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <span>Fiche de Révision Pédagogique</span>
                  {summary && (
                    <Badge variant="indigo" className="text-[10px]">
                      Synthétisé par Erick AI
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs">
                  {summary ? "Prêt pour la révision et l'apprentissage" : "En attente de génération"}
                </CardDescription>
              </div>

              {summary && (
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
              )}
            </CardHeader>

            <CardContent className="flex-1 p-5 overflow-y-auto">
              {loading ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                  <p className="text-xs font-medium text-slate-600">
                    Erick synthétise votre cours et extrait les notions clés d'examen...
                  </p>
                </div>
              ) : summary ? (
                <div className="prose prose-sm max-w-none text-slate-800 space-y-2">
                  <Markdown>{summary}</Markdown>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-xl p-6 text-center">
                  <FileText className="w-10 h-10 text-slate-300 mb-2" />
                  <p className="text-xs font-medium text-slate-600">Aucun résumé généré pour l'instant</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                    Téléversez un document de cours (PDF/image) ou collez vos notes pour obtenir votre synthèse d'examen.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SummaryView;
