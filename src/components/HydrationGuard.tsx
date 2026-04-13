"use client";
import { useHydrated } from "@/hooks/useIsMobile";

export default function HydrationGuard({
  children,
  bg = "transparent",
  style,
}: {
  children: React.ReactNode;
  bg?: string;
  style?: React.CSSProperties;
}) {
  const hydrated = useHydrated();

  return (
    <div style={{
      ...style,
      background: bg,
      visibility: hydrated ? "visible" : "hidden",
    }}>
      {children}
    </div>
  );
}
