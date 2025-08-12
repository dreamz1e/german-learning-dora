"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigation } from "@/components/Navigation";
import { DashboardOverview } from "@/components/pages/DashboardOverview";
import { DailyChallenge } from "@/components/pages/DailyChallenge";
import { GrammarPractice } from "@/components/pages/GrammarPractice";
import { VocabularyBuilder } from "@/components/pages/VocabularyBuilder";
import { ReadingComprehension } from "@/components/pages/ReadingComprehension";
import { ListeningPractice } from "@/components/pages/ListeningPractice";
import { WritingPractice } from "@/components/pages/WritingPractice";
import { AdvancedExercises } from "@/components/pages/AdvancedExercises";
import { Achievements } from "@/components/pages/Achievements";
import AdminDashboard from "@/components/pages/AdminDashboard";
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
        return <DailyChallenge onNavigate={setCurrentPage} />;
      case "grammar":
        return <GrammarPractice onNavigate={setCurrentPage} />;
      case "vocabulary":
        return <VocabularyBuilder onNavigate={setCurrentPage} />;
      case "reading":
        return <ReadingComprehension onNavigate={setCurrentPage} />;
      case "listening":
        return <ListeningPractice onNavigate={setCurrentPage} />;
      case "writing":
        return <WritingPractice onNavigate={setCurrentPage} />;
      case "advanced":
        return <AdvancedExercises onNavigate={setCurrentPage} />;
      case "achievements":
        return <Achievements />;
      case "admin":
        return user.isAdmin ? (
          <AdminDashboard />
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <div className="text-6xl">🚫</div>
              <h2 className="text-2xl font-bold">Access Denied</h2>
              <p className="text-muted-foreground">
                You don't have permission to access this page.
              </p>
            </div>
          </div>
        );
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
      <div className="min-h-screen">
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

        {/* Main Content Area */}
        <main className="lg:ml-80 min-h-screen">
          {/* Top Header */}
          <header className="sticky top-0 z-30">
            <div className="bg-card/75 supports-[backdrop-filter]:bg-card/60 backdrop-blur-xl border-b ring-1 ring-border">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="lg:hidden pl-14">
                    <h1 className="text-xl font-bold text-primary">Dora</h1>
                  </div>

                  <div className="flex items-center space-x-4 ml-auto">
                    <div className="hidden sm:block text-sm text-gray-700 font-medium">
                      Welcome back, {user.profile?.displayName || user.username}
                      !
                    </div>
                    <button
                      onClick={logout}
                      className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-secondary hover:bg-secondary/80 border border-input"
                    >
                      Sign Out
                    </button>
                  </div>
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
