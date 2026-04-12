"use client";
import { GoogleOAuthProvider } from "@react-oauth/google";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "141147213471-sr4hs2m7467k3hfh2nhfr218760ck819.apps.googleusercontent.com";

export default function GoogleWrapper({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}
