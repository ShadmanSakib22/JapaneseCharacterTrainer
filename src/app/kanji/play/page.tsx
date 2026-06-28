"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePracticeStore } from "../../../lib/store";
import {
  getKanjiSM2Store,
  saveKanjiSM2Store,
  applyGrade,
  buildSessionDeck,
} from "../../../lib/kanjiStorage";
import type { KanjiSM2Store } from "../../../lib/kanjiStorage";
import type { KanjiWord } from "../../../data/kanji";

type Grade = "forgot" | "hard" | "medium" | "easy";

const GRADE_CONFIG: Record<
  Grade,
  { label: string; quality: number; color: string; bg: string }
> = {
  forgot: { label: "FORGOT", quality: 0, color: "var(--accent-red)",     bg: "rgba(255,51,102,0.12)" },
  hard:   { label: "HARD",   quality: 2, color: "var(--accent-magenta)", bg: "rgba(255,0,255,0.12)"  },
  medium: { label: "MEDIUM", quality: 3, color: "var(--accent-cyan)",    bg: "rgba(0,255,255,0.12)"  },
  easy:   { label: "EASY",   quality: 5, color: "var(--accent-green)",   bg: "rgba(0,255,136,0.12)"  },
};

const GRADE_ORDER: Grade[] = ["forgot", "hard", "medium", "easy"];

type SessionGrades = Record<Grade, number>;

function CompletionScreen({
  sessionGrades,
  weakCount,
  total,
  onRetryWeak,
}: {
  sessionGrades: SessionGrades;
  weakCount: number;
  total: number;
  onRetryWeak: () => void;
}) {
  const router = useRouter();
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,215,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.02) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      <div className="game-panel p-6 sm:p-10 w-full max-w-lg text-center pixel-border-gold">
        <div className="font-pixel text-[10px] sm:text-xs glow-gold mb-6 tracking-widest">
          ▓▓ SESSION COMPLETE ▓▓
        </div>
        <div className="font-pixel text-4xl sm:text-6xl glow-gold mb-2">{total}</div>
        <div className="font-vt text-xl sm:text-2xl mb-8" style={{ color: "var(--text-dim)" }}>
          cards reviewed
        </div>
        <div className="grid grid-cols-4 gap-2 mb-8">
          {GRADE_ORDER.map((grade) => (
            <div
              key={grade}
              className="flex flex-col items-center py-3"
              style={{
                background: GRADE_CONFIG[grade].bg,
                border: `2px solid ${GRADE_CONFIG[grade].color}`,
              }}
            >
              <span className="font-pixel text-[8px] sm:text-[10px] mb-1" style={{ color: GRADE_CONFIG[grade].color }}>
                {GRADE_CONFIG[grade].label}
              </span>
              <span className="font-pixel text-xl sm:text-2xl" style={{ color: GRADE_CONFIG[grade].color }}>
                {sessionGrades[grade]}
              </span>
            </div>
          ))}
        </div>
        <div className="stat-bar w-full mb-1">
          {total > 0 && (
            <div
              className="stat-bar-fill bar-green"
              style={{ width: `${Math.round(((sessionGrades.easy + sessionGrades.medium) / total) * 100)}%` }}
            />
          )}
        </div>
        <div className="font-pixel text-[8px] mb-8" style={{ color: "var(--text-dim)" }}>
          {total > 0
            ? `${Math.round(((sessionGrades.easy + sessionGrades.medium) / total) * 100)}% known`
            : ""}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {weakCount > 0 && (
            <button onClick={onRetryWeak} className="btn-game btn-game-magenta text-[10px] sm:text-xs px-6 py-3">
              ↺ RETRY WEAK ({weakCount})
            </button>
          )}
          <button onClick={() => router.push("/practice/select?mode=kanji")} className="btn-game text-[10px] sm:text-xs px-6 py-3">
            ◀ BACK TO SELECT
          </button>
        </div>
      </div>
    </div>
  );
}

