"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";

interface NavigationProps {
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

export function Navigation({
  currentPage = "dashboard",
  onPageChange,
}: NavigationProps) {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null;

  const currentLevel = user.progress?.currentLevel || 1;
  const totalXP = user.progress?.totalXP || 0;
  const currentStreak = user.dailyStreak?.currentStreak || 0;

  // Calculate XP progress for current level
  const xpForCurrentLevel = (currentLevel - 1) * 100;
  const xpForNextLevel = currentLevel * 100;
  const xpProgress = totalXP - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;

  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "🏠",
      description: "Overview & Progress",
    },
    {
      id: "daily-challenge",
      label: "Daily Challenge",
      icon: "🎯",
      description: "Today's Tasks",
      badge: currentStreak > 0 ? "Active" : null,
    },
    {
      id: "grammar",
      label: "Grammar",
      icon: "📝",
      description: "German Grammar Practice",
    },
    {
      id: "vocabulary",
      label: "Vocabulary",
      icon: "📚",
      description: "Learn New Words",
    },
    {
      id: "reading",
      label: "Reading",
      icon: "📖",
      description: "Comprehension Practice",
    },
    {
      id: "listening",
      label: "Listening",
      icon: "🎧",
      description: "Audio Exercises",
    },
    {
      id: "writing",
      label: "Writing",
      icon: "✏️",
      description: "Writing Practice",
    },
    {
      id: "advanced",
      label: "Advanced",
      icon: "🎯",
      description: "Advanced Exercises",
    },
    {
      id: "achievements",
      label: "Achievements",
      icon: "🏆",
      description: "Your Badges & Rewards",
    },
    {
      id: "profile",
      label: "Profile",
      icon: "👤",
      description: "Settings & Stats",
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-lg shadow-lg border touch-manipulation"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
      >
        <span className="text-xl">{isMobileMenuOpen ? "✕" : "☰"}</span>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 h-full w-80 bg-white border-r shadow-lg z-40
        transform transition-transform duration-300 ease-in-out
        ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo & User Info */}
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary">Dora</h2>
                <p className="text-sm text-muted-foreground">German Learning</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Level {currentLevel}
                </span>
                <Badge variant="default">{totalXP} XP</Badge>
              </div>

              <Progress
                value={xpProgress}
                max={xpNeeded}
                size="sm"
                className="w-full"
              />

              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>
                  {xpProgress} / {xpNeeded} XP
                </span>
                <span className="flex items-center space-x-1">
                  <span>🔥</span>
                  <span>{currentStreak} days</span>
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange?.(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full text-left p-4 rounded-lg transition-all duration-200 touch-manipulation
                    hover:bg-blue-50 hover:border-blue-200 border border-transparent
                    active:scale-95 active:bg-blue-100
                    ${
                      currentPage === item.id
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "text-gray-700"
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge variant="success" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t">
            <div className="space-y-2">
              <div className="text-xs text-gray-600 text-center">
                Welcome back, {user.profile?.displayName || user.username}!
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => onPageChange?.("settings")}
              >
                ⚙️ Settings
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
