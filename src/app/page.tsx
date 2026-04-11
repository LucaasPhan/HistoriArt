"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BookOpen, Play, HelpCircle, ArrowRight, Sparkles, Film, ChevronDown } from "lucide-react";
import { TransitionLink } from "@/components/TransitionLink";
import PageMountSignaler from "@/components/PageMountSignaler";
import { SAMPLE_BOOKS } from "@/lib/sample-books";

/* ─── Animation Helpers ──────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

function AnimatedSection({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.section>
  );
}

/* ─── Feature Card Data ──────────────────────────── */
const FEATURES = [
  {
    icon: BookOpen,
    title: "Sách lịch sử sống động",
    desc: "Đọc những tác phẩm kinh điển về lịch sử Việt Nam, từ thời Hùng Vương đến ngày thống nhất.",
    gradient: ["#8B0000", "#D4A574"],
  },
  {
    icon: Film,
    title: "Tư liệu đa phương tiện",
    desc: "Hình ảnh, video, và âm thanh lịch sử hiện ngay khi bạn đọc đến đoạn văn liên quan.",
    gradient: ["#1B4332", "#52B788"],
  },
  {
    icon: HelpCircle,
    title: "Ôn tập qua quiz",
    desc: "Kiểm tra kiến thức lịch sử sau mỗi chương với câu hỏi trắc nghiệm thú vị.",
    gradient: ["#2C1810", "#C4956A"],
  },
];