export default function KanjiPlayPage() {
  const router = useRouter();
  const { kanjiDeck, clearKanjiDeck } = usePracticeStore();

  const [sm2Store, setSm2Store] = useState<KanjiSM2Store>({});
  const [deck, setDeck] = useState<KanjiWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [contentKey, setContentKey] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sessionGrades, setSessionGrades] = useState<SessionGrades>({ forgot: 0, hard: 0, medium: 0, easy: 0 });
  const [gradedCards, setGradedCards] = useState<{ card: KanjiWord; grade: Grade }[]>([]);

  useEffect(() => {
    if (kanjiDeck.length === 0) {
      router.push("/practice/select?mode=kanji");
      return;
    }
    const store = getKanjiSM2Store();
    setSm2Store(store);
    setDeck(buildSessionDeck(kanjiDeck, store));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => { clearKanjiDeck(); };
  }, [clearKanjiDeck]);

  const handleReveal = useCallback(() => {
    if (isTransitioning || isRevealed) return;
    setIsRevealed(true);
    setContentKey((k) => k + 1);
  }, [isTransitioning, isRevealed]);

  const handleGrade = useCallback(
    (grade: Grade) => {
      if (isTransitioning || !isRevealed) return;
      const card = deck[currentIndex];
      if (!card) return;

      setIsTransitioning(true);
      setIsExiting(true);

      setTimeout(() => {
        const newStore = applyGrade(sm2Store, card.kanji, GRADE_CONFIG[grade].quality);
        saveKanjiSM2Store(newStore);
        setSm2Store(newStore);
        setSessionGrades((prev) => ({ ...prev, [grade]: prev[grade] + 1 }));
        setGradedCards((prev) => [...prev, { card, grade }]);

        const next = currentIndex + 1;
        if (next >= deck.length) {
          setIsComplete(true);
          setIsTransitioning(false);
          setIsExiting(false);
          return;
        }
        setCurrentIndex(next);
        setIsRevealed(false);
        setIsExiting(false);
        setContentKey((k) => k + 1);
        setIsTransitioning(false);
      }, 240);
    },
    [isTransitioning, isRevealed, deck, currentIndex, sm2Store]
  );

  const handleRetryWeak = useCallback(() => {
    const weakCards = gradedCards
      .filter((gc) => gc.grade === "forgot" || gc.grade === "hard")
      .map((gc) => gc.card);
    if (weakCards.length === 0) return;
    const freshStore = getKanjiSM2Store();
    setSm2Store(freshStore);
    setDeck(buildSessionDeck(weakCards, freshStore));
    setCurrentIndex(0);
    setIsRevealed(false);
    setIsExiting(false);
    setContentKey((k) => k + 1);
    setIsComplete(false);
    setIsTransitioning(false);
    setSessionGrades({ forgot: 0, hard: 0, medium: 0, easy: 0 });
    setGradedCards([]);
  }, [gradedCards]);

  if (deck.length === 0) return null;

  const weakCount = gradedCards.filter((gc) => gc.grade === "forgot" || gc.grade === "hard").length;

  if (isComplete) {
    return (
      <CompletionScreen
        sessionGrades={sessionGrades}
        weakCount={weakCount}
        total={deck.length}
        onRetryWeak={handleRetryWeak}
      />
    );
  }

  const card = deck[currentIndex];
  const progressPct = deck.length > 0 ? Math.round((currentIndex / deck.length) * 100) : 0;

  // Determine animation class for the card content
  const animClass =
    contentKey === 0
      ? ""
      : isExiting
      ? "anim-exit-left"
      : isRevealed
      ? "anim-enter-up"
      : "anim-enter-right";

  return (
    <div
      className="min-h-screen p-3 sm:p-6 flex flex-col"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,215,0,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.015) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      {/* HUD */}
      <div className="game-panel p-2 sm:p-3 mb-4 flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => router.push("/practice/select?mode=kanji")}
          className="btn-game text-[8px] sm:text-xs px-2 py-2 sm:px-3 shrink-0"
        >
          ◀ SELECT
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div
              className="font-pixel text-[8px] sm:text-[10px]"
              style={{ color: "var(--accent-gold)", textShadow: "0 0 8px var(--accent-gold)" }}
            >
              KANJI REVIEW
            </div>
            <div className="font-vt text-sm sm:text-base" style={{ color: "var(--text-dim)" }}>
              {currentIndex + 1}/{deck.length}
            </div>
          </div>
          <div className="stat-bar w-full">
            <div className="stat-bar-fill bar-gold transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {GRADE_ORDER.map((g) => (
            <div key={g} className="text-center">
              <div className="font-pixel text-[7px]" style={{ color: GRADE_CONFIG[g].color }}>
                {GRADE_CONFIG[g].label[0]}
              </div>
              <div className="font-vt text-lg" style={{ color: GRADE_CONFIG[g].color }}>
                {sessionGrades[g]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <div
          className="w-full max-w-sm sm:max-w-md game-panel overflow-hidden"
          style={{
            border: "3px solid var(--accent-gold)",
            boxShadow: "0 0 24px rgba(255,215,0,0.2), inset 0 0 24px rgba(255,215,0,0.03)",
            minHeight: "300px",
          }}
        >
          <div
            key={contentKey}
            className={`flex flex-col items-center justify-center text-center ${animClass}`}
            style={{ padding: "40px 28px", minHeight: "300px" }}
          >
            {!isRevealed ? (
              /* Front */
              <button
                onClick={handleReveal}
                className="flex flex-col items-center justify-center w-full h-full gap-6"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <div className="font-pixel text-[8px] tracking-widest" style={{ color: "var(--text-dim)" }}>
                  ― KANJI ―
                </div>
                <div
                  className="glow-gold select-none font-vt"
                  style={{ fontSize: "clamp(72px, 20vw, 120px)", lineHeight: 1 }}
                >
                  {card?.kanji}
                </div>
                <div className="font-pixel text-[8px] pulse-text" style={{ color: "var(--text-dim)" }}>
                  ▼ TAP TO REVEAL ▼
                </div>
              </button>
            ) : (
              /* Back */
              <div className="flex flex-col items-center gap-3 w-full">
                <div className="font-vt select-none" style={{ fontSize: "24px", color: "rgba(255,215,0,0.45)", lineHeight: 1 }}>
                  {card?.kanji}
                </div>
                <div
                  className="font-vt text-center select-none"
                  style={{ fontSize: "clamp(20px, 5vw, 30px)", color: "var(--text-primary)", lineHeight: 1.3 }}
                >
                  {card?.meaning}
                </div>
                <div className="w-10 my-1" style={{ height: "1px", background: "rgba(255,215,0,0.3)" }} />
                <div className="glow-gold font-vt select-none" style={{ fontSize: "clamp(20px, 4vw, 26px)" }}>
                  {card?.hiragana}
                </div>
                <div className="font-vt select-none" style={{ fontSize: "clamp(15px, 3.5vw, 20px)", color: "var(--text-dim)" }}>
                  {card?.romaji}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Grade buttons */}
        <div
          className="w-full max-w-sm sm:max-w-md mt-4 transition-opacity duration-200"
          style={{ opacity: isRevealed && !isExiting ? 1 : 0, pointerEvents: isRevealed && !isExiting ? "auto" : "none" }}
        >
          <div className="font-pixel text-[8px] text-center mb-3" style={{ color: "var(--text-dim)" }}>
            HOW WELL DID YOU KNOW IT?
          </div>
          <div className="grid grid-cols-4 gap-2">
            {GRADE_ORDER.map((grade) => {
              const cfg = GRADE_CONFIG[grade];
              return (
                <button
                  key={grade}
                  onClick={() => handleGrade(grade)}
                  disabled={isTransitioning}
                  className="py-3 sm:py-4 font-pixel text-[8px] sm:text-[10px] transition-all active:scale-95"
                  style={{
                    background: cfg.bg,
                    border: `3px solid ${cfg.color}`,
                    color: cfg.color,
                    boxShadow: `0 0 8px ${cfg.color}40, 3px 3px 0 ${cfg.color}30`,
                    clipPath: "polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px))",
                  }}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile grade tally */}
      <div className="sm:hidden flex justify-center gap-4 pb-2">
        {GRADE_ORDER.map((g) => (
          <div key={g} className="flex items-center gap-1">
            <span className="font-pixel text-[7px]" style={{ color: GRADE_CONFIG[g].color }}>
              {GRADE_CONFIG[g].label[0]}
            </span>
            <span className="font-vt text-lg" style={{ color: GRADE_CONFIG[g].color }}>
              {sessionGrades[g]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
