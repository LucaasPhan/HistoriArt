import { useTranslation } from "@/lib/i18n";
import type { OnboardingData } from "../types";

export interface StepProps {
  data: OnboardingData;
  set: <K extends keyof OnboardingData>(key: K, val: OnboardingData[K]) => void;
}

// ─── PART 1: StepPersonal ───
export function StepPersonal({ data, set }: StepProps) {
  const { t } = useTranslation();
  return (
    <div>
      <h2 className="ob-title">{t("ob.step1.title")}</h2>
      <p className="ob-subtitle">{t("ob.step1.subtitle")}</p>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <input
          className="ob-input"
          placeholder={t("settings.firstName")}
          value={data.firstName}
          onChange={(e) => set("firstName", e.target.value)}
        />
        <input
          className="ob-input"
          placeholder={t("settings.lastName")}
          value={data.lastName}
          onChange={(e) => set("lastName", e.target.value)}
        />
      </div>

      <input
        className="ob-input"
        placeholder={t("settings.age")}
        type="number"
        value={data.age}
        min={12}
        max={99}
        onChange={(e) => set("age", e.target.value)}
        style={{ marginBottom: 16 }}
      />

      <div className="ob-section">{t("settings.gender")}</div>
      <div className="sp-gender-grid">
        {[
          { v: "male", l: t("ob.gender.male"), i: "♂" },
          { v: "female", l: t("ob.gender.female"), i: "♀" },
          { v: "non-binary", l: t("ob.gender.nonBinary"), i: "◈" },
          { v: "prefer-not-to-say", l: t("ob.gender.preferNotToSay"), i: "○" },
        ].map((g) => (
          <button
            key={g.v}
            type="button"
            className={`ob-chip ${data.gender === g.v ? "ob-chip--active" : ""}`}
            onClick={() => set("gender", g.v as any)}
          >
            <span className="sp-icon">{g.i}</span> {g.l}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── PART 2: StepPurpose ───
export function StepPurpose({ data, set }: StepProps) {
  const { t } = useTranslation();

  const PURPOSES = [
    {
      value: "learn-and-grow",
      label: t("ob.purpose.learn"),
      desc: t("ob.purpose.learnDesc"),
      emoji: "🌱",
    },
    {
      value: "academic",
      label: t("ob.purpose.academic"),
      desc: t("ob.purpose.academicDesc"),
      emoji: "🎓",
    },
    {
      value: "explore-stories",
      label: t("ob.purpose.stories"),
      desc: t("ob.purpose.storiesDesc"),
      emoji: "📖",
    },
    {
      value: "media-experience",
      label: t("ob.purpose.media"),
      desc: t("ob.purpose.mediaDesc"),
      emoji: "🎬",
    },
    { value: "other", label: t("ob.purpose.other"), desc: t("ob.purpose.otherDesc"), emoji: "○" },
  ];

  const handleToggle = (val: string) => {
    if (data.purposeOfUse.includes(val)) {
      set(
        "purposeOfUse",
        data.purposeOfUse.filter((x) => x !== val),
      );
    } else {
      set("purposeOfUse", [...data.purposeOfUse, val]);
    }
  };

  return (
    <div>
      <h2 className="ob-title">{t("ob.step2.title")}</h2>
      <p className="ob-subtitle">{t("ob.step2.subtitle")}</p>

      <div className="spu-grid">
        {PURPOSES.map((p) => {
          const isActive = data.purposeOfUse.includes(p.value);
          return (
            <button
              key={p.value}
              type="button"
              className={`spu-card ${isActive ? "spu-card--active" : ""}`}
              onClick={() => handleToggle(p.value)}
            >
              <div className="spu-emoji">{p.emoji}</div>
              <div>
                <div className="spu-label">{p.label}</div>
                <div className="spu-desc">{p.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {data.purposeOfUse.includes("other") && (
        <div className="spu-custom-wrap">
          <input
            className="spu-input"
            autoFocus
            placeholder={t("ob.misc.otherPlaceholder")}
            value={data.customPurpose || ""}
            onChange={(e) => set("customPurpose", e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

// ─── PART 3: StepReadingGoal ───
export function StepReadingGoal({ data, set }: StepProps) {
  const { t } = useTranslation();

  const GOALS = [
    { value: "facts", label: t("ob.goal.facts"), desc: t("ob.goal.factsDesc"), emoji: "📅" },
    {
      value: "insights",
      label: t("ob.goal.insights"),
      desc: t("ob.goal.insightsDesc"),
      emoji: "💡",
    },
    { value: "epic", label: t("ob.goal.epic"), desc: t("ob.goal.epicDesc"), emoji: "⚔️" },
    { value: "roots", label: t("ob.goal.roots"), desc: t("ob.goal.rootsDesc"), emoji: "🇻🇳" },
  ];

  const handleToggle = (val: string) => {
    if (data.readingGoal.includes(val)) {
      set(
        "readingGoal",
        data.readingGoal.filter((x) => x !== val),
      );
    } else {
      set("readingGoal", [...data.readingGoal, val]);
    }
  };

  return (
    <div>
      <h2 className="ob-title">{t("ob.step3.title")}</h2>
      <p className="ob-subtitle">{t("ob.step3.subtitle")}</p>

      <div className="spu-grid">
        {GOALS.map((p) => {
          const isActive = data.readingGoal.includes(p.value);
          return (
            <button
              key={p.value}
              type="button"
              className={`scs-card ${isActive ? "scs-card--active" : ""}`}
              onClick={() => handleToggle(p.value)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>{p.emoji}</span>
                <div style={{ textAlign: "left" }}>
                  <div className="scs-label">{p.label}</div>
                  <div className="scs-desc">{p.desc}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── PART 4: StepPersonality ───
export function StepPersonality({ data, set }: StepProps) {
  const { t } = useTranslation();

  const PERSONALITIES = [
    {
      value: "researcher",
      label: t("ob.personality.researcher"),
      desc: t("ob.personality.researcherDesc"),
      emoji: "🧐",
    },
    {
      value: "storyteller",
      label: t("ob.personality.storyteller"),
      desc: t("ob.personality.storytellerDesc"),
      emoji: "🎭",
    },
    {
      value: "student",
      label: t("ob.personality.student"),
      desc: t("ob.personality.studentDesc"),
      emoji: "🎒",
    },
    {
      value: "explorer",
      label: t("ob.personality.explorer"),
      desc: t("ob.personality.explorerDesc"),
      emoji: "🧭",
    },
  ];

  return (
    <div>
      <h2 className="ob-title">{t("ob.step4.title")}</h2>
      <p className="ob-subtitle">{t("ob.step4.subtitle")}</p>

      <div className="scs-list">
        {PERSONALITIES.map((p) => {
          const isActive = data.personality === p.value;
          return (
            <button
              key={p.value}
              type="button"
              className={`scs-card ${isActive ? "scs-card--active" : ""}`}
              onClick={() => set("personality", p.value)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>{p.emoji}</span>
                <div style={{ textAlign: "left" }}>
                  <div className="scs-label">{p.label}</div>
                  <div className="scs-desc">{p.desc}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── PART 5: StepCommStyle ───
export function StepCommStyle({ data, set }: StepProps) {
  const { t } = useTranslation();

  const COMM_PREFS = [
    { value: "professor", label: t("ob.comm.professor"), desc: t("ob.comm.professorDesc") },
    { value: "narrator", label: t("ob.comm.narrator"), desc: t("ob.comm.narratorDesc") },
    { value: "guide", label: t("ob.comm.guide"), desc: t("ob.comm.guideDesc") },
    { value: "quick", label: t("ob.comm.quick"), desc: t("ob.comm.quickDesc") },
  ];

  return (
    <div>
      <h2 className="ob-title">{t("ob.step5.title")}</h2>
      <p className="ob-subtitle">{t("ob.step5.subtitle")}</p>

      <div className="scs-list" style={{ marginBottom: 24 }}>
        {COMM_PREFS.map((p) => {
          const isActive = data.communicationPreference === p.value;
          return (
            <button
              key={p.value}
              type="button"
              className={`scs-card ${isActive ? "scs-card--active" : ""}`}
              onClick={() => set("communicationPreference", p.value as any)}
            >
              <div style={{ textAlign: "left" }}>
                <div className="scs-label">{p.label}</div>
                <div className="scs-desc">{p.desc}</div>
              </div>
              <div className="scs-dot">
                <div className="scs-dot-inner" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
