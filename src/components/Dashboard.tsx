"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigation } from "@/components/Navigation";
import { DashboardOverview } from "@/components/pages/DashboardOverview";
import { DailyChallenge } from "@/components/pages/DailyChallenge";
import { GrammarPractice } from "@/components/pages/GrammarPractice";
import { VocabularyBuilder } from "@/components/pages/VocabularyBuilder";
import { ReadingComprehension } from "@/components/pages/ReadingComprehension";
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

        {/* Main Content Area */}
        <main className="lg:ml-80 min-h-screen">
          {/* Top Header */}
          <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-30 shadow-sm">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="lg:hidden">
                  <h1 className="text-xl font-bold text-primary">Dora</h1>
                </div>

                <div className="flex items-center space-x-4 ml-auto">
                  <div className="hidden sm:block text-sm text-gray-700 font-medium">
                    Welcome back, {user.profile?.displayName || user.username}!
                  </div>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-all duration-200 border border-gray-300"
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
