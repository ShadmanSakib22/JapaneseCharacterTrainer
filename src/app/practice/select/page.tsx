'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { hiragana, hiraganaGroups, type HiraganaGroup } from '../../../data/hiragana';
import { katakana, katakanaGroups, type KatakanaGroup } from '../../../data/katakana';
import { getGroupDisplayName, shuffleArray } from '../../../lib/utils';

function SelectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') as 'hiragana' | 'katakana' | null;

  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [selectType, setSelectType] = useState<'groups' | 'characters' | 'all'>('groups');

  const characters = mode === 'katakana' ? katakana : hiragana;
  const groups = mode === 'katakana' ? katakanaGroups : hiraganaGroups;

  useEffect(() => {
    if (!mode) {
      router.push('/practice');
    }
  }, [mode, router]);

  const availableCharacters = useMemo(() => {
    if (selectType === 'all' || selectType === 'characters') {
      return characters;
    }
    return characters.filter((c) => selectedGroups.has(c.group));
  }, [selectType, selectedGroups, characters]);

  const toggleGroup = (group: string) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(group)) {
      newSelected.delete(group);
    } else {
      newSelected.add(group);
    }
    setSelectedGroups(newSelected);
  };

  const selectAll = () => {
    setSelectedGroups(new Set(groups));
  };

  const clearAll = () => {
    setSelectedGroups(new Set());
  };

  const handleStart = () => {
    const selectedChars = availableCharacters;
    const shuffled = shuffleArray(selectedChars);

    const params = new URLSearchParams();
    params.set('mode', mode!);
    params.set('characters', JSON.stringify(shuffled.map((c) => c.char)));

    router.push(`/practice/play?${params.toString()}`);
  };

  if (!mode) {
    return null;
  }

  const characterCount = availableCharacters.length;

  return (
    <div className="min-h-screen flex flex-col p-6">
      <Link href="/practice" className="btn btn-ghost btn-sm mb-4">
        ← Back
      </Link>

      <h1 className="text-3xl font-bold mb-2">
        {mode === 'hiragana' ? 'Hiragana' : 'Katakana'} Practice
      </h1>
      <p className="text-base-content/70 mb-6">Select your practice scope</p>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setSelectType('groups')}
          className={`btn ${selectType === 'groups' ? 'btn-primary' : 'btn-outline'}`}
        >
          Select Groups
        </button>
        <button
          onClick={() => setSelectType('characters')}
          className={`btn ${selectType === 'characters' ? 'btn-primary' : 'btn-outline'}`}
        >
          Select Characters
        </button>
        <button
          onClick={() => setSelectType('all')}
          className={`btn ${selectType === 'all' ? 'btn-primary' : 'btn-outline'}`}
        >
          All
        </button>
      </div>

      {selectType === 'groups' && (
        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <button onClick={selectAll} className="btn btn-sm btn-secondary">
              Select All
            </button>
            <button onClick={clearAll} className="btn btn-sm btn-ghost">
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {groups.map((group) => (
              <label
                key={group}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedGroups.has(group)
                    ? 'border-primary bg-primary/10'
                    : 'border-base-300 hover:border-primary/50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedGroups.has(group)}
                  onChange={() => toggleGroup(group)}
                  className="checkbox checkbox-primary"
                />
                <span className="text-sm">{getGroupDisplayName(group)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {selectType === 'characters' && (
        <div className="mb-6">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {characters.map((char) => (
              <label
                key={char.char}
                className={`flex flex-col items-center p-2 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedGroups.has(char.char)
                    ? 'border-primary bg-primary/10'
                    : 'border-base-300 hover:border-primary/50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedGroups.has(char.char)}
                  onChange={() => toggleGroup(char.char)}
                  className="checkbox checkbox-primary checkbox-sm"
                />
                <span className="text-xl">{char.char}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-6 border-t">
        <p className="text-lg">
          <strong>{characterCount}</strong> characters selected
        </p>
        <button
          onClick={handleStart}
          disabled={characterCount === 0}
          className="btn btn-primary btn-lg"
        >
          Start Practice
        </button>
      </div>
    </div>
  );
}

export default function SelectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SelectContent />
    </Suspense>
  );
}