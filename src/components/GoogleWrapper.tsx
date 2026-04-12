"use client";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function GoogleWrapper({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Si pas de Client ID configuré, on rend les enfants sans le provider
  if (!clientId) return <>{children}</>;

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
