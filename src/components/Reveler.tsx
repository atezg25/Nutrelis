"use client";
import { useEffect } from "react";

/**
 * Le site masque toute page (`html:not(.hydrated) body { visibility: hidden }`) tant qu'un composant ne la « révèle » pas
 * (voir HydrationGuard, qui évite un flash de mise en page). Les pages sans HydrationGuard — administration, boutique —
 * restaient donc INVISIBLES pour un vrai navigateur, alors que le serveur répondait 200. Ce composant les révèle.
 */
export default function Reveler() {
  useEffect(() => {
    document.documentElement.classList.add("hydrated");
  }, []);
  return null;
}
