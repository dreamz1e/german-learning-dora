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
    ...(user.isAdmin
      ? [
          {
            id: "admin",
            label: "Admin",
            icon: "⚡",
            description: "Admin Dashboard",
            badge: "Admin" as string,
          },
        ]
      : []),
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
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-background/80 supports-[backdrop-filter]:bg-background/60 backdrop-blur-md ring-1 ring-border shadow-xl touch-manipulation"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
      >
        <span className="text-xl">{isMobileMenuOpen ? "✕" : "☰"}</span>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/25 supports-[backdrop-filter]:bg-black/10 backdrop-blur-sm transition-colors"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 h-full w-80 ring-1 ring-border shadow-2xl z-50 overflow-hidden
        transform transition-transform duration-300 ease-in-out
        ${
          isMobileMenuOpen
            ? "bg-card"
            : "bg-card/70 supports-[backdrop-filter]:bg-card/55 backdrop-blur-xl"
        }
        ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }
      `}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-rose-400 to-primary" />
        <div className="flex flex-col h-full">
          {/* Logo & User Info */}
          <div className="p-6 border-b bg-gradient-to-br from-pink-50/60 to-rose-50/30">
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

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {xpProgress} / {xpNeeded} XP
                </span>
                <span className="flex items-center gap-1">
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
                    w-full text-left p-4 rounded-xl transition-all duration-200 touch-manipulation ring-1
                    hover:bg-primary/10 hover:ring-primary/30 active:scale-95
                    ${
                      currentPage === item.id
                        ? "bg-primary/15 text-primary ring-primary/40"
                        : "bg-transparent text-foreground/80 ring-transparent"
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge
                            variant={
                              item.badge === "Admin" ? "destructive" : "success"
                            }
                            className="text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">
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
              <div className="text-xs text-foreground/80 text-center font-medium">
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
