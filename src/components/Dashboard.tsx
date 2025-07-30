"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigation } from "@/components/Navigation";
import { DashboardOverview } from "@/components/pages/DashboardOverview";
import { DailyChallenge } from "@/components/pages/DailyChallenge";
import { GrammarPractice } from "@/components/pages/GrammarPractice";
import { VocabularyBuilder } from "@/components/pages/VocabularyBuilder";
import { ReadingComprehension } from "@/components/pages/ReadingComprehension";
import { ToastProvider } from "@/components/ui/Toast";

export function Dashboard() {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");

  if (!user) return null;

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardOverview onNavigate={setCurrentPage} />;
      case "daily-challenge":
        return <DailyChallenge />;
      case "grammar":
        return <GrammarPractice />;
      case "vocabulary":
        return <VocabularyBuilder />;
      case "reading":
        return <ReadingComprehension />;
      default:
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <div className="text-6xl">🚧</div>
              <h2 className="text-2xl font-bold">Coming Soon!</h2>
              <p className="text-muted-foreground">
                This feature is being developed. Stay tuned!
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

        {/* Main Content Area */}
        <main className="lg:ml-80 min-h-screen">
          {/* Top Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-30">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="lg:hidden">
                  <h1 className="text-xl font-bold text-primary">Dora</h1>
                </div>

                <div className="flex items-center space-x-4 ml-auto">
                  <div className="hidden sm:block text-sm text-muted-foreground">
                    Welcome back, {user.profile?.displayName || user.username}!
                  </div>
                  <button
                    onClick={logout}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-6">{renderPage()}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
