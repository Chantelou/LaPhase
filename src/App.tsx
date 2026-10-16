import React, { useState, useEffect } from "react";
import { StudyToolType, UserSession, AttachmentFile } from "./types";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { AuthView } from "./components/auth/AuthView";
import { Overview } from "./components/dashboard/Overview";
import { StatusSettings } from "./components/dashboard/StatusSettings";
import { ChatView } from "./components/tools/ChatView";
import { SummaryView } from "./components/tools/SummaryView";
import { QuizView } from "./components/tools/QuizView";
import { FlashcardsView } from "./components/tools/FlashcardsView";
import { StudyPlanView } from "./components/tools/StudyPlanView";
import { ExplainView } from "./components/tools/ExplainView";
import { HistoryView } from "./components/tools/HistoryView";

export default function App() {
  const [currentTab, setCurrentTab] = useState<StudyToolType>("dashboard");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [activeAttachment, setActiveAttachment] = useState<AttachmentFile | null>(null);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const stored = localStorage.getItem("erick_user");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return null;
  });

  // Check system health on mount
  useEffect(() => {
    fetch("/api/health")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.database?.connected) {
          setDbConnected(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleAuthSuccess = (user: UserSession, token?: string) => {
    setCurrentUser(user);
    try {
      localStorage.setItem("erick_user", JSON.stringify(user));
      if (token) {
        localStorage.setItem("erick_token", token);
      }
    } catch {}
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("erick_user");
      localStorage.removeItem("erick_token");
    } catch {}
    setCurrentTab("dashboard");
  };

  // Guard: if user is not authenticated, display login & registration page
  if (!currentUser) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  const handleSelectTool = (tool: StudyToolType, attachment?: AttachmentFile) => {
    if (attachment) {
      setActiveAttachment(attachment);
    }
    setCurrentTab(tool);
  };

  const renderContent = () => {
    switch (currentTab) {
      case "dashboard":
        return (
          <Overview
            onSelectTool={handleSelectTool}
            studentName={currentUser.name.split(" ")[0]}
          />
        );

      case "chat":
        return (
          <ChatView
            initialAttachment={activeAttachment}
            onClearAttachment={() => setActiveAttachment(null)}
          />
        );

      case "summary":
        return (
          <SummaryView
            initialAttachment={activeAttachment}
            onClearAttachment={() => setActiveAttachment(null)}
          />
        );

      case "quiz":
        return <QuizView />;

      case "flashcards":
        return <FlashcardsView />;

      case "study-plan":
        return <StudyPlanView />;

      case "explain":
        return (
          <ExplainView
            initialAttachment={activeAttachment}
            onClearAttachment={() => setActiveAttachment(null)}
          />
        );

      case "history":
        return <HistoryView />;

      case "settings":
        return <StatusSettings />;

      default:
        return (
          <Overview
            onSelectTool={handleSelectTool}
            studentName={currentUser.name.split(" ")[0]}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        userName={currentUser.name}
        userEmail={currentUser.email}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Header
          currentTab={currentTab}
          onOpenMobile={() => setIsMobileOpen(true)}
          dbConnected={dbConnected}
          userName={currentUser.name}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
