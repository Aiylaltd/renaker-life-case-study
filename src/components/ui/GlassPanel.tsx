"use client";

type GlassPanelVariant = "dark" | "light";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: GlassPanelVariant;
}

export function GlassPanel({
  children,
  className = "",
  variant = "light",
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={`glass-panel ${
        variant === "dark" ? "glass-panel-dark" : "glass-panel-light"
      } ${className}`}
      {...props}
    >
      <div className="glass-panel-shine pointer-events-none z-0" aria-hidden />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
