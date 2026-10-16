import React from "react";
import {
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  FileText,
  HelpCircle,
  Layers,
  Calendar,
  Sparkles,
  History,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { StudyToolType } from "../../types";

interface SidebarProps {
  currentTab: StudyToolType;
  onSelectTab: (tab: StudyToolType) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  userName = "Alexandre Dupont",
  userEmail = "alex.dupont@etudiant.fr",
  onLogout,
}) => {
  const navItems: Array<{
    id: StudyToolType;
    label: string;
    icon: React.ElementType;
    group?: "main" | "tools" | "other";
  }> = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, group: "main" },
    { id: "chat", label: "AI Chat Tuteur", icon: MessageSquare, group: "tools" },
    { id: "summary", label: "Résumer un cours", icon: FileText, group: "tools" },
    { id: "quiz", label: "Générateur de Quiz", icon: HelpCircle, group: "tools" },
    { id: "flashcards", label: "Flashcards", icon: Layers, group: "tools" },
    { id: "study-plan", label: "Plan de Révision", icon: Calendar, group: "tools" },
    { id: "explain", label: "Expliquer un concept", icon: Sparkles, group: "tools" },
    { id: "history", label: "Historique d'étude", icon: History, group: "other" },
    { id: "settings", label: "Paramètres & Clés", icon: Settings, group: "other" },
  ];

  const handleSelect = (tab: StudyToolType) => {
    onSelectTab(tab);
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 tracking-tight block">
                Erick AI
              </span>
              <span className="text-[11px] text-indigo-600 font-medium tracking-wide uppercase">
                Tuteur Étudiant
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Main Dashboard item */}
          <div className="space-y-1">
            <button
              onClick={() => handleSelect("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentTab === "dashboard"
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-600" />
              <span>Tableau de Bord</span>
            </button>
          </div>

          {/* AI Tools Section */}
          <div className="space-y-1">
            <span className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Outils Pédagogiques Erick AI
            </span>
            <button
              onClick={() => handleSelect("chat")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentTab === "chat"
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>Erick AI Chat (Vocal & Vidéos)</span>
            </button>
            <button
              onClick={() => handleSelect("explain")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentTab === "explain"
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Expliquer un concept (Schémas)</span>
            </button>
            <button
              onClick={() => handleSelect("summary")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentTab === "summary"
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Résumer un cours</span>
            </button>
            <button
              onClick={() => handleSelect("quiz")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentTab === "quiz"
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>Générateur de Quiz</span>
            </button>
            <button
              onClick={() => handleSelect("flashcards")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentTab === "flashcards"
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Flashcards</span>
            </button>
            <button
              onClick={() => handleSelect("study-plan")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentTab === "study-plan"
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Plan de Révision</span>
            </button>
          </div>

          {/* History & Settings */}
          <div className="space-y-1">
            <span className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Gestion & Historique
            </span>
            <button
              onClick={() => handleSelect("history")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentTab === "history"
                  ? "bg-slate-100 text-slate-900 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <History className="w-4 h-4 text-slate-500" />
              <span>Historique d'étude</span>
            </button>
            <button
              onClick={() => handleSelect("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentTab === "settings"
                  ? "bg-slate-100 text-slate-900 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Statut & Paramètres</span>
            </button>
          </div>
        </div>

        {/* Footer: User Profile & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center text-sm shrink-0">
                {userName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {userName}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {userEmail}
                </p>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Se déconnecter"
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
