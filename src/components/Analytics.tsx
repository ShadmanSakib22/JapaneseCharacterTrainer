'use client';

import { formatDuration, getGroupDisplayName } from '../lib/utils';

interface AnalyticsProps {
  duration: number;
  correctCount: number;
  wrongCount: number;
  weakestGroup: string | null;
  charactersNeedingPractice: { char: string; count: number }[];
  retriesThisSession: number;
  totalAttempts: number;
  expectedTime: number;
  characterMistakes: Record<string, number>;
}

export default function Analytics({
  duration,
  correctCount,
  wrongCount,
  weakestGroup,
  charactersNeedingPractice,
  retriesThisSession,
  totalAttempts,
  expectedTime,
}: AnalyticsProps) {
  const accuracy =
    correctCount + wrongCount > 0
      ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
      : 0;

  return (
    <div className="card bg-base-200 w-full max-w-md shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">Results</h2>

        <div className="flex items-center gap-2 mb-4">
          {wrongCount === 0 ? (
            <span className="text-3xl">✓</span>
          ) : (
            <span className="text-3xl">✗</span>
          )}
          <span className="text-xl">
            You took {formatDuration(duration)}
          </span>
        </div>
        <p className="text-base-content/70 mb-4">
          Expected time: ~{formatDuration(expectedTime)}
        </p>

        <div className="divider">Stats</div>

        <div className="stats stats-vertical shadow w-full">
          <div className="stat">
            <div className="stat-title">Accuracy</div>
            <div className="stat-value">{accuracy}%</div>
            <div className="stat-desc">
              {correctCount}/{correctCount + wrongCount} correct
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Retries this session</div>
            <div className="stat-value">{retriesThisSession}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Total attempts</div>
            <div className="stat-value">{totalAttempts}</div>
          </div>
        </div>

        {weakestGroup && (
          <>
            <div className="divider">Weakest Section</div>
            <div className="bg-error/20 p-3 rounded-lg">
              <p className="font-semibold">✗ {getGroupDisplayName(weakestGroup)}</p>
              <p className="text-sm">Most mistakes in this session</p>
            </div>
          </>
        )}

        {charactersNeedingPractice.length > 0 && (
          <>
            <div className="divider">Characters needing more practice</div>
            <div className="space-y-2">
              {charactersNeedingPractice.slice(0, 5).map(({ char, count }) => (
                <div
                  key={char}
                  className="flex items-center justify-between bg-warning/20 p-2 rounded"
                >
                  <span className="font-semibold">{char}</span>
                  <span className="text-sm">wrong {count} time{count > 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}