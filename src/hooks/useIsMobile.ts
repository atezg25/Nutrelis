"use client";
import { useState, useEffect, useLayoutEffect } from "react";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Re-export depuis le contexte centralisé
export { useScreenSize } from "@/context/ScreenSizeContext";
export type { ScreenSize } from "@/context/ScreenSizeContext";

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useIsoLayoutEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useIsoLayoutEffect(() => { setHydrated(true); }, []);
  return hydrated;
}
