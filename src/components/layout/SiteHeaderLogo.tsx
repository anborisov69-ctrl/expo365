"use client";

import Image from "next/image";
import Link from "next/link";

const variantClasses = {
  header: "h-9 w-auto sm:h-10",
  sidebar: "h-8 w-auto max-w-[148px] object-left",
  auth: "h-14 w-auto sm:h-16",
  compact: "h-7 w-auto sm:h-8"
} as const;

export type SiteHeaderLogoVariant = keyof typeof variantClasses;

interface SiteHeaderLogoProps {
  href?: string;
  variant?: SiteHeaderLogoVariant;
  className?: string;
}

/**
 * Логотип платформы EXPO 365 для шапок и боковой панели (`/public/expo-365-logo.png`).
 */
export function SiteHeaderLogo({
  href = "/",
  variant = "header",
  className = ""
}: SiteHeaderLogoProps) {
  return (
    <Link
      href={href}
      className={`inline-flex shrink-0 items-center outline-none ring-expoBlue/30 focus-visible:ring-2 focus-visible:ring-offset-2 ${className}`}
    >
      <Image
        src="/expo-365-logo.png"
        alt="EXPO 365 — B2B platform"
        width={220}
        height={72}
        className={`${variantClasses[variant]} object-contain object-left`}
        priority
      />
    </Link>
  );
}
