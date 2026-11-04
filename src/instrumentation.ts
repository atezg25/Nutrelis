export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { demarrerRappelsLivraison } = await import("./lib/rappels");
  demarrerRappelsLivraison();
}
