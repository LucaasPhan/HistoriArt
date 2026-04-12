"use client";

export default function Footer() {
  return (
    <footer
      style={{
        position: "relative",
        zIndex: 1,
        textAlign: "center",
        padding: "40px 24px 60px",
        borderTop: "1px solid var(--border-subtle)",
        color: "var(--text-tertiary)",
        fontSize: 13,
      }}
    >
      <p>HistoriArt © {new Date().getFullYear()} — Nền tảng eBook lịch sử Việt Nam</p>
    </footer>
  );
}
