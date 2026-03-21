import type { OnboardingData } from "./types";
import { BookOpen } from "lucide-react";

interface Props {
  data: OnboardingData;
  set: <K extends keyof OnboardingData>(key: K, val: OnboardingData[K]) => void;
}

export default function StepScienceInfo({ data, set }: Props) {
  return (
    <>
      <p className="ob-step-label">Step 6 of 6</p>
      <h1 className="ob-title">Backed by Science</h1>
      <p className="ob-subtitle">Science shows reading calms the body and mind.</p>

      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <div style={{ marginBottom: 32, display: "flex", justifyContent: "center" }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "var(--sage)", display: "flex",
            alignItems: "center", justifyContent: "center",
            boxShadow: "0 10px 30px rgba(223,117,90,0.3)"
          }}>
            <BookOpen size={40} color="white" />
          </div>
        </div>
        <h3 style={{ fontSize: 24, marginBottom: 16, color: "var(--ink)", fontFamily: "var(--font-serif)" }}>Proven to reduce stress</h3>
        <p style={{ color: "var(--bark)", lineHeight: 1.6, maxWidth: 400, margin: "0 auto 40px" }}>
          Just 6 minutes of silent reading can slow your heart rate and reduce tension. As your companion, I'm here to support your mental well-being on this journey.
        </p>

        <div style={{
          background: "var(--cream)",
          border: "1px solid var(--sand)",
          borderRadius: "var(--radius)",
          padding: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ textAlign: "left" }}>
            <h4 style={{ fontWeight: 600, fontSize: 16, marginBottom: 4, letterSpacing: "-0.01em", margin: 0, color: "var(--ink)" }}>Gen Z Mode</h4>
            <p style={{ fontSize: 13, color: "var(--bark)", margin: 0, marginTop: 4 }}>Enable Gen Z slang in AI responses (no cap)</p>
          </div>
          <label className="css-toggle" style={{ cursor: "pointer", display: "inline-block" }}>
            <input
              type="checkbox"
              checked={data.genZMode}
              onChange={(e) => set("genZMode", e.target.checked)}
              style={{ display: "none" }}
            />
            <div
              style={{
                width: 44,
                height: 24,
                background: data.genZMode ? "var(--sage)" : "var(--sand)",
                borderRadius: 12,
                position: "relative",
                transition: "0.3s",
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  background: "white",
                  borderRadius: "50%",
                  position: "absolute",
                  top: 2,
                  left: data.genZMode ? 22 : 2,
                  transition: "0.3s",
                }}
              />
            </div>
          </label>
        </div>
      </div>
    </>
  );
}
