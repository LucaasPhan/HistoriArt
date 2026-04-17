"use client";

import { MessageCircle, Sparkles } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";

export default function AIFeatureSection() {
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
          Trợ lý AI <span className="gradient-text">Fable Chat</span>
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 15,
            marginTop: 12,
            maxWidth: 550,
            margin: "12px auto 0",
          }}
        >
          Bạn gặp những sự kiện khó hiểu hay muốn tìm hiểu thêm về bài đọc? Fable Chat luôn sẵn sàng giải đáp ngay lập tức, tóm tắt nội dung và mở rộng kiến thức ngay bên cạnh trang sách.
        </p>
      </div>

      <div
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          maxWidth: 600,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "var(--bg-secondary)",
          }}
        >
          <div
            style={{
              background: "var(--accent-gradient)",
              padding: 6,
              borderRadius: "50%",
              display: "flex",
            }}
          >
            <Sparkles size={16} color="white" />
          </div>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Fable Chat</span>
        </div>

        <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* User message */}
          <div style={{ display: "flex", gap: 12, alignSelf: "flex-end", maxWidth: "85%" }}>
            <div
              style={{
                background: "var(--accent-gradient)",
                color: "white",
                padding: "12px 16px",
                borderRadius: "16px 16px 2px 16px",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              Chiến dịch Điện Biên Phủ trên không diễn ra vào thời gian nào và có ý nghĩa gì đối với lịch sử? Bạn có thể giải thích ngắn gọn cho mình không?
            </div>
          </div>

          {/* AI message */}
          <div style={{ display: "flex", gap: 12, alignSelf: "flex-start", maxWidth: "85%" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Sparkles size={16} color="var(--accent-primary)" />
            </div>
            <div
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-subtle)",
                padding: "14px 16px",
                borderRadius: "16px 16px 16px 2px",
                fontSize: 14,
                lineHeight: 1.6,
                color: "var(--text-primary)",
              }}
            >
              <p style={{ margin: 0 }}>
                Chiến dịch "Điện Biên Phủ trên không" diễn ra từ ngày <strong>18/12/1972</strong>{" "}
                đến <strong>29/12/1972</strong>. Đây là chiến dịch phòng không oanh liệt của quân
                dân miền Bắc Việt Nam đánh bại cuộc tập kích chiến lược bằng B-52 của đế quốc Mỹ.
                <br />
                <br />
                <strong>Ý nghĩa:</strong> Chiến thắng này đập tan ý chí xâm lược của Mỹ, buộc Mỹ
                phải ký Hiệp định Paris (1973) chấm dứt chiến tranh ở Việt Nam. Fable Chat có thể
                tóm tắt hoặc cung cấp thêm thông tin chi tiết về các trận đánh tiêu biểu nếu bạn muốn!
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--border-subtle)",
            background: "var(--bg-secondary)",
          }}
        >
          <div
            style={{
              background: "var(--bg-primary)",
              borderRadius: "var(--radius-full)",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-tertiary)",
              fontSize: 14,
            }}
          >
            <MessageCircle size={16} style={{ marginRight: 8 }} />
            Hỏi Fable Chat về đoạn trích lịch sử này...
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
