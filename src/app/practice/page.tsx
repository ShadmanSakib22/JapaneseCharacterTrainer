"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type PracticeMode = "hiragana" | "katakana" | "mixed" | "kanji";

export default function PracticePage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<PracticeMode | null>(null);

  const handleNext = () => {
    if (!selectedMode) return;
    router.push(`/practice/select?mode=${selectedMode}`);
  };

  return (
    <div className="min-h-screen stars-bg flicker flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <main className="py-24">
        {/* Title block */}
        <div className="relative z-10 text-center mb-12">
          <div className="font-pixel text-xs glow-cyan mb-2 tracking-widest">
            ― PRESS START ―
          </div>
          <h1 className="font-pixel text-3xl md:text-4xl glow-gold mb-3 leading-relaxed">
            Moji Crawler
          </h1>
          <div
            className="font-vt text-xl sm:text-2xl"
            style={{ color: "var(--text-dim)" }}
          >
            Japanese Character Training Simulator
          </div>
        </div>

        {/* Mode selection */}
        <div className="relative z-10 w-full max-w-4xl mb-10">
          <div className="font-pixel text-[9px] sm:text-xs glow-cyan mb-6 text-center tracking-widest">
            ▼ SELECT YOUR TRAINING CLASS ▼
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setSelectedMode("hiragana")}
              className={`mode-card p-6 flex flex-col items-center gap-3 ${selectedMode === "hiragana" ? "selected" : ""}`}
            >
              <div className="flex items-center justify-center" style={{ height: "64px" }}>
                <span className="float" style={{ fontSize: "56px", lineHeight: 1 }}>
                  あ
                </span>
              </div>
              <span className="font-pixel text-xs glow-cyan">HIRAGANA</span>
              <div
                className="font-vt text-lg"
                style={{ color: "var(--text-dim)" }}
              >
                Beginner
              </div>
              <div className="flex gap-1">
                {"★★★☆☆".split("").map((s, i) => (
                  <span
                    key={i}
                    style={{
                      color:
                        s === "★" ? "var(--accent-gold)" : "var(--text-dim)",
                      fontSize: "12px",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </button>

            <button
              onClick={() => setSelectedMode("katakana")}
              className={`mode-card p-6 flex flex-col items-center gap-3 ${selectedMode === "katakana" ? "selected" : ""}`}
            >
              <div className="flex items-center justify-center" style={{ height: "64px" }}>
                <span className="float" style={{ fontSize: "56px", lineHeight: 1, animationDelay: "0.5s" }}>
                  ア
                </span>
              </div>
              <span
                className="font-pixel text-xs"
                style={{
                  color: "var(--accent-magenta)",
                  textShadow: "0 0 10px var(--accent-magenta)",
                }}
              >
                KATAKANA
              </span>
              <div
                className="font-vt text-lg"
                style={{ color: "var(--text-dim)" }}
              >
                Intermediate
              </div>
              <div className="flex gap-1">
                {"★★★★☆".split("").map((s, i) => (
                  <span
                    key={i}
                    style={{
                      color:
                        s === "★" ? "var(--accent-gold)" : "var(--text-dim)",
                      fontSize: "12px",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </button>

            <button
              onClick={() => setSelectedMode("mixed")}
              className={`mode-card p-6 flex flex-col items-center gap-3 ${selectedMode === "mixed" ? "selected" : ""}`}
            >
              <div className="flex items-center justify-center" style={{ height: "64px" }}>
                <span className="float" style={{ fontSize: "40px", lineHeight: 1, animationDelay: "1s" }}>
                  あア
                </span>
              </div>
              <span
                className="font-pixel text-xs"
                style={{
                  color: "var(--accent-green)",
                  textShadow: "0 0 10px var(--accent-green)",
                }}
              >
                MIXED
              </span>
              <div
                className="font-vt text-lg"
                style={{ color: "var(--text-dim)" }}
              >
                Advanced
              </div>
              <div className="flex gap-1">
                {"★★★★★".split("").map((s, i) => (
                  <span
                    key={i}
                    style={{
                      color:
                        s === "★" ? "var(--accent-gold)" : "var(--text-dim)",
                      fontSize: "12px",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </button>

            <button
              onClick={() => setSelectedMode("kanji")}
              className={`mode-card p-6 flex flex-col items-center gap-3 ${selectedMode === "kanji" ? "selected" : ""}`}
            >
              <div className="flex items-center justify-center" style={{ height: "64px" }}>
                <span className="float" style={{ fontSize: "56px", lineHeight: 1, animationDelay: "1.5s" }}>
                  漢
                </span>
              </div>
              <span
                className="font-pixel text-xs"
                style={{
                  color: "var(--accent-gold)",
                  textShadow: "0 0 10px var(--accent-gold)",
                }}
              >
                KANJI
              </span>
              <div className="font-vt text-lg" style={{ color: "var(--text-dim)" }}>
                Expert
              </div>
              <div className="flex gap-1">
                {"★★★★★".split("").map((s, i) => (
                  <span
                    key={i}
                    style={{ color: "var(--accent-gold)", fontSize: "12px" }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </button>
          </div>
        </div>

        {/* Start button */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <button
            onClick={handleNext}
            disabled={!selectedMode}
            className="btn-game btn-game-gold text-base px-10 py-4"
          >
            {selectedMode ? `▶ START QUEST` : `SELECT CLASS`}
          </button>
          {!selectedMode && (
            <div
              className="text-center mt-3 font-vt text-xl"
              style={{ color: "var(--text-dim)" }}
            >
              Choose a training class above
            </div>
          )}
        </div>
      </main>

      {/* Decorative corners */}
      <div className="absolute top-4 left-4 font-pixel text-xs glow-cyan opacity-40">
        SYS:OK
      </div>
      <div className="absolute top-4 right-4 font-pixel text-xs glow-cyan opacity-40">
        VER 1.2.0
      </div>
      <div
        className="absolute bottom-4 left-4 font-vt text-lg"
        style={{ color: "var(--text-dim)" }}
      >
        © MOJI CRAWLER
      </div>
      <div
        className="absolute bottom-4 right-4 font-pixel text-xs opacity-40"
        style={{ color: "var(--accent-magenta)" }}
      >
        INSERT COIN
      </div>
    </div>
  );
}
