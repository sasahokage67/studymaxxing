import React, { useEffect, useState } from 'react';

interface CircularTimerProps {
  initialSeconds: number;
  isRunning: boolean;
  onTimeUp: () => void;
  size?: number;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
  initialSeconds,
  isRunning,
  onTimeUp
}) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    setTimeLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, onTimeUp]);

  const percentage = Math.max(0, (timeLeft / initialSeconds) * 100);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isWarning = timeLeft <= 15 && timeLeft > 5;
  const isCritical = timeLeft <= 5;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Precision Digital Readout */}
      <div className="flex items-baseline gap-1 font-mono select-none">
        <span
          className={`text-3xl font-bold tracking-tight ${
            isCritical ? 'text-rose-500' : isWarning ? 'text-amber-400' : 'text-zinc-100'
          }`}
        >
          {formatted}
        </span>
        <span className="text-[11px] font-mono text-zinc-500">SEC</span>
      </div>

      {/* Hairline Progress Bar */}
      <div className="w-full h-1 bg-zinc-800 rounded-full mt-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-zinc-300'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="w-full flex justify-between text-[10px] font-mono text-zinc-500 mt-1.5">
        <span>LIMIT: {initialSeconds}S</span>
        <span>{isCritical ? 'LOCK IMMINENT' : isWarning ? 'FINALIZE' : 'ACTIVE'}</span>
      </div>
    </div>
  );
};
