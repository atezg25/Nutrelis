"use client";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function BoutonGoogle({ onSuccess }: { onSuccess?: () => void }) {
  const { connexionGoogle } = useAuth();
  const [erreur, setErreur] = useState("");

  return (
    <div>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          setErreur("");
          try {
            if (credentialResponse.credential) {
              await connexionGoogle(credentialResponse.credential);
              onSuccess?.();
            }
          } catch (e: any) {
            setErreur(e.message || "Erreur connexion Google");
          }
        }}
        onError={() => setErreur("Erreur connexion Google")}
        text="continue_with"
        shape="rectangular"
        width="100%"
        locale="fr"
      />
      {erreur && (
        <p style={{ color: "#e53e3e", fontSize: 13, marginTop: 8, textAlign: "center" }}>{erreur}</p>
      )}
    </div>
  );
}
