"use client";

import { useState, useRef, useEffect } from "react";
import { isCorrectAnswer as checkAnswer } from "../lib/utils";

interface CharacterInputProps {
  japaneseChar: string;
  correctRomaji: string;
  onChange: (value: string) => void;
  isSubmitted: boolean;
  autoFocus?: boolean;
}

export default function CharacterInput({
  japaneseChar,
  correctRomaji,
  onChange,
  isSubmitted,
  autoFocus = false,
}: CharacterInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (isSubmitted) {
      const correct = checkAnswer(value, correctRomaji);
      setIsCorrect(correct);
      setShowAnswer(!correct);
    }
  }, [isSubmitted, value, correctRomaji]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <div
      className={`char-card p-3 flex flex-col items-center gap-2 ${isSubmitted ? (isCorrect ? "correct" : "incorrect") : ""}`}
      style={{
        clipPath:
          "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
      }}
    >
      {/* Status indicator */}
      {isSubmitted && (
        <div className="w-full flex justify-end">
          <span
            style={{
              fontSize: "14px",
              color: isCorrect ? "var(--accent-green)" : "var(--accent-red)",
            }}
          >
            {isCorrect ? "✓" : "✗"}
          </span>
        </div>
      )}

      {/* Japanese character */}
      <span
        style={{
          fontSize: "48px",
          lineHeight: 1,
          color: isSubmitted
            ? isCorrect
              ? "var(--accent-green)"
              : "var(--accent-red)"
            : "var(--text-primary)",
          textShadow: isSubmitted
            ? isCorrect
              ? "0 0 12px var(--accent-green)"
              : "0 0 12px var(--accent-red)"
            : "none",
        }}
      >
        {japaneseChar}
      </span>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        disabled={isSubmitted}
        placeholder="romaji"
        className={`game-input ${isSubmitted ? (isCorrect ? "correct" : "incorrect") : ""}`}
        style={{ fontSize: "18px" }}
      />

      {/* Correct answer reveal */}
      {showAnswer && (
        <div
          className="font-vt text-lg"
          style={{ color: "var(--accent-gold)" }}
        >
          ▶ {correctRomaji}
        </div>
      )}
    </div>
  );
}
