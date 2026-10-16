import React, { useState } from "react";
import { HelpCircle, CheckCircle2, XCircle, Sparkles, RefreshCw, Trophy, RotateCcw, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { getAuthHeaders } from "../../lib/api";

interface QuizQuestion {
  id: string | number;
  question: string;
  type?: "multiple_choice" | "true_false" | "open_short";
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export const QuizView: React.FC = () => {
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [type, setType] = useState<"multiple_choice" | "true_false" | "open_short">("multiple_choice");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active quiz state
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<Record<number, boolean>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleGenerate = async () => {
    if (!subject.trim() && !text.trim()) {
      setError("Veuillez renseigner au moins une matière/sujet ou coller un extrait de cours.");
      return;
    }
    setError(null);
    setLoading(true);
    setQuestions(null);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setIsSubmitted({});
    setQuizCompleted(false);

    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          subject: subject.trim() || undefined,
          text: text.trim() || undefined,
          questionCount,
          difficulty,
          type,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        setProvider(data.provider);
      } else {
        setError(data.error?.message || "Le format de questions renvoyé n'a pas pu être validé.");
      }
    } catch (err) {
      setError("Erreur de communication avec le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (opt: string) => {
    if (isSubmitted[currentIdx]) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: opt }));
  };

  const handleSubmitQuestion = () => {
    setIsSubmitted((prev) => ({ ...prev, [currentIdx]: true }));
  };

  const handleNext = () => {
    if (!questions) return;
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const calculateScore = () => {
    if (!questions) return { score: 0, total: 0 };
    let correct = 0;
    questions.forEach((q, idx) => {
      const ans = selectedAnswers[idx];
      if (ans && q.correctAnswer) {
        // Compare loosely or match letter/exact text
        const isMatch =
          ans.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() ||
          q.correctAnswer.trim().toLowerCase().startsWith(ans.trim().toLowerCase().substring(0, 1));
        if (isMatch) correct++;
      }
    });
    return { score: correct, total: questions.length };
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" /> Quiz & Auto-évaluation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Testez votre compréhension avec des QCM et questions à correction pédagogique immédiate
          </p>
        </div>
      </div>

      {/* Generator Configuration (if no quiz or completed) */}
      {!questions ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Paramétrer votre quiz d'entraînement</CardTitle>
            <CardDescription className="text-xs">
              Définissez le sujet, le niveau de difficulté et le nombre de questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Matière / Sujet
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex : Révolutions industrielles, Fonctions dérivées, Python..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Type de questions
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "multiple_choice", label: "QCM" },
                      { id: "true_false", label: "Vrai / Faux" },
                      { id: "open_short", label: "Courte" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id)}
                      className={`py-2 px-1 text-center rounded-lg border text-xs font-medium transition-colors ${
                        type === t.id
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre de questions
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 5, 10].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setQuestionCount(count)}
                      className={`py-2 text-center rounded-lg border text-xs font-medium ${
                        questionCount === count
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {count} questions
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Niveau de difficulté
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: "easy", label: "Facile" },
                      { id: "medium", label: "Moyen" },
                      { id: "hard", label: "Avancé" },
                    ] as const
                  ).map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDifficulty(d.id)}
                      className={`py-2 text-center rounded-lg border text-xs font-medium ${
                        difficulty === d.id
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Extrait de cours spécifique (Optionnel)
              </label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Vous pouvez coller un chapitre ou une définition spécifique pour cibler le quiz..."
                rows={3}
                className="text-xs"
              />
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
              <Sparkles className="w-4 h-4 mr-1.5" /> Créer le quiz avec l'IA
            </Button>
          </CardContent>
        </Card>
      ) : quizCompleted ? (
        /* Final Score Board */
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Quiz Terminé !</h3>
              <p className="text-sm text-slate-500 mt-1">
                Voici le bilan de votre session d'entraînement
              </p>
            </div>

            <div className="py-4">
              <span className="text-4xl font-extrabold text-indigo-600">
                {calculateScore().score} / {calculateScore().total}
              </span>
              <p className="text-xs font-medium text-slate-500 mt-2">
                {calculateScore().score === calculateScore().total
                  ? "🎉 Parfait ! Vous maîtrisez parfaitement ce sujet."
                  : calculateScore().score >= calculateScore().total / 2
                  ? "👍 Bon score ! Relisez les explications pour consolider vos acquis."
                  : "💡 Ne vous découragez pas, faites un résumé ou révisez les flashcards associées."}
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentIdx(0);
                  setSelectedAnswers({});
                  setIsSubmitted({});
                  setQuizCompleted(false);
                }}
              >
                <RotateCcw className="w-4 h-4 mr-1.5" /> Recommencer ce quiz
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setQuestions(null);
                  setQuizCompleted(false);
                }}
              >
                Nouveau Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Active Question Display */
        <Card className="space-y-4">
          <CardHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-600">
                Question {currentIdx + 1} sur {questions.length}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="indigo" className="text-[10px]">
                  Erick AI
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuestions(null)}
                  className="text-xs text-slate-400 hover:text-slate-700"
                >
                  Abandonner
                </Button>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-indigo-600 h-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-2">
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {questions[currentIdx].question}
            </h3>

            {/* Options */}
            <div className="space-y-2">
              {questions[currentIdx].options && questions[currentIdx].options!.length > 0 ? (
                questions[currentIdx].options!.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentIdx] === opt;
                  const submitted = isSubmitted[currentIdx];
                  const isCorrect =
                    opt.toLowerCase() === questions[currentIdx].correctAnswer.toLowerCase() ||
                    questions[currentIdx].correctAnswer.toLowerCase().startsWith(opt.substring(0, 1).toLowerCase());

                  let btnStyle = "border-slate-200 hover:bg-slate-50 text-slate-700";
                  if (submitted) {
                    if (isCorrect) {
                      btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500";
                    } else if (isSelected) {
                      btnStyle = "border-rose-400 bg-rose-50 text-rose-900 ring-1 ring-rose-400";
                    }
                  } else if (isSelected) {
                    btnStyle = "border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-1 ring-indigo-600";
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleSelectOption(opt)}
                      disabled={submitted}
                      className={`w-full p-3.5 text-left rounded-xl border text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {submitted && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                      )}
                      {submitted && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              ) : (
                /* Fallback for text input */
                <Input
                  value={selectedAnswers[currentIdx] || ""}
                  onChange={(e) => setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: e.target.value }))}
                  placeholder="Votre réponse..."
                  disabled={isSubmitted[currentIdx]}
                />
              )}
            </div>

            {/* Explanation box when submitted */}
            {isSubmitted[currentIdx] && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span>💡 Explication :</span>
                </p>
                <p className="text-slate-600 leading-relaxed">
                  {questions[currentIdx].explanation}
                </p>
                <p className="text-[11px] text-slate-400 pt-1">
                  Bonne réponse : <span className="font-semibold text-slate-700">{questions[currentIdx].correctAnswer}</span>
                </p>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex justify-end pt-2">
              {!isSubmitted[currentIdx] ? (
                <Button
                  variant="primary"
                  onClick={handleSubmitQuestion}
                  disabled={!selectedAnswers[currentIdx]}
                >
                  Valider la réponse
                </Button>
              ) : (
                <Button variant="primary" onClick={handleNext}>
                  {currentIdx < questions.length - 1 ? (
                    <>
                      Question suivante <ArrowRight className="w-4 h-4 ml-1.5" />
                    </>
                  ) : (
                    "Voir le bilan final"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
