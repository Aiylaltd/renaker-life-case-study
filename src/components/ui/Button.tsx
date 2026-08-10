import Link from "next/link";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  theme?: "dark" | "light";
  className?: string;
  external?: boolean;
  onClick?: () => void;
}

export function Button({
  href,
  children,
  variant = "primary",
  theme = "light",
  className = "",
  external = false,
  onClick,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-medium tracking-wide transition-all duration-300 focus-ring-light";

  const variants = {
    primary:
      theme === "dark"
        ? "bg-stone text-ink hover:bg-stone-dark"
        : "bg-ink text-stone hover:bg-charcoal",
    secondary:
      theme === "dark"
        ? "border border-white/20 text-stone hover:border-white/40 hover:bg-white/5"
        : "border border-ink/15 text-ink hover:border-ink/30 hover:bg-ink/5",
    ghost:
      theme === "dark"
        ? "text-muted-light hover:text-stone underline-offset-4 hover:underline px-0 py-0"
        : "text-muted-dark hover:text-ink underline-offset-4 hover:underline px-0 py-0",
  };

  const classes = `${base} ${variants[variant]} ${className}`;
  const isExternal =
    external ||
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:");

  if (isExternal) {
    return (
      <a
        href={href}
        className={classes}
        {...(href.startsWith("http")
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} onClick={onClick}>
      {children}
    </Link>
  );
}
