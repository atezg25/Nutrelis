export default function Home() {
  return (
    <main style={{
      background: "var(--bg-primary)",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{
          color: "var(--accent)",
          fontSize: "3rem",
          fontWeight: 900,
          letterSpacing: "0.3rem",
          marginBottom: "1rem",
          fontFamily: "var(--font-playfair)",
        }}>
          NUTRELIS
        </h1>
        <p style={{
          color: "var(--text-secondary)",
          fontSize: "1.1rem",
        }}>
          Compléments alimentaires premium 🌿
        </p>
      </div>
    </main>
  );
}