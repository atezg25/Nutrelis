"use client";
import { useState, useEffect, useLayoutEffect } from "react";
import { flushSync } from "react-dom";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

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

export type ScreenSize = "mobile" | "tablet" | "desktop";

function detectSize(): ScreenSize {
  const w = window.innerWidth;
  if (w < 480) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

// "mobile" < 480px | "tablet" 480-1024px | "desktop" > 1024px
// Uses useLayoutEffect to set the correct size BEFORE browser paint
export function useScreenSize(): ScreenSize {
  const [size, setSize] = useState<ScreenSize>("desktop");

  useIsoLayoutEffect(() => {
    // Prevent browser from restoring stale scroll position
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    // flushSync force React à re-render avec la bonne taille AVANT de révéler
    flushSync(() => { setSize(detectSize()); });
    document.documentElement.classList.add("hydrated");

    const onResize = () => setSize(detectSize());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return size;
}

export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useIsoLayoutEffect(() => { setHydrated(true); }, []);
  return hydrated;
}