/* ─── Landing Page ───────────────────────────────── */
export default function LandingPage() {
  return (
    <>
      <div style={{ minHeight: "100vh", overflow: "hidden" }}>
        {/* ═══ BG Orbs ═════════════════════════════ */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
            style={{
              position: "absolute",
              width: 500,
              height: 500,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(139,0,0,0.08) 0%, transparent 70%)",
              top: "10%",
              left: "-5%",
              filter: "blur(60px)",
            }}
          />
          <motion.div
            animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
            transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
            style={{
              position: "absolute",
              width: 450,
              height: 450,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(27,67,50,0.08) 0%, transparent 70%)",
              bottom: "20%",
              right: "-3%",
              filter: "blur(60px)",
            }}
          />
        </div>

        {/* ═══ Hero ════════════════════════════════ */}
        <section style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          padding: "120px 24px 80px",
          gap: 32,
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: "var(--radius-full)",
              background: "var(--accent-glow)",
              border: "1px solid rgba(212, 110, 86, 0.15)",
              fontSize: 13,
              color: "var(--accent-primary)",
              fontWeight: 600,
            }}
          >
            <Sparkles size={14} />
            Nền tảng ebook lịch sử với đa phương tiện
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            style={{
              fontSize: "clamp(36px, 6vw, 72px)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              maxWidth: 800,
              color: "var(--text-primary)",
            }}
          >
            Lịch sử Việt Nam
            <br />
            <span className="gradient-text" style={{ fontSize: "inherit", fontWeight: "inherit" }}>
              qua trang sách sống động
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            style={{
              fontSize: "clamp(16px, 2vw, 20px)",
              lineHeight: 1.7,
              color: "var(--text-secondary)",
              maxWidth: 560,
            }}
          >
            Từ Bạch Đằng đến Điện Biên Phủ — đọc lịch sử với hình ảnh, phim tư liệu
            và âm nhạc chèn thẳng vào từng trang sách.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}
          >
            <TransitionLink href="/library">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary"
                style={{
                  padding: "14px 32px",
                  fontSize: 16,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  borderRadius: "var(--radius-full)",
                }}
              >
                <BookOpen size={18} />
                Bắt đầu đọc
                <ArrowRight size={16} />
              </motion.button>
            </TransitionLink>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-ghost"
              style={{
                padding: "14px 28px",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderRadius: "var(--radius-full)",
              }}
            >
              Tìm hiểu thêm
              <ChevronDown size={16} />
            </motion.button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ position: "absolute", bottom: 32 }}
          >
            <ChevronDown size={24} color="var(--text-tertiary)" />
          </motion.div>
        </section>

        {/* ═══ Features ═══════════════════════════ */}
        <AnimatedSection
          style={{
            position: "relative",
            zIndex: 1,
            padding: "80px 24px",
            maxWidth: 1100,
            margin: "0 auto",
          }}
        >
          <div id="features" style={{ scrollMarginTop: 80 }} />
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Đọc — Xem — Nghe — <span className="gradient-text">Ôn tập</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 16, marginTop: 12, maxWidth: 500, margin: "12px auto 0" }}>
              Trải nghiệm học lịch sử hoàn toàn mới với công nghệ ebook đa phương tiện.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                whileHover={{ y: -4, boxShadow: "var(--shadow-glow)" }}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-lg)",
                  padding: 32,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  transition: "box-shadow 0.3s, transform 0.3s",
                  cursor: "default",
                }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--radius-md)",
                  background: `linear-gradient(135deg, ${f.gradient[0]}, ${f.gradient[1]})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <f.icon size={22} color="white" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600 }}>{f.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-secondary)" }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {/* ═══ Books Preview ══════════════════════ */}
        <AnimatedSection style={{
          position: "relative",
          zIndex: 1,
          padding: "40px 24px 100px",
          maxWidth: 1100,
          margin: "0 auto",
        }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Thư viện <span className="gradient-text">lịch sử</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 16, marginTop: 12, maxWidth: 500, margin: "12px auto 0" }}>
              Khám phá những tác phẩm kinh điển về lịch sử Việt Nam từ thời dựng nước đến thống nhất.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
          }}>
            {SAMPLE_BOOKS.map((book, i) => (
              <motion.div
                key={book.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
              >
                <TransitionLink href={`/read/${book.id}`}>
                  <motion.div
                    whileHover={{ y: -6, scale: 1.01 }}
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-lg)",
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "box-shadow 0.3s",
                    }}
                  >
                    {/* Cover gradient strip */}
                    <div style={{
                      height: 120,
                      background: `linear-gradient(135deg, ${book.coverGradient[0]}, ${book.coverGradient[1]})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}>
                      <BookOpen size={36} color="rgba(255,255,255,0.5)" />
                      <div style={{
                        position: "absolute",
                        bottom: 8,
                        right: 12,
                        padding: "3px 10px",
                        borderRadius: "var(--radius-full)",
                        background: "rgba(0,0,0,0.4)",
                        backdropFilter: "blur(8px)",
                        color: "white",
                        fontSize: 11,
                        fontWeight: 500,
                      }}>
                        {book.era}
                      </div>
                    </div>

                    <div style={{ padding: "20px 24px" }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>
                        {book.title}
                      </h3>
                      <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 12 }}>
                        {book.author}
                      </p>
                      <p style={{
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: "var(--text-secondary)",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {book.description}
                      </p>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: 16,
                      }}>
                        <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                          {book.totalPages} trang
                        </span>
                        <span style={{
                          fontSize: 12,
                          color: "var(--accent-primary)",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}>
                          Đọc ngay <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </TransitionLink>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {/* ═══ Demo Preview ═══════════════════════ */}
        <AnimatedSection style={{
          position: "relative",
          zIndex: 1,
          padding: "60px 24px 100px",
          maxWidth: 900,
          margin: "0 auto",
        }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700 }}>
              Tư liệu <span className="gradient-text">ngay trong trang sách</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 15, marginTop: 12 }}>
              Khi đọc đến đoạn có sự kiện lịch sử, tư liệu sẽ tự động hiện ra bên phải.
            </p>
          </div>

          {/* Mock reader + sidebar */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: 0,
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            minHeight: 350,
          }}>
            {/* Mock reader content */}
            <div style={{ padding: "32px 36px", borderRight: "1px solid var(--border-subtle)" }}>
              <p style={{ fontSize: 14, lineHeight: 1.9, color: "var(--text-secondary)", fontFamily: "var(--font-serif)" }}>
                ...Đợt tấn công thứ nhất nhằm vào cụm cứ điểm phía bắc.{" "}
                <span className="passage-trigger" style={{ borderBottom: "1px dashed var(--accent-primary)", background: "var(--accent-glow)", padding: "1px 3px", borderRadius: 3 }}>
                  Bài Quốc tế ca trầm hùng vang lên
                </span>{" "}
                giữa lòng chảo khi cờ Việt Minh tung bay trên cứ điểm vừa chiếm được.
                <br /><br />
                Trong một lần kéo pháo qua dốc,{" "}
                <span className="passage-trigger" style={{ borderBottom: "1px dashed var(--accent-primary)", background: "var(--accent-glow)", padding: "1px 3px", borderRadius: 3 }}>
                  Tô Vĩnh Diện không ngần ngại, ôm chèn lao vào bánh xe
                </span>{" "}
                pháo để cứu khẩu pháo...
              </p>
            </div>

            {/* Mock MediaPanel */}
            <div style={{ background: "var(--bg-secondary)", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 4px", fontSize: 13, fontWeight: 600 }}>
                <Play size={14} color="var(--accent-primary)" />
                Tư liệu liên quan
              </div>

              {/* Mock audio card */}
              <div style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: 14,
                  background: "var(--bg-tertiary)",
                }}>
                  <Play size={16} color="var(--accent-primary)" />
                  <div style={{ flex: 1, height: 4, background: "var(--border-subtle)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: "40%", height: "100%", background: "var(--accent-gradient)", borderRadius: 4 }} />
                  </div>
                </div>
                <p style={{ padding: "10px 14px", fontSize: 11, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                  🎵 Bài Quốc tế ca — vang lên giữa lòng chảo Điện Biên Phủ
                </p>
              </div>

              {/* Mock annotation card */}
              <div style={{
                background: "var(--accent-glow)",
                borderLeft: "3px solid var(--accent-primary)",
                borderRadius: "var(--radius-md)",
                padding: 14,
              }}>
                <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--text-secondary)", margin: 0 }}>
                  Anh hùng Tô Vĩnh Diện (1928–1953) — hy sinh thân mình chèn pháo trên dốc cao.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* ═══ Footer ═════════════════════════════ */}
        <footer style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          padding: "40px 24px 60px",
          borderTop: "1px solid var(--border-subtle)",
          color: "var(--text-tertiary)",
          fontSize: 13,
        }}>
          <p>Historiart © {new Date().getFullYear()} — Nền tảng ebook lịch sử Việt Nam</p>
        </footer>
      </div>
      <PageMountSignaler />
    </>
  );
}
