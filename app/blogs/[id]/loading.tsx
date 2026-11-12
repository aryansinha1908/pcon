export default function BlogDetailLoading() {
  return (
    <div style={{ maxWidth: "1004px", margin: "0 auto", padding: "40px 0", opacity: 0.5 }}>
      <div style={{ height: "20px", width: "100px", background: "var(--line)", borderRadius: "4px", marginBottom: "30px" }} />
      <div style={{ height: "48px", width: "70%", background: "var(--line)", borderRadius: "6px", marginBottom: "16px" }} />
      <div style={{ height: "24px", width: "50%", background: "var(--line)", borderRadius: "4px", marginBottom: "40px" }} />
      <div style={{ aspectRatio: "21/9", width: "100%", background: "var(--line)", borderRadius: "22px", marginBottom: "48px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "64px" }}>
        <div style={{ height: "240px", background: "var(--line)", borderRadius: "18px" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ height: "20px", width: "100%", background: "var(--line)", borderRadius: "4px" }} />
          <div style={{ height: "20px", width: "95%", background: "var(--line)", borderRadius: "4px" }} />
          <div style={{ height: "20px", width: "80%", background: "var(--line)", borderRadius: "4px" }} />
        </div>
      </div>
    </div>
  );
}

