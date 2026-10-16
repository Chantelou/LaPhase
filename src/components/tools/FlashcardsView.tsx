import React, { useState } from "react";
import {
  Layers,
  Sparkles,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  BookmarkCheck,
  Shuffle,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { getAuthHeaders } from "../../lib/api";

interface Flashcard {
  id?: string | number;
  front: string;
  back: string;
  hint?: string;
}

export const FlashcardsView: React.FC = () => {
  const [topicOrText, setTopicOrText] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active Deck State
  const [cards, setCards] = useState<Flashcard[] | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Record<number, boolean>>({});
  const [viewMode, setViewMode] = useState<"flip" | "grid">("flip");

  const handleGenerate = async () => {
    if (!topicOrText.trim() || topicOrText.length < 5) {
      setError("Veuillez renseigner un sujet ou coller vos notions pour générer des flashcards.");
      return;
    }
    setError(null);
    setLoading(true);
    setIsFlipped(false);
    setCurrentIdx(0);
    setKnownCards({});

    try {
      const res = await fetch("/api/ai/flashcards", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          topicOrText,
          count,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.flashcards) && data.flashcards.length > 0) {
        setCards(data.flashcards);
        setProvider(data.provider);
      } else {
        setError(data.error?.message || "Format de flashcards non reconnu.");
      }
    } catch (err) {
      setError("Erreur réseau lors de la création des flashcards.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!cards) return;
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    if (!cards) return;
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  };

  const handleShuffle = () => {
    if (!cards) return;
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIdx(0);
  };

  const toggleKnown = (idx: number) => {
    setKnownCards((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const knownCount = Object.values(knownCards).filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" /> Flashcards & Mémorisation Active
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Répétition espacée, cartes recto/verso pour retenir formules, définitions et concepts
          </p>
        </div>
      </div>

      {!cards ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Créer un paquet de Flashcards</CardTitle>
            <CardDescription className="text-xs">
              Saisissez le thème ou collez un texte de cours pour extraire les cartes clés
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thème, notion ou contenu de cours
              </label>
              <Textarea
                value={topicOrText}
                onChange={(e) => setTopicOrText(e.target.value)}
                placeholder="Ex : Vocabulaire espagnol B2, Dates de la Révolution française, Formules de trigonométrie, Définitions de droit civil..."
                rows={4}
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre de cartes à générer
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCount(num)}
                    className={`py-2 text-center rounded-lg border text-xs font-medium ${
                      count === num
                        ? "border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {num} Flashcards
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <Button
              variant="primary"
              onClick={handleGenerate}
              isLoading={loading}
              className="w-full justify-center"
            >
              <Sparkles className="w-4 h-4 mr-1.5" /> Générer les Flashcards
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Deck Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-800">
                Carte {currentIdx + 1} / {cards.length}
              </span>
              <Badge variant="success" className="text-[10px]">
                {knownCount} maîtrisée{knownCount > 1 ? "s" : ""}
              </Badge>
              <Badge variant="indigo" className="text-[10px]">
                Erick AI
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShuffle}
                className="text-xs h-8 px-2.5"
              >
                <Shuffle className="w-3.5 h-3.5 mr-1 text-slate-500" /> Mélanger
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === "flip" ? "grid" : "flip")}
                className="text-xs h-8 px-2.5"
              >
                {viewMode === "flip" ? "Vue Liste / Grille" : "Mode Révision"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCards(null)}
                className="text-xs h-8 px-2 text-slate-400 hover:text-slate-700"
              >
                Nouveau paquet
              </Button>
            </div>
          </div>

          {viewMode === "flip" ? (
            /* Interactive Flip Card */
            <div className="space-y-4">
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative cursor-pointer min-h-[260px] sm:min-h-[300px] w-full rounded-2xl bg-white border-2 border-indigo-100 hover:border-indigo-300 shadow-sm transition-all duration-200 flex flex-col justify-between p-6 sm:p-8 select-none"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-indigo-600">
                    {isFlipped ? "Verso (Réponse / Définition)" : "Recto (Question / Notion)"}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <RotateCw className="w-3 h-3" /> Cliquer pour retourner
                  </span>
                </div>

                <div className="py-6 text-center my-auto">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
                    {isFlipped ? cards[currentIdx].back : cards[currentIdx].front}
                  </h3>
                  {!isFlipped && cards[currentIdx].hint && (
                    <p className="text-xs text-slate-400 mt-3 italic">
                      💡 Indice : {cards[currentIdx].hint}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleKnown(currentIdx);
                    }}
                    className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                      knownCards[currentIdx]
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {knownCards[currentIdx] ? "Notion Maîtrisée" : "Marquer comme maîtrisé"}
                  </button>

                  <span className="text-xs text-slate-400">
                    {currentIdx + 1} / {cards.length}
                  </span>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <Button variant="outline" size="sm" onClick={handlePrev} className="px-4">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Précédente
                </Button>
                <Button variant="primary" size="sm" onClick={handleNext} className="px-4">
                  Suivante <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cards.map((c, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border bg-white space-y-2 ${
                    knownCards[idx] ? "border-emerald-300 bg-emerald-50/20" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-600">Carte #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => toggleKnown(idx)}
                      className="cursor-pointer"
                    >
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          knownCards[idx] ? "text-emerald-600" : "text-slate-300 hover:text-slate-500"
                        }`}
                      />
                    </button>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Recto</p>
                    <p className="text-xs font-medium text-slate-800">{c.front}</p>
                  </div>
                  <div className="pt-1 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Verso</p>
                    <p className="text-xs text-slate-600">{c.back}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
