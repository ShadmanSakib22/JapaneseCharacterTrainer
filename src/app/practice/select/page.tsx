"use client";
import { Suspense, useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { hiragana, hiraganaGroups } from "../../../data/hiragana";
import { katakana, katakanaGroups } from "../../../data/katakana";
import { getGroupDisplayName, shuffleArray } from "../../../lib/utils";

function SelectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") as
    | "hiragana"
    | "katakana"
    | "mixed"
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
