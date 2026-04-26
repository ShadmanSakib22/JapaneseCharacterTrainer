'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type PracticeMode = 'hiragana' | 'katakana' | 'mixed' | 'kanji';

export default function PracticePage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<PracticeMode | null>(null);

  const handleNext = () => {
    if (!selectedMode) return;
    router.push(`/practice/select?mode=${selectedMode}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-2">Japanese Character Trainer</h1>
      <p className="text-lg mb-8">Choose a practice mode to get started.</p>

      <div className="flex gap-6 mb-8">
        <button
          onClick={() => setSelectedMode('hiragana')}
          className={`w-64 h-48 rounded-2xl border-4 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
            selectedMode === 'hiragana'
              ? 'border-primary bg-primary/10 scale-105'
              : 'border-base-300 hover:border-primary/50'
          }`}
        >
          <span className="text-6xl">あ</span>
          <span className="text-xl font-semibold">Hiragana</span>
        </button>

        <button
          onClick={() => setSelectedMode('katakana')}
          className={`w-64 h-48 rounded-2xl border-4 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
            selectedMode === 'katakana'
              ? 'border-primary bg-primary/10 scale-105'
              : 'border-base-300 hover:border-primary/50'
          }`}
        >
          <span className="text-6xl">ア</span>
          <span className="text-xl font-semibold">Katakana</span>
        </button>

        <button
          onClick={() => setSelectedMode('mixed')}
          className={`w-64 h-48 rounded-2xl border-4 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
            selectedMode === 'mixed'
              ? 'border-primary bg-primary/10 scale-105'
              : 'border-base-300 hover:border-primary/50'
          }`}
        >
          <span className="text-5xl">あア</span>
          <span className="text-xl font-semibold">Hiragana + Katakana</span>
        </button>

        <button
          disabled
          className="w-64 h-48 rounded-2xl border-4 border-base-300 opacity-50 cursor-not-allowed flex flex-col items-center justify-center gap-4"
        >
          <span className="text-6xl">漢</span>
          <span className="text-xl font-semibold">Kanji</span>
          <span className="text-sm opacity-70">Coming Soon</span>
        </button>
      </div>

      <button
        onClick={handleNext}
        disabled={!selectedMode}
        className={`btn btn-primary btn-lg ${!selectedMode ? 'btn-disabled' : ''}`}
      >
        Next
      </button>
    </div>
  );
}