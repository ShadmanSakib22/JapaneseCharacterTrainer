'use client';

import { formatDuration, getGroupDisplayName } from '../lib/utils';

interface AnalyticsProps {
  duration: number;
  correctCount: number;
  wrongCount: number;
  sessionAccuracy: number;
  accuracyHistory: number[];
  charactersNeedingPractice: { char: string; count: number }[];
  retriesThisSession: number;
  expectedTime: number;
}

export default function Analytics({
  duration,
  correctCount,
  wrongCount,
  sessionAccuracy,
  accuracyHistory,
  charactersNeedingPractice,
  retriesThisSession,
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
            <span className="text-3xl text-success">✓</span>
          ) : (
            <span className="text-3xl text-error">✗</span>
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
            <div className="stat-title">Current Accuracy</div>
            <div className="stat-value text-primary">{accuracy}%</div>
            <div className="stat-desc">
              {correctCount}/{correctCount + wrongCount} correct
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Session Accuracy</div>
            <div className="stat-value text-secondary">{sessionAccuracy}%</div>
            {accuracyHistory.length > 1 && (
              <div className="stat-desc mt-1 font-mono">
                {accuracyHistory.map(a => `${a}%`).join(' | ')}
              </div>
            )}
          </div>
          <div className="stat">
            <div className="stat-title">Retries this session</div>
            <div className="stat-value">{retriesThisSession}</div>
          </div>
        </div>

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