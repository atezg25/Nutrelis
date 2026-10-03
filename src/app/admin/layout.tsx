import type { Metadata } from "next";
import Reveler from "@/components/Reveler";

// L'administration ne doit JAMAIS être indexée.
export const metadata: Metadata = {
  title: "NUTRELIS — Administration",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#f6f7f5", minHeight: "100vh", color: "#1a1a1a", fontFamily: "system-ui, sans-serif" }}>
      <Reveler />
      {children}
    </div>
  );
}
