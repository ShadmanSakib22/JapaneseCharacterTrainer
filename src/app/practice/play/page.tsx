"use client";
import {
  Suspense,
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { hiragana } from "../../../data/hiragana";
import { katakana } from "../../../data/katakana";
import {
  incrementAttempts,
  recordSession,
  generateSessionId,
} from "../../../lib/storage";
import {
  formatDuration,
  isCorrectAnswer,
  calculateExpectedTime,
  shuffleArray,
} from "../../../lib/utils";
import { usePracticeStore } from "../../../lib/store";
import CharacterInput from "../../../components/CharacterInput";
import Analytics from "../../../components/Analytics";

function PlayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const charactersParam = searchParams.get("characters");

  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [sessionMistakes, setSessionMistakes] = useState<
    Record<string, number>
  >({});
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);
  const [accuracyHistory, setAccuracyHistory] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    retriesThisSession,
    isReshuffling,
    incrementRetries,
    triggerReshuffle,
    clearReshuffle,
  } = usePracticeStore();

  const allCharacters = useMemo(() => {
    if (modeParam === "katakana") return katakana;
    if (modeParam === "mixed") return [...hiragana, ...katakana];
    return hiragana;
  }, [modeParam]);

  type PracticeCharacter = (typeof hiragana)[0] & { id: string };
  const [shuffledChars, setShuffledChars] = useState<PracticeCharacter[]>([]);

  const prepareAndShuffle = useCallback((baseChars: typeof hiragana) => {
    return shuffleArray([...baseChars]).map((c, i) => ({
      ...c,
      id: `${c.char}-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
    }));
  }, []);

  useEffect(() => {
    if (!charactersParam || allCharacters.length === 0) return;
    try {
      const charStrings: string[] = JSON.parse(charactersParam);
      const filtered = allCharacters.filter((c) =>
        charStrings.includes(c.char),
      );
      setShuffledChars(prepareAndShuffle(filtered));
    } catch {
      setShuffledChars([]);
    }
  }, [charactersParam, allCharacters, prepareAndShuffle]);

  useEffect(() => {
    usePracticeStore.getState().resetStore();
    if (!modeParam || !charactersParam) {
      router.push("/practice");
      return;
    }
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [modeParam, charactersParam, router]);

  useEffect(() => {
    if (isReshuffling) {
      setInputs({});
      setIsSubmitted(false);
      setDuration(0);
      setShuffleKey((k) => k + 1);
      setShuffledChars((prev) => prepareAndShuffle(prev));
      incrementRetries();
      clearReshuffle();
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    }
  }, [isReshuffling, incrementRetries, clearReshuffle, prepareAndShuffle]);

  const handleInputChange = (char: string, value: string) => {
    setInputs((prev) => ({ ...prev, [char]: value }));
  };

  const handleSubmit = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsSubmitted(true);
    incrementAttempts();

    const currentMistakes: Record<string, number> = {};
    for (const charData of shuffledChars) {
      if (!isCorrectAnswer(inputs[charData.char] || "", charData.romaji)) {
        currentMistakes[charData.char] = 1;
      }
    }

    const currentCorrect =
      shuffledChars.length - Object.keys(currentMistakes).length;
    const currentWrong = Object.keys(currentMistakes).length;
    const currentAccuracy = Math.round(
      (currentCorrect / (currentCorrect + currentWrong)) * 100,
    );

    setSessionCorrect((prev) => prev + currentCorrect);
    setSessionWrong((prev) => prev + currentWrong);
    setAccuracyHistory((prev) => [...prev, currentAccuracy]);
    setSessionMistakes((prev) => {
      const next = { ...prev };
      for (const char of Object.keys(currentMistakes))
        next[char] = (next[char] || 0) + 1;
      return next;
    });

    recordSession({
      id: generateSessionId(),
      date: new Date().toISOString(),
      mode: modeParam as "hiragana" | "katakana" | "mixed",
      groups: [...new Set(shuffledChars.map((c) => c.group))],
      duration,
      correct: currentCorrect,
      wrong: currentWrong,
      mistakes: currentMistakes,
    });
  };

  const expectedTime = calculateExpectedTime(shuffledChars.length);
  let correctCount = 0;
  for (const charData of shuffledChars) {
    if (isCorrectAnswer(inputs[charData.char] || "", charData.romaji))
      correctCount++;
  }
  const wrongCount = shuffledChars.length - correctCount;
  const charsNeedingPractice = Object.entries(sessionMistakes)
    .map(([char, count]) => ({ char, count }))
    .sort((a, b) => b.count - a.count);
  const sessionAccuracy =
    sessionCorrect + sessionWrong > 0
      ? Math.round((sessionCorrect / (sessionCorrect + sessionWrong)) * 100)
      : 0;

  const modeColor =
    modeParam === "katakana"
      ? "var(--accent-magenta)"
      : modeParam === "mixed"
        ? "var(--accent-green)"
        : "var(--accent-cyan)";
  const modeLabel =
    modeParam === "katakana"
      ? "KATAKANA"
      : modeParam === "mixed"
        ? "MIXED"
        : "HIRAGANA";

  // Answered count for progress
  const answeredCount = Object.keys(inputs).filter(
    (k) => inputs[k].length > 0,
  ).length;
  const progressPct =
    shuffledChars.length > 0
      ? Math.round((answeredCount / shuffledChars.length) * 100)
      : 0;

  if (!modeParam || shuffledChars.length === 0) return null;

  return (
    <div
      className="min-h-screen p-2 sm:p-4"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      {/* HUD Header */}
      <div className="game-panel p-2 sm:p-3 mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <Link
            href="/practice/select"
            className="btn-game text-[10px] sm:text-xs px-2 py-2 sm:px-3"
          >
            ◀ SELECT
          </Link>

          <div className="text-center sm:hidden">
            <div
              className="font-pixel text-[8px]"
              style={{ color: "var(--text-dim)" }}
            >
              TIME
            </div>
            <div className="font-pixel text-lg glow-gold">
              {formatDuration(duration)}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div
              className="font-pixel text-[10px] sm:text-xs"
              style={{ color: modeColor }}
            >
              {modeLabel} BATTLE
            </div>
            <div
              className="font-vt text-sm sm:hidden"
              style={{ color: "var(--text-dim)" }}
            >
              {answeredCount}/{shuffledChars.length}
            </div>
          </div>
          <div className="stat-bar w-full">
            <div
              className="stat-bar-fill bar-cyan transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div
            className="hidden sm:block font-vt text-sm mt-1"
            style={{ color: "var(--text-dim)" }}
          >
            {answeredCount}/{shuffledChars.length} answered
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 sm:gap-6">
          <div className="text-center">
            <div
              className="font-pixel text-[10px] sm:text-xs"
              style={{ color: "var(--text-dim)" }}
            >
              TIME
            </div>
            <div className="font-pixel text-lg sm:text-xl glow-gold">
              {formatDuration(duration)}
            </div>
          </div>

          <div className="text-center hidden md:block">
            <div
              className="font-pixel text-[10px] sm:text-xs"
              style={{ color: "var(--text-dim)" }}
            >
              LIVES
            </div>
            <div
              className="font-vt text-2xl"
              style={{ color: "var(--accent-red)" }}
            >
              {"♥".repeat(Math.max(0, 3 - retriesThisSession))}
              {"♡".repeat(Math.min(3, retriesThisSession))}
            </div>
          </div>
        </div>
      </div>

      {/* Character grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 mb-6">
        {shuffledChars.map((charData, index) => (
          <CharacterInput
            key={charData.id}
            japaneseChar={charData.char}
            correctRomaji={charData.romaji}
            onChange={(value) => handleInputChange(charData.char, value)}
            isSubmitted={isSubmitted}
            autoFocus={index === 0}
          />
        ))}
      </div>

      {/* Action bar */}
      {!isSubmitted ? (
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            className="btn-game btn-game-gold text-xs sm:text-sm px-6 sm:px-12 py-3 sm:py-4 w-full sm:w-auto"
          >
            ⚔ SUBMIT ANSWERS
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {retriesThisSession < 3 ? (
              <button
                onClick={() => triggerReshuffle()}
                className="btn-game btn-game-magenta text-xs px-8 py-3 w-full sm:w-auto"
              >
                ↺ RETRY ({3 - retriesThisSession} {3 - retriesThisSession === 1 ? "LIFE" : "LIVES"} LEFT)
              </button>
            ) : (
              <div
                className="font-pixel text-xs px-8 py-3 w-full sm:w-auto text-center"
                style={{ color: "var(--accent-red)", textShadow: "0 0 8px var(--accent-red)" }}
              >
                ✕ NO LIVES REMAINING
              </div>
            )}
            <Link
              href="/practice/select"
              className="btn-game text-xs px-8 py-3 w-full sm:w-auto text-center"
            >
              ◀ NEW QUEST
            </Link>
          </div>
          <Analytics
            duration={duration}
            correctCount={correctCount}
            wrongCount={wrongCount}
            sessionAccuracy={sessionAccuracy}
            accuracyHistory={accuracyHistory}
            charactersNeedingPractice={charsNeedingPractice}
            retriesThisSession={retriesThisSession}
            expectedTime={expectedTime}
          />
        </div>
      )}
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center font-pixel text-xs glow-cyan">
          LOADING DUNGEON...
        </div>
      }
    >
      <PlayContent />
    </Suspense>
  );
}
