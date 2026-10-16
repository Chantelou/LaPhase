import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  FileText,
  HelpCircle,
  Layers,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Upload,
  FileUp,
  FileCheck,
  RefreshCw,
  Zap,
  BookOpen,
  X,
} from "lucide-react";
import { StudyToolType, DashboardStats, AttachmentFile } from "../../types";
import { Card, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { getAuthHeaders, readFileAsBase64, formatFileSize } from "../../lib/api";

interface OverviewProps {
  onSelectTool: (tool: StudyToolType, initialAttachment?: AttachmentFile) => void;
  studentName?: string;
}

export const Overview: React.FC<OverviewProps> = ({
  onSelectTool,
  studentName = "Étudiant",
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [selectedFile, setSelectedFile] = useState<AttachmentFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchLiveStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/stats", {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.warn("Could not fetch stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchLiveStats();
  }, []);

  const handleFilePicked = async (file: File) => {
    setUploadError(null);
    if (!file.type.includes("pdf") && !file.type.includes("image")) {
      setUploadError("Seuls les fichiers PDF et images (JPG, PNG, WebP) sont acceptés.");
      return;
    }
    setUploadingDoc(true);
    try {
      const attachment = await readFileAsBase64(file);
      setSelectedFile(attachment);
    } catch (err: any) {
      setUploadError(err.message || "Erreur lors du traitement du fichier.");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFilePicked(e.dataTransfer.files[0]);
    }
  };

  const tools: Array<{
    id: StudyToolType;
    title: string;
    description: string;
    icon: React.ElementType;
    badge: string;
    color: string;
  }> = [
    {
      id: "chat",
      title: "Erick AI Chat (Vocal, Docs & Vidéos)",
      description:
        "Pose tes questions à l'écrit, au micro ou en envoyant tes cours (PDF, images). Erick t'explique tout pas à pas.",
      icon: MessageSquare,
      badge: "Vocal & Multimodal",
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "explain",
      title: "Expliquer un concept ou document",
      description:
        "Vulgarisation adaptée à ton niveau avec métaphores, vidéos explicatives et schémas sur tes documents.",
      icon: Sparkles,
      badge: "Pédagogie & Schémas",
      color: "from-purple-500 to-indigo-600",
    },
    {
      id: "summary",
      title: "Résumer un cours (Texte ou PDF)",
      description:
        "Téléverse ton polycopié ou saisis ton cours pour en extraire une synthèse structurée avec points d'examens.",
      icon: FileText,
      badge: "Synthèse & PDF",
      color: "from-indigo-500 to-violet-600",
    },
    {
      id: "quiz",
      title: "Générer un Quiz",
      description:
        "Teste tes connaissances avec QCM, Vrai/Faux ou questions ouvertes et corrections pédagogiques immédiates.",
      icon: HelpCircle,
      badge: "Auto-évaluation",
      color: "from-emerald-500 to-teal-600",
    },
    {
      id: "flashcards",
      title: "Flashcards",
      description:
        "Répétition espacée interactive avec retournement de cartes et suivi d'apprentissage.",
      icon: Layers,
      badge: "Mémorisation",
      color: "from-amber-500 to-orange-600",
    },
    {
      id: "study-plan",
      title: "Plan de Révision",
      description:
        "Établis un rétroplanning journalier structuré adapté à ta date d'examen et ton niveau.",
      icon: Calendar,
      badge: "Organisation",
      color: "from-rose-500 to-pink-600",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-indigo-100 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Erick AI • Ton tuteur d'études personnalisé
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Bonjour, {studentName} !
          </h1>
          <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed">
            Prêt à réviser ? Pose une question par message vocal, téléverse un polycopié de cours en PDF ou une photo de schéma, ou entraîne-toi avec un quiz sur-mesure.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={() => onSelectTool("chat")}
              className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold shadow-xs"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Poser une question à Erick
            </Button>
            <Button
              onClick={() => onSelectTool("summary")}
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 font-semibold"
            >
              <FileUp className="w-4 h-4 mr-2" />
              Résumer un cours ou PDF
            </Button>
            <Button
              onClick={fetchLiveStats}
              variant="ghost"
              size="icon"
              title="Rafraîchir mes statistiques"
              className="text-white hover:bg-white/10"
            >
              <RefreshCw className={`w-4 h-4 ${loadingStats ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* QUICK DOCUMENT UPLOAD ZONE (PDF / Images) */}
      <Card className="p-6 border-2 border-dashed border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50/70 transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <FileUp className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Analyse & Explication de Cours (PDF & Images)
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Dépose un polycopié PDF, un exercice, un cours manuscrit ou un schéma pour obtenir des explications claires et détaillées d'Erick.
            </p>
          </div>
          {stats && stats.documentsAnalyzed > 0 && (
            <div className="text-xs font-semibold px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full flex items-center gap-1.5 shrink-0">
              <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
              {stats.documentsAnalyzed} document{stats.documentsAnalyzed > 1 ? "s" : ""} déjà analysé{stats.documentsAnalyzed > 1 ? "s" : ""}
            </div>
          )}
        </div>

        {uploadError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center justify-between">
            <span>{uploadError}</span>
            <button onClick={() => setUploadError(null)} className="text-rose-500 hover:text-rose-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {selectedFile ? (
          <div className="p-4 bg-white rounded-xl border border-indigo-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                {selectedFile.mimeType.includes("pdf") ? "PDF" : "IMG"}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 max-w-md truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500">
                  Taille : {formatFileSize(selectedFile.size)} • Prêt à être analysé
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                onClick={() => onSelectTool("chat", selectedFile)}
                className="bg-indigo-600 text-white hover:bg-indigo-700 text-xs flex-1 sm:flex-initial"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                Discuter avec Erick
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSelectTool("summary", selectedFile)}
                className="text-indigo-700 border-indigo-200 hover:bg-indigo-50 text-xs flex-1 sm:flex-initial"
              >
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                Résumer ce cours
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedFile(null)}
                className="text-slate-400 hover:text-rose-600 p-2"
                title="Supprimer ce fichier"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
              dragOver
                ? "border-indigo-600 bg-indigo-100/70 scale-[0.99]"
                : "border-slate-300 bg-white/60 hover:bg-white hover:border-indigo-400"
            }`}
          >
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
            <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {uploadingDoc
                ? "Traitement du document..."
                : "Clique ici ou glisse-dépose ton cours (PDF ou image)"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports pris en charge : Polycopiés PDF, schémas, cours photographiés, exercices (jusqu'à 25 Mo)
            </p>
          </div>
        )}
      </Card>

      {/* Real-Time Personalized Student Metrics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Mes Statistiques d'Apprentissage
            </h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
              Temps Réel
            </span>
          </div>
          {stats && stats.studyStreakDays > 0 && (
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Série de {stats.studyStreakDays} jour{stats.studyStreakDays > 1 ? "s" : ""} consécutif{stats.studyStreakDays > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">
                Activités Totales
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {loadingStats ? "-" : stats?.totalSessions ?? 0}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {loadingStats ? "Chargement..." : `+${stats?.weeklyActivityCount ?? 0} cette semaine`}
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">
                Quiz Complétés
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {loadingStats ? "-" : stats?.quizzesCompleted ?? 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {stats && stats.quizzesCompleted > 0
                ? "Auto-évaluations réussies"
                : "Aucun quiz encore fait"}
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">
                Flashcards Mémorisées
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {loadingStats ? "-" : stats?.flashcardsGenerated ?? 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {stats && stats.flashcardsDecksCount > 0
                ? `${stats.flashcardsDecksCount} paquet${stats.flashcardsDecksCount > 1 ? "s" : ""} créé${stats.flashcardsDecksCount > 1 ? "s" : ""}`
                : "0 paquet actif"}
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">
                Résumés & Plans
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {loadingStats
                ? "-"
                : (stats?.summariesCount ?? 0) + (stats?.studyPlansCreated ?? 0)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {stats?.documentsAnalyzed ? `${stats.documentsAnalyzed} docs analysés` : "Synthèses de cours"}
            </p>
          </Card>
        </div>
      </div>

      {/* Tools Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Outils Pédagogiques Erick AI
          </h3>
          <span className="text-xs text-slate-400">
            Assistance vocale & multimodale 100% active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.id}
                hoverEffect
                className="cursor-pointer group flex flex-col justify-between"
                onClick={() => onSelectTool(tool.id)}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${tool.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {tool.badge}
                    </span>
                  </div>
                  <CardTitle className="text-base group-hover:text-indigo-600 transition-colors">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-xs mt-2 line-clamp-2">
                    {tool.description}
                  </CardDescription>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                  <span>Accéder à l'outil</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity for this Student */}
      {stats && stats.recentActivities && stats.recentActivities.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Mes Récentes Révisions
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectTool("history")}
              className="text-xs text-indigo-600 hover:text-indigo-800"
            >
              Voir tout l'historique
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-xs">
            {stats.recentActivities.map((act) => (
              <div
                key={act.id}
                onClick={() => onSelectTool("history")}
                className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{act.title}</p>
                    <p className="text-[11px] text-slate-500">
                      Type : {act.type} • {new Date(act.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
