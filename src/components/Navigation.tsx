"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { cn } from "@/lib/utils";
import type { ReactNode, SVGProps } from "react";

interface NavigationProps {
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

// Minimal, inline SVG icon set - consistent strokes, sized via className
function IconBase({
  className,
  children,
  ...props
}: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-5 w-5", className)}
      {...props}
    >
      {children}
    </svg>
  );
}

const IconHome = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="M3 10.5L12 3l9 7.5" />
    <path d="M5.5 9.75V20a1.5 1.5 0 001.5 1.5h10a1.5 1.5 0 001.5-1.5V9.75" />
    <path d="M9 21V14.5a1.5 1.5 0 011.5-1.5H13.5A1.5 1.5 0 0115 14.5V21" />
  </IconBase>
);

const IconTarget = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="7.5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M12 4V2" />
    <path d="M12 22v-2" />
    <path d="M4 12H2" />
    <path d="M22 12h-2" />
  </IconBase>
);

const IconPencil = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="M4 20l4.5-1.2L19 8.3a2.1 2.1 0 00-3-3L5.5 15.8 4 20z" />
    <path d="M14.5 5.5l4 4" />
  </IconBase>
);

const IconBookOpen = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="M12 6v12" />
    <path d="M12 6c-2-1.2-5-.8-8 .5V19c3-1.3 6-1.7 8-.5" />
    <path d="M12 6c2-1.2 5-.8 8 .5V19c-3-1.3-6-1.7-8-.5" />
  </IconBase>
);

const IconHeadphones = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="M4 13a8 8 0 0116 0" />
    <rect x="3" y="13" width="4.5" height="7" rx="2" />
    <rect x="16.5" y="13" width="4.5" height="7" rx="2" />
  </IconBase>
);

const IconBook = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="M6 4h10a2 2 0 012 2v14H8a2 2 0 01-2-2V4z" />
    <path d="M6 4a2 2 0 00-2 2v14a2 2 0 002 2h12" />
  </IconBase>
);

const IconTrophy = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="M7 5h10v2a5 5 0 01-10 0V5z" />
    <path d="M12 12v4" />
    <path d="M9 20h6" />
    <path d="M5 7H4a2 2 0 00-2 2v1a4 4 0 004 4" />
    <path d="M19 7h1a2 2 0 012 2v1a4 4 0 01-4 4" />
  </IconBase>
);

const IconBolt = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="M13 2L6.5 12H12l-1 10L17.5 12H12l1-10z" />
  </IconBase>
);

const IconUser = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <circle cx="12" cy="8" r="3.25" />
    <path d="M5 20a7 7 0 0114 0" />
  </IconBase>
);

const IconBars3 = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="M3 6h18" />
    <path d="M3 12h18" />
    <path d="M3 18h18" />
  </IconBase>
);

const IconXMark = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="M6 6l12 12" />
    <path d="M18 6L6 18" />
  </IconBase>
);

const IconFlame = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="M12 3c1.5 3-1 4.5-1 6 0 1.5 1 2.5 2.5 2.5S17 10.5 17 8c0-2.5-2-4.5-2.5-5" />
    <path d="M7.5 12c-1.5 2-1 6 4.5 6s7-4 4.5-7.5" />
  </IconBase>
);

