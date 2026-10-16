import React from "react";
import { Menu, Sparkles, Database, LogOut, User } from "lucide-react";
import { StudyToolType } from "../../types";
import { Badge } from "../ui/badge";

interface HeaderProps {
  currentTab: StudyToolType;
  onOpenMobile: () => void;
  dbConnected?: boolean;
  userName?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobile,
  dbConnected = false,
  userName,
  onLogout,
}) => {
  const titles: Record<StudyToolType, { title: string; subtitle: string }> = {
    dashboard: {
      title: "Tableau de Bord Étudiant",
      subtitle: "Vue d'ensemble de vos outils et de votre progression avec Erick AI",
    },
    chat: {
      title: "Erick AI — Tuteur Interactif",
      subtitle: "Pose tes questions à l'oral ou à l'écrit avec vidéos et illustrations",
    },
    summary: {
      title: "Générateur de Résumés",
      subtitle: "Transforme tes cours volumineux en fiches de synthèse claires",
    },
    quiz: {
      title: "Générateur de Quiz Interactifs",
      subtitle: "Évalue tes connaissances avec des questions ciblées et des feedbacks",
    },
    flashcards: {
      title: "Flashcards de Révision",
      subtitle: "Mémorisation active avec répétition espacée et animations interactives",
    },
    "study-plan": {
      title: "Planificateur de Révision",
      subtitle: "Construis un rétroplanning réaliste pour cartonner à tes examens",
    },
    explain: {
      title: "Vulgarisation de Concepts — Erick AI",
      subtitle: "Comprends avec métaphores, vidéos YouTube et schémas explicatifs",
    },
    history: {
      title: "Historique d'Apprentissage",
      subtitle: "Retrouve tous tes contenus générés, quiz passés et sessions d'étude",
    },
    settings: {
      title: "Paramètres & Statut Système",
      subtitle: "Statut du moteur Erick AI et de la base de données",
    },
  };

  const currentInfo = titles[currentTab] || titles.chat;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">
            {currentInfo.title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200/80 rounded-full text-xs text-indigo-700">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-semibold">Erick AI</span>
          <span className="text-indigo-300">•</span>
          <span className="text-[11px] text-indigo-600">Tuteur Actif</span>
        </div>

        <Badge variant={dbConnected ? "success" : "neutral"} className="hidden md:inline-flex gap-1.5">
          <Database className="w-3 h-3" />
          {dbConnected ? "Base Active" : "Mode Autonome"}
        </Badge>

        {userName && (
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-indigo-700 font-bold text-xs flex items-center justify-center">
              {userName.charAt(0)}
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Se déconnecter"
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

