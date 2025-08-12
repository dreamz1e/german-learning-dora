import { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { CheckCircle2, Lightbulb } from "lucide-react";

export type TipsPanelTone = "pink" | "purple" | "indigo" | "emerald";

const toneMap: Record<
  TipsPanelTone,
  {
    gradient: string;
    border: string;
    titleText: string;
    ring: string;
    iconText: string;
  }
> = {
  pink: {
    gradient: "from-pink-50 to-rose-50",
    border: "border-pink-200",
    titleText: "text-pink-700",
    ring: "ring-pink-200",
    iconText: "text-pink-600",
  },
  purple: {
    gradient: "from-purple-50 to-pink-50",
    border: "border-purple-200",
    titleText: "text-purple-700",
    ring: "ring-purple-200",
    iconText: "text-purple-600",
  },
  indigo: {
    gradient: "from-indigo-50 to-purple-50",
    border: "border-indigo-200",
    titleText: "text-indigo-700",
    ring: "ring-indigo-200",
    iconText: "text-indigo-600",
  },
  emerald: {
    gradient: "from-green-50 to-emerald-50",
    border: "border-green-200",
    titleText: "text-emerald-700",
    ring: "ring-green-200",
    iconText: "text-emerald-600",
  },
};

export interface TipsPanelSection {
  heading?: string;
  items: Array<ReactNode>;
}

interface TipsPanelProps {
  title: string;
  tone?: TipsPanelTone;
  sections: TipsPanelSection[];
  className?: string;
  headerIcon?: ReactNode;
}

export function TipsPanel({
  title,
  tone = "pink",
  sections,
  className,
  headerIcon,
}: TipsPanelProps) {
  const t = toneMap[tone];
  const columnCount = Math.min(2, sections.length || 1);

  return (
    <Card className={cn("bg-gradient-to-r", t.gradient, t.border, className)}>
      <CardHeader>
        <CardTitle className={cn("flex items-center gap-3", t.titleText)}>
          <span
            className={cn(
              "h-9 w-9 rounded-lg grid place-items-center bg-white/70",
              "shadow-sm",
              "ring-1",
              t.ring
            )}
          >
            {headerIcon ? (
              headerIcon
            ) : (
              <Lightbulb className={cn("h-5 w-5", t.iconText)} />
            )}
          </span>
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "grid gap-6 text-sm",
            columnCount === 2 ? "md:grid-cols-2" : "grid-cols-1"
          )}
        >
          {sections.map((section, sectionIndex) => (
            <div className="space-y-3" key={sectionIndex}>
              {section.heading && (
                <h4 className={cn("font-semibold")}>{section.heading}</h4>
              )}
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li className="flex items-start gap-3" key={itemIndex}>
                    <span
                      className={cn(
                        "mt-0.5 h-6 w-6 rounded-full grid place-items-center bg-white/70",
                        "shadow-sm",
                        "ring-1",
                        t.ring
                      )}
                    >
                      <CheckCircle2 className={cn("h-4 w-4", t.iconText)} />
                    </span>
                    <span className="text-foreground/80 leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