const IconTargetSmall = IconTarget;
const IconPencilSquare = IconPencil;
const IconBookOpenSmall = IconBookOpen;
const IconReading = IconBookOpen;
const IconVocabulary = IconBook;
const IconWriting = IconPencilSquare;
const IconAdvanced = IconTargetSmall;
const IconAchievements = IconTrophy;
const IconAdmin = IconBolt;
const IconProfile = IconUser;

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
  const xpPercent = Math.min(Math.max((xpProgress / xpNeeded) * 100, 0), 100);

  type NavItem = {
    id: string;
    label: string;
    description: string;
    icon: ReactNode;
    badge?: string | null;
  };

  const navigationItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <IconHome />,
      description: "Overview & Progress",
    },
    {
      id: "daily-challenge",
      label: "Daily Challenge",
      icon: <IconTarget />,
      description: "Today's Tasks",
      badge: currentStreak > 0 ? "Active" : null,
    },
    {
      id: "grammar",
      label: "Grammar",
      icon: <IconPencilSquare />,
      description: "German Grammar Practice",
    },
    {
      id: "vocabulary",
      label: "Vocabulary",
      icon: <IconVocabulary />,
      description: "Learn New Words",
    },
    {
      id: "reading",
      label: "Reading",
      icon: <IconReading />,
      description: "Comprehension Practice",
    },
    {
      id: "listening",
      label: "Listening",
      icon: <IconHeadphones />,
      description: "Audio Exercises",
    },
    {
      id: "writing",
      label: "Writing",
      icon: <IconWriting />,
      description: "Writing Practice",
    },
    {
      id: "advanced",
      label: "Advanced",
      icon: <IconAdvanced />,
      description: "Advanced Exercises",
    },
    {
      id: "achievements",
      label: "Achievements",
      icon: <IconAchievements />,
      description: "Your Badges & Rewards",
    },
    ...(user.isAdmin
      ? [
          {
            id: "admin",
            label: "Admin",
            icon: <IconAdmin />,
            description: "Admin Dashboard",
            badge: "Admin" as string,
          } as NavItem,
        ]
      : []),
    {
      id: "profile",
      label: "Profile",
      icon: <IconProfile />,
      description: "Settings & Stats",
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="secondary"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50 rounded-xl shadow-xl ring-1 ring-border/70 bg-background/80 supports-[backdrop-filter]:bg-background/60 backdrop-blur-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMobileMenuOpen ? (
          <IconXMark className="h-5 w-5" />
        ) : (
          <IconBars3 className="h-5 w-5" />
        )}
      </Button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/25 supports-[backdrop-filter]:bg-black/10 backdrop-blur-sm transition-colors"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-80 ring-1 ring-border shadow-2xl z-50 overflow-hidden",
          "transform transition-transform duration-300 ease-in-out",
          isMobileMenuOpen
            ? "bg-card"
            : "bg-card/70 supports-[backdrop-filter]:bg-card/55 backdrop-blur-xl",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
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
                  {xpProgress} / {xpNeeded} XP ({Math.round(xpPercent)}%)
                </span>
                <span className="flex items-center gap-1">
                  <IconFlame className="h-4 w-4 text-orange-500" />
                  <span>{currentStreak} days</span>
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "group relative w-full justify-start p-0",
                      "rounded-xl ring-1",
                      isActive
                        ? "bg-primary/10 text-primary ring-primary/30"
                        : "ring-transparent hover:bg-accent/60 hover:text-accent-foreground"
                    )}
                    onClick={() => {
                      onPageChange?.(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {/* Active indicator bar */}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute left-0 top-0 h-full w-1 rounded-r-xl transition-opacity",
                        isActive
                          ? "opacity-100 bg-primary"
                          : "opacity-0 group-hover:opacity-60 bg-primary/60"
                      )}
                    />

                    <span className="w-full text-left p-4">
                      <span className="flex items-center gap-3">
                        <span
                          className={cn(
                            "grid place-items-center h-9 w-9 rounded-lg border",
                            isActive
                              ? "bg-primary/15 text-primary border-primary/30"
                              : "bg-secondary text-foreground/80 border-border"
                          )}
                        >
                          {item.icon}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="flex items-center justify-between">
                            <span className="font-medium truncate">
                              {item.label}
                            </span>
                            {item.badge && (
                              <Badge
                                variant={
                                  item.badge === "Admin"
                                    ? "destructive"
                                    : "success"
                                }
                                className="text-xs"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground mt-1 font-medium block truncate">
                            {item.description}
                          </span>
                        </span>
                      </span>
                    </span>
                  </Button>
                );
              })}
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
                className="w-full justify-center gap-2"
                onClick={() => onPageChange?.("settings")}
              >
                {/* Simple settings glyph */}
                <IconBase className="h-4 w-4">
                  <circle cx="12" cy="12" r="2.25" />
                  <path d="M12 4v2" />
                  <path d="M12 18v2" />
                  <path d="M4 12h2" />
                  <path d="M18 12h2" />
                  <path d="M6.5 6.5l1.4 1.4" />
                  <path d="M16.1 16.1l1.4 1.4" />
                  <path d="M6.5 17.5l1.4-1.4" />
                  <path d="M16.1 7.9l1.4-1.4" />
                </IconBase>
                <span>Settings</span>
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
