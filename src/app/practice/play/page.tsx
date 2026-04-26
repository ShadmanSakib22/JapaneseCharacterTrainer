"use client";
// src/app/practice/play/page.tsx
import { Suspense, useState, useEffect, useMemo, useRef } from "react";
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

  const practiceCharacters = useMemo(() => {
    if (!charactersParam) return [];
    try {
      const charStrings: string[] = JSON.parse(charactersParam);
      const filtered = allCharacters.filter((c) =>
        charStrings.includes(c.char),
      );
      return shuffleArray(filtered);
    } catch {
      return [];
    }
  }, [charactersParam, allCharacters, shuffleKey]);

  useEffect(() => {
    // Reset session stats when starting a new practice
    usePracticeStore.getState().resetStore();

    if (!modeParam || !charactersParam || practiceCharacters.length === 0) {
      router.push("/practice");
      return;
    }

    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isReshuffling) {
      setInputs({});
      setIsSubmitted(false);
      setDuration(0);
      // We don't reset sessionMistakes here to accumulate across retries
      setShuffleKey((k) => k + 1);
      incrementRetries();
      clearReshuffle();

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    }
  }, [isReshuffling, incrementRetries, clearReshuffle]);

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
    for (const charData of practiceCharacters) {
      const userInput = inputs[charData.char] || "";
      if (!isCorrectAnswer(userInput, charData.romaji)) {
        currentMistakes[charData.char] = 1;
      }
    }

    // Accumulate mistakes for the session view
    setSessionMistakes((prev) => {
      const next = { ...prev };
      for (const char of Object.keys(currentMistakes)) {
        next[char] = (next[char] || 0) + 1;
      }
      return next;
    });

    recordSession({
      id: generateSessionId(),
      date: new Date().toISOString(),
      mode: modeParam as "hiragana" | "katakana" | "mixed",
      groups: [...new Set(practiceCharacters.map((c) => c.group))],
      duration,
      correct: practiceCharacters.length - Object.keys(currentMistakes).length,
      wrong: Object.keys(currentMistakes).length,
      mistakes: currentMistakes,
    });
  };

  const handlePracticeAgain = () => {
    triggerReshuffle();
  };

  const expectedTime = calculateExpectedTime(practiceCharacters.length);

  const groupMistakes: Record<string, number> = {};
  let weakestGroup: string | null = null;
  let maxGroupMistakes = 0;
  let correctCount = 0;

  for (const charData of practiceCharacters) {
    const userInput = inputs[charData.char] || "";
    if (isCorrectAnswer(userInput, charData.romaji)) {
      correctCount++;
    } else {
      const groupCount = (groupMistakes[charData.group] || 0) + 1;
      groupMistakes[charData.group] = groupCount;
      if (groupCount > maxGroupMistakes) {
        maxGroupMistakes = groupCount;
        weakestGroup = charData.group;
      }
    }
  }

  const wrongCount = practiceCharacters.length - correctCount;
  const charsNeedingPractice = Object.entries(sessionMistakes)
    .map(([char, count]) => ({ char, count }))
    .sort((a, b) => b.count - a.count);

  if (!modeParam || practiceCharacters.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <Link href="/practice/select" className="btn btn-ghost btn-sm">
          ← Select
        </Link>
        <h1 className="text-xl font-bold">
          {modeParam === "hiragana"
            ? "Hiragana"
            : modeParam === "katakana"
              ? "Katakana"
              : "Hiragana + Katakana"}{" "}
          Practice
        </h1>
        <div className="text-2xl font-mono font-bold">
          {formatDuration(duration)}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {practiceCharacters.map((charData, index) => (
          <CharacterInput
            key={`${shuffleKey}-${charData.char}`}
            japaneseChar={charData.char}
            correctRomaji={charData.romaji}
            onChange={(value) => handleInputChange(charData.char, value)}
            isSubmitted={isSubmitted}
            autoFocus={index === 0}
          />
        ))}
      </div>

      {!isSubmitted ? (
        <button
          onClick={handleSubmit}
          className="btn btn-primary btn-lg w-full"
        >
          Submit
        </button>
      ) : (
        <div className="space-y-4">
          <button
            onClick={handlePracticeAgain}
            className="btn btn-secondary btn-lg w-full"
          >
            Practice Again
          </button>

          <Analytics
            duration={duration}
            correctCount={correctCount}
            wrongCount={wrongCount}
            weakestGroup={weakestGroup}
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
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <PlayContent />
    </Suspense>
  );
}
