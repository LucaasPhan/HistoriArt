"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AnimatedSection, fadeUp } from "./AnimatedSection";
import { Github, Linkedin, Twitter, ChevronLeft, ChevronRight } from "lucide-react";

const TEAM = [
  {
    name: "Huỳnh Trúc Phương",
    role: "Project Manager",
    desc: "Định hướng phát triển nội dung và quản lý dự án.",
    gradient: ["#8B0000", "#D4A574"],
    image: "https://cafefcdn.com/thumb_w/640/203337114487263232/2024/12/26/avatar1735176031764-17351760331641924544187.jpg",
  },
  {
    name: "Nguyễn văn A",
    role: "Lead Marketing",
    desc: "",
    gradient: ["#1B4332", "#52B788"],
    image: "https://cafefcdn.com/thumb_w/640/203337114487263232/2024/12/26/avatar1735176031764-17351760331641924544187.jpg",
  },
  {
    name: "Nguyễn Văn B",
    role: "Content Creator",
    desc: "",
    gradient: ["#2C1810", "#C4956A"],
    image: "https://cafefcdn.com/thumb_w/640/203337114487263232/2024/12/26/avatar1735176031764-17351760331641924544187.jpg",
  },
  {
    name: "Phan Nhất Huy",
    role: "Lead Engineer",
    desc: "Xây dựng kiến trúc nền tảng và tối ưu hóa trải nghiệm đọc đa phương tiện.",
    gradient: ["#1E3A8A", "#60A5FA"],
    image: "https://cafefcdn.com/thumb_w/640/203337114487263232/2024/12/26/avatar1735176031764-17351760331641924544187.jpg",
  },
];

export default function MeetTheTeamSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const scrollLeft = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.children[0].clientWidth + 24; // width + gap
      scrollRef.current.scrollBy({ left: -cardWidth, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const { scrollLeft: currentLeft, scrollWidth, clientWidth } = scrollRef.current;
      const cardWidth = scrollRef.current.children[0].clientWidth + 24;
      
      // If we've reached the end (with a 10px margin for precision), loop back to the start
      if (currentLeft + clientWidth >= scrollWidth - 10) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    if (isPaused) return;

    const intervalId = setInterval(() => {
      scrollRight();
    }, 3500);

    return () => clearInterval(intervalId);
  }, [isPaused]);

  return (
    <AnimatedSection
      style={{
        position: "relative",
        zIndex: 1,
        padding: "80px 24px",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      <div id="team" style={{ scrollMarginTop: 80 }} />
      
      {/* Title area with navigation buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56, flexWrap: "wrap", gap: 24 }}>
        <div style={{ textAlign: "left", flex: "1 1 300px" }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
            Đội ngũ <span className="gradient-text">HistoriArt</span>
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 16,
              marginTop: 12,
              maxWidth: 500,
              margin: "12px 0 0 0",
            }}
          >
            Những người đằng sau sứ mệnh mang lịch sử Việt Nam đến gần hơn với thế hệ trẻ.
          </p>
        </div>

        {/* Carousel controls */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={scrollLeft}
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              color: "var(--text-primary)",
              boxShadow: "var(--shadow-sm)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "var(--text-primary)";
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.color = "var(--text-primary)";
              setIsPaused(true);
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.color = "var(--text-primary)";
              setIsPaused(false);
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={scrollRight}
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              color: "var(--text-primary)",
              boxShadow: "var(--shadow-sm)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "var(--text-primary)";
              e.currentTarget.style.transform = "scale(1.05)";
              setIsPaused(true);
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.transform = "scale(1)";
              setIsPaused(false);
            }}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div 
        style={{ margin: "0 -24px", padding: "0 24px" }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div
          ref={scrollRef}
          className="team-carousel-container"
          style={{
            display: "flex",
            gap: 24,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            paddingBottom: 40,
            paddingTop: 8,
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE
          }}
        >
          {TEAM.map((member, i) => (
            <motion.div
              key={member.name}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              whileHover={{ y: -8, boxShadow: "var(--shadow-glow)" }}
              style={{
                flex: "0 0 300px",
                scrollSnapAlign: "center",
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: 32,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 16,
                transition: "box-shadow 0.3s, transform 0.3s",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
              }}
            >
              {/* Background gradient accent */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 80,
                  background: `linear-gradient(135deg, ${member.gradient[0]}, ${member.gradient[1]})`,
                  opacity: 0.15,
                  zIndex: 0,
                }}
              />

              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${member.gradient[0]}, ${member.gradient[1]})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  zIndex: 1,
                  border: "4px solid var(--bg-card)",
                  boxShadow: "var(--shadow-md)",
                  overflow: "hidden",
                }}
              >
                <img 
                  src={member.image} 
                  alt={member.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              
              <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>{member.name}</h3>
                <span 
                  style={{ 
                    fontSize: 14, 
                    fontWeight: 600, 
                    color: "#ffffff",
                    background: `linear-gradient(135deg, ${member.gradient[0]}, ${member.gradient[1]})`,
                    padding: "4px 16px",
                    borderRadius: 16,
                    display: "inline-block",
                    alignSelf: "center",
                    boxShadow: "var(--shadow-sm)"
                  }}
                >
                  {member.role}
                </span>
              </div>

              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "var(--text-secondary)",
                  position: "relative",
                  zIndex: 1,
                  margin: 0,
                }}
              >
                {member.desc}
              </p>

              <div 
                style={{ 
                  display: "flex", 
                  gap: 16, 
                  marginTop: "auto", 
                  paddingTop: 16,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <a href="#" style={{ color: "var(--text-secondary)", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = member.gradient[0]} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>
                  <Twitter size={18} />
                </a>
                <a href="#" style={{ color: "var(--text-secondary)", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = member.gradient[0]} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>
                  <Linkedin size={18} />
                </a>
                <a href="#" style={{ color: "var(--text-secondary)", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = member.gradient[0]} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>
                  <Github size={18} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .team-carousel-container::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </AnimatedSection>
  );
}
