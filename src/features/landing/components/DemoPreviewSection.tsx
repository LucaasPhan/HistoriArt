"use client";

import { Film, Play, Volume2 } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import styles from "./DemoPreviewSection.module.css";

export default function DemoPreviewSection() {
  return (
    <AnimatedSection
      style={{
        position: "relative",
        zIndex: 1,
        padding: "60px 24px 100px",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700 }}>
          Tư liệu <span className="gradient-text">ngay trong trang sách</span>
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 15,
            marginTop: 12,
          }}
        >
          Khi đọc đến đoạn có sự kiện lịch sử, tư liệu sẽ tự động hiện ra bên phải.
        </p>
      </div>

      {/* Mock reader + sidebar */}
      <div className={styles.demoGrid}>
        {/* Mock reader content */}
        <div className={styles.readerContent}>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.9,
              color: "var(--text-secondary)",
              fontFamily: "var(--font-source-sans)",
            }}
          >
            ...Đợt tấn công thứ nhất nhằm vào cụm cứ điểm phía bắc.{" "}
            <span
              className="passage-trigger"
              style={{
                borderBottom: "1px dashed var(--accent-primary)",
                background: "var(--accent-glow)",
                padding: "1px 3px",
                borderRadius: 3,
              }}
            >
              Bài Quốc tế ca trầm hùng vang lên
            </span>{" "}
            giữa lòng chảo khi cờ Việt Minh tung bay trên cứ điểm vừa chiếm được.
            <br />
            <br />
            Trong một lần kéo pháo qua dốc,{" "}
            <span
              className="passage-trigger"
              style={{
                borderBottom: "1px dashed var(--accent-primary)",
                background: "var(--accent-glow)",
                padding: "1px 3px",
                borderRadius: 3,
              }}
            >
              Tô Vĩnh Diện không ngần ngại, ôm chèn lao vào bánh xe
            </span>{" "}
            pháo để cứu khẩu pháo...
          </p>
        </div>

        {/* Mock MediaPanel */}
        <div
          style={{
            background: "var(--bg-secondary)",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 4px",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <Film size={14} color="var(--accent-primary)" />
            Tư liệu liên quan
          </div>

          {/* Mock audio card */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: 14,
                background: "var(--bg-tertiary)",
              }}
            >
              <Play size={16} color="var(--accent-primary)" />
              <div
                style={{
                  flex: 1,
                  height: 4,
                  background: "var(--border-subtle)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "40%",
                    height: "100%",
                    background: "var(--accent-primary)",
                    borderRadius: 4,
                  }}
                />
              </div>
              <Volume2 size={16} />
            </div>
            <p
              style={{
                padding: "10px 14px",
                fontSize: 11,
                color: "var(--text-secondary)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              🎵 Bài Quốc tế ca — vang lên giữa lòng chảo Điện Biên Phủ
            </p>
          </div>

          {/* Mock annotation card */}
          <div
            style={{
              background: "var(--accent-glow)",
              borderLeft: "3px solid var(--accent-primary)",
              borderRadius: "var(--radius-md)",
              padding: 14,
            }}
          >
            <p
              style={{
                fontSize: 12,
                lineHeight: 1.6,
                color: "var(--text-secondary)",
                margin: 0,
              }}
            >
              Anh hùng Tô Vĩnh Diện (1928–1953) — hy sinh thân mình chèn pháo trên dốc cao.
            </p>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
