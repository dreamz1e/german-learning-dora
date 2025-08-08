"use client";

export function AppBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      {/* Base soft gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-rose-100" />

      {/* Ambient blobs */}
      <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-rose-400/20 blur-3xl" />

      {/* Subtle grid overlay with radial mask */}
      <div
        className="absolute inset-0 opacity-[0.06] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          backgroundPosition: "center center",
        }}
      />
    </div>
  );
}
