"use client";
import { useState, useEffect } from "react";

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

export type ScreenSize = "mobile" | "tablet" | "desktop";

// "mobile" < 480px | "tablet" 480-1024px | "desktop" > 1024px
export function useScreenSize(): ScreenSize {
  const [size, setSize] = useState<ScreenSize>("desktop");
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w < 480) setSize("mobile");
      else if (w < 1024) setSize("tablet");
      else setSize("desktop");
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return size;
}

/**
 * Hook that returns true once the component has hydrated on the client.
 * Use this to prevent layout shift: wrap your page content in a div
 * with opacity 0 until hydrated.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  return hydrated;
}
