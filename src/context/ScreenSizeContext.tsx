"use client";
import { createContext, useContext, useState, useLayoutEffect, useEffect } from "react";

export type ScreenSize = "mobile" | "tablet" | "desktop";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function detectSize(): ScreenSize {
  const w = window.innerWidth;
  if (w < 480) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

const ScreenSizeContext = createContext<ScreenSize>("desktop");

export function ScreenSizeProvider({ children }: { children: React.ReactNode }) {
  const [size, setSize] = useState<ScreenSize>("desktop");

  useIsoLayoutEffect(() => {
    setSize(detectSize());
    const onResize = () => setSize(detectSize());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <ScreenSizeContext value={size}>
      {children}
    </ScreenSizeContext>
  );
}

export function useScreenSize(): ScreenSize {
  return useContext(ScreenSizeContext);
}
