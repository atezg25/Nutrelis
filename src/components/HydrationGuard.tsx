"use client";
import { useEffect } from "react";
import { useHydrated } from "@/hooks/useIsMobile";

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
