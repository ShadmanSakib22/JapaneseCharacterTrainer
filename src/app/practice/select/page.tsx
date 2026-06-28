"use client";
import { Suspense, useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { hiragana, hiraganaGroups } from "../../../data/hiragana";
import { katakana, katakanaGroups } from "../../../data/katakana";
import { kanji } from "../../../data/kanji";
import { getGroupDisplayName, shuffleArray } from "../../../lib/utils";
import {
  getKanjiSM2Store,
  getKanjiGroups,
  getCardsByGroup,
  getSeenCount,
  buildSessionDeck,
} from "../../../lib/kanjiStorage";
import { usePracticeStore } from "../../../lib/store";

const RANDOM_SIZES = [25, 50, 100, 200] as const;

function KanjiSelectContent() {
  const router = useRouter();
  const { setKanjiDeck } = usePracticeStore();

  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [randomSize, setRandomSize] = useState<number | null>(null);
  const [sm2Store] = useState(() => getKanjiSM2Store());

  const groups = useMemo(() => getKanjiGroups(kanji), []);

  const toggleGroup = (group: string) => {
    setRandomSize(null);
    const next = new Set(selectedGroups);
    if (next.has(group)) next.delete(group);
    else next.add(group);
    setSelectedGroups(next);
  };

  const pickRandomSize = (size: number) => {
    setSelectedGroups(new Set());
    setRandomSize(size);
  };

  const selectedCards = useMemo(() => {
    if (randomSize !== null) {
      return buildSessionDeck(kanji, sm2Store).slice(0, randomSize);
    }
    const cards = groups
      .filter((g) => selectedGroups.has(g))
      .flatMap((g) => getCardsByGroup(kanji, g));
    return buildSessionDeck(cards, sm2Store);
  }, [selectedGroups, randomSize, groups, sm2Store]);

  const handleStart = () => {
    if (selectedCards.length === 0) return;
    setKanjiDeck(selectedCards);
    router.push("/kanji/play");
  };

  return (
    <div
      className="min-h-screen p-4 sm:p-6 relative"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,215,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.02) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/practice")}
          className="btn-game text-[8px] sm:text-xs px-4 py-2"
        >
          ◀ BACK
        </button>
        <div>
          <div className="font-pixel text-[8px] sm:text-xs" style={{ color: "var(--text-dim)" }}>
            DUNGEON SELECT
          </div>
          <h1
            className="font-pixel text-base sm:text-lg"
            style={{ color: "var(--accent-gold)", textShadow: "0 0 10px var(--accent-gold)" }}
          >
            KANJI TRAINING
          </h1>
        </div>
        <div className="ml-auto font-vt text-xl sm:text-2xl" style={{ color: "var(--text-dim)" }}>
          <span style={{ color: "var(--accent-gold)" }}>{selectedCards.length}</span> / {kanji.length} CARDS
        </div>
      </div>

      {/* Random Deck Panel */}
      <div className="game-panel p-4 mb-6">
        <div className="font-pixel text-[8px] sm:text-xs glow-gold mb-4">
          ▼ RANDOM DECK (SM-2 PRIORITY)
        </div>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {RANDOM_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => pickRandomSize(size)}
              className="py-3 sm:py-4 font-pixel text-xs sm:text-sm transition-all"
              style={{
                background: randomSize === size ? "rgba(255,215,0,0.12)" : "transparent",
                border: `3px solid ${randomSize === size ? "var(--accent-gold)" : "rgba(255,215,0,0.2)"}`,
                color: randomSize === size ? "var(--accent-gold)" : "var(--text-dim)",
                boxShadow: randomSize === size ? "0 0 12px rgba(255,215,0,0.4)" : "none",
              }}
            >
              {size}
            </button>
          ))}
        </div>
        <div className="mt-2 font-pixel text-[8px]" style={{ color: "var(--text-dim)" }}>
          Picks worst-known + unseen cards first
        </div>
      </div>

      {/* Letter Group Picker */}
      <div className="game-panel p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-pixel text-[8px] sm:text-xs glow-cyan">
            ▼ BY LETTER GROUP
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setRandomSize(null); setSelectedGroups(new Set(groups)); }}
              className="btn-game text-[8px] px-3 py-1"
            >
              ALL
            </button>
            <button
              onClick={() => setSelectedGroups(new Set())}
              className="font-pixel text-[8px] px-3 py-1 transition-all"
              style={{ border: "2px solid rgba(255,255,255,0.15)", color: "var(--text-dim)", background: "transparent" }}
            >
              CLEAR
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {groups.map((group) => {
            const groupCards = getCardsByGroup(kanji, group);
            const seen = getSeenCount(group, kanji, sm2Store);
            const active = selectedGroups.has(group);
            return (
              <button
                key={group}
                onClick={() => toggleGroup(group)}
                className="flex flex-col items-center py-3 px-1 transition-all"
                style={{
                  background: active ? "rgba(255,215,0,0.08)" : "var(--bg-card)",
                  border: `2px solid ${active ? "var(--accent-gold)" : "rgba(0,255,255,0.2)"}`,
                  boxShadow: active ? "0 0 8px rgba(255,215,0,0.3)" : "none",
                }}
              >
                <span
                  className="font-vt"
                  style={{
                    fontSize: "26px",
                    lineHeight: 1,
                    color: active ? "var(--accent-gold)" : "var(--text-primary)",
                  }}
                >
                  {group}
                </span>
                <span className="font-pixel mt-1" style={{ fontSize: "7px", color: "var(--text-dim)" }}>
                  {groupCards.length}
                </span>
                <span className="font-pixel mt-0.5" style={{ fontSize: "6px", color: active ? "rgba(255,215,0,0.6)" : "rgba(122,122,154,0.6)" }}>
                  {seen}/{groupCards.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div
        className="fixed bottom-0 left-0 right-0 p-4 flex flex-wrap gap-3 items-center justify-between"
        style={{
          background: "linear-gradient(transparent, var(--bg-dark) 40%)",
          backdropFilter: "blur(4px)",
        }}
      >
        <div className="font-vt text-xl sm:text-2xl">
          <span className="font-pixel text-sm" style={{ color: "var(--accent-gold)" }}>
            {selectedCards.length}
          </span>
          <span style={{ color: "var(--text-dim)" }}> cards in queue</span>
        </div>
        <button
          onClick={handleStart}
          disabled={selectedCards.length === 0}
          className="btn-game btn-game-gold px-8 py-3"
        >
          ▶ START REVIEW
        </button>
      </div>
      <div className="h-20" />
    </div>
  );
}

function SelectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") as
    | "hiragana"
    | "katakana"
    | "mixed"
    | "kanji"
    | null;

  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [selectType, setSelectType] = useState<"groups" | "characters" | "all">(
    "groups",
  );

  const characters =
    mode === "katakana"
      ? katakana
      : mode === "mixed"
        ? [...hiragana, ...katakana]
        : hiragana;
  const groups =
    mode === "katakana"
      ? katakanaGroups
      : mode === "mixed"
        ? ([
            ...new Set([...hiraganaGroups, ...katakanaGroups]),
          ] as readonly string[])
        : hiraganaGroups;

  useEffect(() => {
    if (!mode) router.push("/practice");
  }, [mode, router]);

  if (mode === "kanji") return <KanjiSelectContent />;

  const availableCharacters = useMemo(() => {
    if (selectType === "all" || selectType === "characters") return characters;
    return characters.filter((c) => selectedGroups.has(c.group));
  }, [selectType, selectedGroups, characters]);

  const toggleGroup = (group: string) => {
    const next = new Set(selectedGroups);
    if (next.has(group)) next.delete(group);
    else next.add(group);
    setSelectedGroups(next);
  };

  const handleStart = () => {
    const shuffled = shuffleArray(availableCharacters);
    const params = new URLSearchParams();
    params.set("mode", mode!);
    params.set("characters", JSON.stringify(shuffled.map((c) => c.char)));
    router.push(`/practice/play?${params.toString()}`);
  };

  const modeLabel =
    mode === "katakana"
      ? "KATAKANA"
      : mode === "mixed"
        ? "MIXED MODE"
        : "HIRAGANA";
  const modeColor =
    mode === "katakana"
      ? "var(--accent-magenta)"
      : mode === "mixed"
        ? "var(--accent-green)"
        : "var(--accent-cyan)";

  if (!mode) return null;

  return (
    <div
      className="min-h-screen p-6 relative"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/practice")}
          className="btn-game text-[8px] text-nowrap sm:text-xs px-4 py-2"
        >
          ◀ BACK
        </button>
        <div>
          <div
            className="font-pixel text-xs"
            style={{ color: "var(--text-dim)" }}
          >
            DUNGEON SELECT
          </div>
          <h1
            className="font-pixel text-base sm:text-lg"
            style={{ color: modeColor, textShadow: `0 0 10px ${modeColor}` }}
          >
            {modeLabel} TRAINING
          </h1>
        </div>
        <div
          className="ml-auto font-vt text-xl sm:text-2xl"
          style={{ color: "var(--text-dim)" }}
        >
          <span style={{ color: modeColor }}>{availableCharacters.length}</span>{" "}
          / {characters.length} CHARS
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { id: "groups", label: "▦ BY GROUP" },
          { id: "characters", label: "◈ BY CHAR" },
          { id: "all", label: "◉ ALL" },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setSelectType(id as any)}
            className="font-pixel text-[8px] sm:text-xs px-4 py-3 transition-all"
            style={{
              background:
                selectType === id ? "rgba(0,255,255,0.1)" : "transparent",
              border: `2px solid ${selectType === id ? "var(--accent-cyan)" : "rgba(0,255,255,0.2)"}`,
              color:
                selectType === id ? "var(--accent-cyan)" : "var(--text-dim)",
              boxShadow:
                selectType === id ? "0 0 10px rgba(0,255,255,0.3)" : "none",
            }}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setSelectedGroups(new Set(groups))}
            className="btn-game text-[8px] sm:text-xs px-3 py-2"
          >
            SELECT ALL
          </button>
          <button
            onClick={() => setSelectedGroups(new Set())}
            className="font-pixel text-[8px] sm:text-xs px-3 py-2 transition-all"
            style={{
              border: "2px solid rgba(255,255,255,0.15)",
              color: "var(--text-dim)",
              background: "transparent",
            }}
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* Group selection */}
      {selectType === "groups" && (
        <div className="game-panel p-4 mb-6">
          <div className="font-pixel text-[8px] sm:text-xs glow-cyan mb-4">
            ▼ SELECT TRAINING GROUPS
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {groups.map((group) => (
              <label
                key={group}
                className={`group-checkbox flex items-center gap-3 cursor-pointer ${selectedGroups.has(group) ? "active" : ""}`}
              >
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    flexShrink: 0,
                    border: `2px solid ${selectedGroups.has(group) ? "var(--accent-gold)" : "rgba(0,255,255,0.3)"}`,
                    background: selectedGroups.has(group)
                      ? "var(--accent-gold)"
                      : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {selectedGroups.has(group) && (
                    <span
                      style={{
                        fontSize: "10px",
                        color: "black",
                        fontWeight: "bold",
                      }}
                    >
                      ✓
                    </span>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={selectedGroups.has(group)}
                  onChange={() => toggleGroup(group)}
                  className="hidden"
                />
                <span
                  className="font-vt text-xl"
                  style={{
                    color: selectedGroups.has(group)
                      ? "var(--accent-gold)"
                      : "var(--text-primary)",
                  }}
                >
                  {getGroupDisplayName(
                    group,
                    mode === "katakana"
                      ? "katakana"
                      : mode === "mixed"
                        ? "mixed"
                        : "hiragana",
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Character selection */}
      {selectType === "characters" && (
        <div className="game-panel p-4 mb-6">
          <div className="font-pixel text-[8px] sm:text-xs glow-cyan mb-4">
            ▼ SELECT INDIVIDUAL CHARACTERS
          </div>
          <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-12 gap-2">
            {characters.map((char) => (
              <label
                key={char.char}
                className={`group-checkbox flex flex-col items-center cursor-pointer py-3 ${selectedGroups.has(char.char) ? "active" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={selectedGroups.has(char.char)}
                  onChange={() => toggleGroup(char.char)}
                  className="hidden"
                />
                <span
                  style={{
                    fontSize: "28px",
                    lineHeight: 1,
                    color: selectedGroups.has(char.char)
                      ? "var(--accent-gold)"
                      : "var(--text-primary)",
                  }}
                >
                  {char.char}
                </span>
                <span
                  className="font-vt text-sm"
                  style={{ color: "var(--text-dim)", marginTop: "2px" }}
                >
                  {char.romaji}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* All mode */}
      {selectType === "all" && (
        <div className="game-panel p-6 mb-6 text-center">
          <div
            className="font-pixel text-[8px] sm:text-xs"
            style={{ color: "var(--text-dim)", marginBottom: "16px" }}
          >
            FULL DUNGEON MODE
          </div>
          <div className="font-pixel text-4xl glow-gold mb-4">
            {characters.length}
          </div>
          <div
            className="font-vt text-2xl"
            style={{ color: "var(--text-dim)" }}
          >
            All characters selected
          </div>
          <div className="mt-4 stat-bar w-full max-w-xs mx-auto">
            <div className="stat-bar-fill bar-gold" style={{ width: "100%" }} />
          </div>
        </div>
      )}

      {/* Footer / Start */}
      <div
        className="fixed bottom-0 left-0 right-0 p-4 flex flex-wrap gap-3 items-center justify-between"
        style={{
          background: "linear-gradient(transparent, var(--bg-dark) 40%)",
          backdropFilter: "blur(4px)",
        }}
      >
        <div className="font-vt text-2xl">
          <span style={{ color: modeColor }} className="font-pixel text-sm">
            {availableCharacters.length}
          </span>
          <span style={{ color: "var(--text-dim)" }}> characters in queue</span>
        </div>
        <button
          onClick={handleStart}
          disabled={availableCharacters.length === 0}
          className="btn-game btn-game-gold px-8 py-3"
        >
          ▶ ENTER DUNGEON
        </button>
      </div>
      <div className="h-20" />
    </div>
  );
}

export default function SelectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center font-pixel text-xs glow-cyan">
          LOADING...
        </div>
      }
    >
      <SelectContent />
    </Suspense>
  );
}
