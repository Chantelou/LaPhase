import React, { useState, useEffect } from "react";
import {
  Clock,
  Trash2,
  FileText,
  HelpCircle,
  Layers,
  Calendar,
  Lightbulb,
  Search,
  Eye,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import Markdown from "react-markdown";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { getAuthHeaders } from "../../lib/api";

interface HistoryItem {
  _id: string;
  userId: string;
  type: "summary" | "quiz" | "flashcards" | "study_plan" | "explanation";
  title: string;
  input: string;
  content: string;
  metadata?: Record<string, unknown>;
  provider: "erick" | string;
  createdAt: string;
}

export const HistoryView: React.FC<{
  onOpenItem?: (item: HistoryItem) => void;
}> = () => {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/history", {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Voulez-vous vraiment supprimer cet élément de votre historique ?")) return;

    try {
      const res = await fetch(`/api/history/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((item) => item._id !== id));
        if (selectedItem?._id === id) {
          setSelectedItem(null);
        }
      }
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "summary":
        return <FileText className="w-4 h-4 text-emerald-600" />;
      case "quiz":
        return <HelpCircle className="w-4 h-4 text-purple-600" />;
      case "flashcards":
        return <Layers className="w-4 h-4 text-amber-600" />;
      case "study_plan":
        return <Calendar className="w-4 h-4 text-rose-600" />;
      case "explanation":
        return <Lightbulb className="w-4 h-4 text-sky-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "summary":
        return "Fiche Résumé";
      case "quiz":
        return "Quiz d'auto-évaluation";
      case "flashcards":
        return "Paquet Flashcards";
      case "study_plan":
        return "Plan de révision";
      case "explanation":
        return "Explication";
      default:
        return type;
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.input.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" /> Historique d'Étude & Documents Sauvegardés
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Retrouvez tous vos résumés, quiz et plans d'étude générés
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchHistory} isLoading={loading}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Actualiser
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre ou mot-clé..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "all", label: "Tous" },
            { id: "summary", label: "Résumés" },
            { id: "quiz", label: "Quiz" },
            { id: "flashcards", label: "Flashcards" },
            { id: "study_plan", label: "Plans" },
            { id: "explanation", label: "Explications" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterType(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                filterType === cat.id
                  ? "border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50 bg-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Items List */}
        <div className={selectedItem ? "lg:col-span-5 space-y-3" : "lg:col-span-12 space-y-3"}>
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
              <span>Chargement de vos documents d'étude...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-xs text-slate-500">
                <Clock className="w-8 h-8 stroke-1 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">Aucun document trouvé</p>
                <p className="text-slate-400 mt-1">
                  Vos résumés, quiz et flashcards générés s'afficheront automatiquement ici.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item._id}
                onClick={() => setSelectedItem(item)}
                className={`p-4 rounded-xl border bg-white cursor-pointer transition-all ${
                  selectedItem?._id === item._id
                    ? "border-indigo-600 ring-1 ring-indigo-600 shadow-sm"
                    : "border-slate-200/90 hover:border-slate-300 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-md bg-slate-50 border border-slate-100">
                      {getTypeIcon(item.type)}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {getTypeLabel(item.type)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="indigo" className="text-[9px] py-0">
                      Erick AI
                    </Badge>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(item._id, e)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-900 mt-2 truncate">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {item.input}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                  <span>
                    {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-indigo-600 font-medium flex items-center gap-0.5">
                    Consulter <Eye className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Item Preview Modal / Detail Panel */}
        {selectedItem && (
          <div className="lg:col-span-7">
            <Card className="sticky top-20">
              <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-slate-50">
                      {getTypeIcon(selectedItem.type)}
                    </span>
                    <CardTitle className="text-sm">{selectedItem.title}</CardTitle>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    Généré le {new Date(selectedItem.createdAt).toLocaleString("fr-FR")}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedItem(null)}
                  className="text-xs text-slate-400"
                >
                  Fermer
                </Button>
              </CardHeader>
              <CardContent className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
                {/* Check if content is JSON (Quiz, Flashcards, StudyPlan) or text (Summary, Explain) */}
                {selectedItem.content.trim().startsWith("[") ||
                selectedItem.content.trim().startsWith("{") ? (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Contenu structuré sauvegardé
                    </p>
                    <pre className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono text-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {(() => {
                        try {
                          return JSON.stringify(JSON.parse(selectedItem.content), null, 2);
                        } catch {
                          return selectedItem.content;
                        }
                      })()}
                    </pre>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none text-slate-800 text-xs leading-relaxed">
                    <Markdown>{selectedItem.content}</Markdown>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
