"use client";
import { useEffect, useLayoutEffect } from "react";
import { useHydrated } from "@/hooks/useIsMobile";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

let revealed = false;

export default function HydrationGuard({
  children,
  bg,
  style,
}: {
  children: React.ReactNode;
  bg?: string;
  style?: React.CSSProperties;
}) {
  const hydrated = useHydrated();

  useIsoLayoutEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (hydrated && !revealed) {
      revealed = true;
      document.documentElement.classList.add("hydrated");
    }
  }, [hydrated]);

  return (
    <div style={{ ...style, background: bg }}>
      {children}
    </div>
  );
}
