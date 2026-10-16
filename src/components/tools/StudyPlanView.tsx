import React, { useState } from "react";
import { Calendar, Sparkles, CheckSquare, Square, Clock, Target, Award, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { getAuthHeaders } from "../../lib/api";

interface StudyDay {
  dayNumber: number;
  title: string;
  focus: string;
  estimatedMinutes?: number;
  tasks: string[];
  tips?: string;
}

interface StudyPlanResponse {
  overview: string;
  totalDays: number;
  schedule: StudyDay[];
  generalAdvice?: string[];
}

export const StudyPlanView: React.FC = () => {
  const [subject, setSubject] = useState("");
  const [goal, setGoal] = useState("");
  const [availableDays, setAvailableDays] = useState(7);
  const [studentLevel, setStudentLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generated plan
  const [plan, setPlan] = useState<StudyPlanResponse | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const handleGenerate = async () => {
    if (!subject.trim() || !goal.trim()) {
      setError("Veuillez renseigner la matière et votre objectif principal.");
      return;
    }
    setError(null);
    setLoading(true);
    setCompletedTasks({});

    try {
      const res = await fetch("/api/ai/study-plan", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          subject,
          goal,
          availableDays,
          studentLevel,
        }),
      });

      const data = await res.json();
      if (data.success && data.plan) {
        setPlan(data.plan);
        setProvider(data.provider);
      } else {
        setError(data.error?.message || "Format du plan non reconnu.");
      }
    } catch (err) {
      setError("Erreur réseau lors de la génération du plan d'étude.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const totalTasksCount =
    plan?.schedule?.reduce((acc, day) => acc + (day.tasks?.length || 0), 0) || 0;
  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent =
    totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" /> Planificateur & Calendrier de Révision
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Programme sur-mesure structuré jour par jour avec jalons et objectifs clairs
          </p>
        </div>
      </div>

      {!plan ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Définir vos objectifs de révision</CardTitle>
            <CardDescription className="text-xs">
              L'IA découpe votre apprentissage en blocs assimilables et réalistes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Matière ou Examen
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex : Examen de Macroéconomie, Concours Médecine, BAC Maths..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Objectif cible
                </label>
                <Input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Ex : Obtenir au moins 14/20, Maîtriser les 5 premiers chapitres..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Temps disponible (Jours)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 7, 14, 30].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setAvailableDays(days)}
                      className={`py-2 text-center rounded-lg border text-xs font-medium ${
                        availableDays === days
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {days} j
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Niveau de départ
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: "beginner", label: "Débutant" },
                      { id: "intermediate", label: "Moyen" },
                      { id: "advanced", label: "Avancé" },
                    ] as const
                  ).map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setStudentLevel(lvl.id)}
                      className={`py-2 text-center rounded-lg border text-xs font-medium ${
                        studentLevel === lvl.id
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
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
              <Sparkles className="w-4 h-4 mr-1.5" /> Établir mon planning personnalisé
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {/* Plan Header & Progress */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <span>Programme : {subject}</span>
                  <Badge variant="indigo">Erick AI</Badge>
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Objectif : {goal} • {availableDays} jours
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPlan(null)}
                className="text-xs"
              >
                Nouveau plan
              </Button>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {plan.overview && (
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  {plan.overview}
                </p>
              )}

              {/* Progress */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Progression globale</span>
                  <span>
                    {completedCount} / {totalTasksCount} tâches ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Days Timeline */}
          <div className="space-y-3">
            {plan.schedule?.map((day, dIdx) => (
              <div
                key={dIdx}
                className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      J{day.dayNumber || dIdx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{day.title}</h4>
                  </div>
                  {day.estimatedMinutes && (
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> ~{day.estimatedMinutes} min
                    </span>
                  )}
                </div>

                {day.focus && (
                  <p className="text-xs text-indigo-600 font-medium mt-2">
                    🎯 Focus : {day.focus}
                  </p>
                )}

                {/* Tasks */}
                <div className="mt-3 space-y-1.5">
                  {day.tasks?.map((task, tIdx) => {
                    const taskId = `d${dIdx}_t${tIdx}`;
                    const done = completedTasks[taskId];
                    return (
                      <div
                        key={tIdx}
                        onClick={() => toggleTask(taskId)}
                        className={`flex items-start gap-2.5 p-2 rounded-lg text-xs cursor-pointer select-none transition-colors ${
                          done
                            ? "bg-slate-50 text-slate-400 line-through"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <button type="button" className="mt-0.5 text-indigo-600">
                          {done ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                        <span className="leading-snug">{task}</span>
                      </div>
                    );
                  })}
                </div>

                {day.tips && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 italic">
                    💡 Astuce : {day.tips}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* General Advice */}
          {plan.generalAdvice && plan.generalAdvice.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" /> Conseils méthodologiques pour réussir
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                  {plan.generalAdvice.map((adv, idx) => (
                    <li key={idx}>{adv}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
