"use client";

import { formatDuration } from "../lib/utils";

interface AnalyticsProps {
  duration: number;
  correctCount: number;
  wrongCount: number;
  sessionAccuracy: number;
  accuracyHistory: number[];
  charactersNeedingPractice: { char: string; count: number }[];
  retriesThisSession: number;
  expectedTime: number;
}

export default function Analytics({
  duration,
  correctCount,
  wrongCount,
  sessionAccuracy,
  accuracyHistory,
  charactersNeedingPractice,
  retriesThisSession,
  expectedTime,
}: AnalyticsProps) {
  const accuracy =
    correctCount + wrongCount > 0
      ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
      : 0;

  const total = correctCount + wrongCount;
  const grade =
    accuracy >= 90
      ? { label: "S", color: "var(--accent-gold)" }
      : accuracy >= 75
        ? { label: "A", color: "var(--accent-green)" }
        : accuracy >= 60
          ? { label: "B", color: "var(--accent-cyan)" }
          : accuracy >= 40
            ? { label: "C", color: "var(--accent-magenta)" }
            : { label: "F", color: "var(--accent-red)" };

  const faster = duration < expectedTime;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Grade card */}
      <div className="game-panel p-6 text-center corner-decoration">
        <div className="font-pixel text-xs glow-cyan mb-4 tracking-widest">
          ― BATTLE RESULTS ―
        </div>

        <div className="flex items-center justify-center gap-8 mb-6">
          <div>
            <div
              className="font-pixel text-xs mb-1"
              style={{ color: "var(--text-dim)" }}
            >
              GRADE
            </div>
            <div
              className="font-pixel text-6xl"
              style={{
                color: grade.color,
                textShadow: `0 0 20px ${grade.color}`,
              }}
            >
              {grade.label}
            </div>
          </div>
          <div className="text-left">
            <div
              className="font-vt text-2xl"
              style={{
                color:
                  wrongCount === 0
                    ? "var(--accent-green)"
                    : "var(--accent-red)",
              }}
            >
              {wrongCount === 0
                ? "★ PERFECT CLEAR!"
                : `${wrongCount} MISTAKE${wrongCount > 1 ? "S" : ""}`}
            </div>
            <div
              className="font-vt text-xl"
              style={{ color: "var(--text-dim)" }}
            >
              Time:{" "}
              <span
                style={{
                  color: faster ? "var(--accent-green)" : "var(--text-primary)",
                }}
              >
                {formatDuration(duration)}
              </span>
              {faster && (
                <span style={{ color: "var(--accent-green)" }}> ⚡FAST!</span>
              )}
            </div>
            <div
              className="font-vt text-lg"
              style={{ color: "var(--text-dim)" }}
            >
              Target: ~{formatDuration(expectedTime)}
            </div>
          </div>
        </div>

        {/* Accuracy bar */}
        <div className="mb-2 flex items-center justify-between">
          <span
            className="font-pixel text-xs"
            style={{ color: "var(--text-dim)" }}
          >
            ACCURACY
          </span>
          <span className="font-pixel text-sm" style={{ color: grade.color }}>
            {accuracy}%
          </span>
        </div>
        <div className="stat-bar w-full mb-4" style={{ height: "16px" }}>
          <div
            className="stat-bar-fill transition-all duration-700"
            style={{
              width: `${accuracy}%`,
              background: `linear-gradient(90deg, ${grade.color}, ${grade.color}88)`,
            }}
          />
        </div>

        <div className="font-vt text-2xl" style={{ color: "var(--text-dim)" }}>
          <span style={{ color: "var(--accent-green)" }}>{correctCount}</span>{" "}
          correct &nbsp;|&nbsp;
          <span style={{ color: "var(--accent-red)" }}>{wrongCount}</span> wrong
          &nbsp;|&nbsp;
          {total} total
        </div>
      </div>

      {/* Session stats */}
      <div className="game-panel p-4">
        <div className="font-pixel text-xs glow-cyan mb-4">SESSION STATS</div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div
              className="font-pixel text-xs mb-1"
              style={{ color: "var(--text-dim)" }}
            >
              SESSION ACC
            </div>
            <div
              className="font-pixel text-2xl"
              style={{
                color: "var(--accent-magenta)",
                textShadow: "0 0 10px var(--accent-magenta)",
              }}
            >
              {sessionAccuracy}%
            </div>
          </div>
          <div className="text-center">
            <div
              className="font-pixel text-xs mb-1"
              style={{ color: "var(--text-dim)" }}
            >
              RETRIES
            </div>
            <div
              className="font-pixel text-2xl"
              style={{ color: "var(--accent-cyan)" }}
            >
              {retriesThisSession}
            </div>
          </div>
          <div className="text-center">
            <div
              className="font-pixel text-xs mb-1"
              style={{ color: "var(--text-dim)" }}
            >
              ROUNDS
            </div>
            <div
              className="font-pixel text-2xl"
              style={{ color: "var(--accent-gold)" }}
            >
              {accuracyHistory.length}
            </div>
          </div>
        </div>

        {accuracyHistory.length > 1 && (
          <div className="mt-4">
            <div
              className="font-pixel text-xs mb-2"
              style={{ color: "var(--text-dim)" }}
            >
              ACCURACY HISTORY
            </div>
            <div className="flex items-end gap-2 h-16">
              {accuracyHistory.map((acc, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full rounded-sm transition-all duration-500"
                    style={{
                      height: `${Math.max(4, acc * 0.56)}px`,
                      background:
                        acc >= 90
                          ? "var(--accent-gold)"
                          : acc >= 70
                            ? "var(--accent-green)"
                            : acc >= 50
                              ? "var(--accent-cyan)"
                              : "var(--accent-red)",
                    }}
                  />
                  <span
                    className="font-vt text-sm"
                    style={{ color: "var(--text-dim)" }}
                  >
                    {acc}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Weak characters */}
      {charactersNeedingPractice.length > 0 && (
        <div className="game-panel p-4">
          <div
            className="font-pixel text-xs mb-4"
            style={{
              color: "var(--accent-red)",
              textShadow: "0 0 8px var(--accent-red)",
            }}
          >
            ⚠ ENEMIES TO DEFEAT
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {charactersNeedingPractice.slice(0, 5).map(({ char, count }) => (
              <div key={char} className="char-card incorrect p-3 text-center">
                <div style={{ fontSize: "36px", color: "var(--accent-red)" }}>
                  {char}
                </div>
                <div
                  className="font-vt text-lg"
                  style={{ color: "var(--text-dim)" }}
                >
                  ×{count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
