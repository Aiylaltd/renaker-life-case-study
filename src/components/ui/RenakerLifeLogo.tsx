import Image from "next/image";

const logos = {
  light: {
    src: "/images/brand/renaker-life-logo-Light.png",
    width: 5573,
    height: 378,
  },
} as const;

type LogoVariant = keyof typeof logos;

export function RenakerLifeLogo({
  variant = "light",
  className = "",
  priority = false,
}: {
  variant?: LogoVariant;
  className?: string;
  priority?: boolean;
}) {
  const logo = logos[variant];

  return (
    <Image
      src={logo.src}
      alt="Renaker Life"
      width={logo.width}
      height={logo.height}
      priority={priority}
      className={`h-auto w-full ${className}`}
    />
  );
}
