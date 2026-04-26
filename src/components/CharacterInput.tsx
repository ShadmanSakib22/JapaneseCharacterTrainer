'use client';

import { useState, useRef, useEffect } from 'react';
import { isCorrectAnswer as checkAnswer } from '../lib/utils';

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
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
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
      className={`flex flex-col items-center p-4 rounded-xl border-4 transition-colors ${
        isSubmitted
          ? isCorrect
            ? 'border-success bg-success/10'
            : 'border-error bg-error/10'
          : 'border-base-300 bg-base-200'
      }`}
    >
      <span className="text-4xl mb-3">{japaneseChar}</span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        disabled={isSubmitted}
        placeholder="type romaji"
        className={`input input-bordered w-full text-center text-lg ${
          isSubmitted
            ? isCorrect
              ? 'input-success'
              : 'input-error'
            : ''
        }`}
      />
      {showAnswer && (
        <span className="text-sm mt-2 text-error">
          Correct: {correctRomaji}
        </span>
      )}
    </div>
  );
}