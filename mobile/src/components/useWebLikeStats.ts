import { useMemo } from 'react';
import { useHabitApp } from '../providers/useHabitApp';

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function useWebLikeStats() {
  const { habits } = useHabitApp();
  const todayISO = toISO(new Date());

  return useMemo(() => {
    const dueCount = habits.filter((h) => h.isDueOn?.(todayISO)).length;
    const doneCount = habits.filter((h) => h.isCompletedOn?.(todayISO)).length;

    // Total successes across all time (sum of completion histories)
    const totalSuccess = habits.reduce(
      (sum, h) => sum + (h.getCompletionHistory?.().length ?? 0),
      0
    );

    // Gamification: 10 XP per success, 250 XP per level (same as web)
    const XP_PER_SUCCESS = 10;
    const XP_PER_LEVEL = 250;
    const xpTotal = totalSuccess * XP_PER_SUCCESS;
    const level = Math.max(1, Math.floor(xpTotal / XP_PER_LEVEL) + 1);
    const xpInto = xpTotal % XP_PER_LEVEL;
    const xpRemaining = XP_PER_LEVEL - xpInto;
    const levelPct = Math.round((xpInto / XP_PER_LEVEL) * 100);

    // Longest streak over last 365 days considering due days only
    const daysBack = 365;
    type HabitLike = {
      isDueOn?: (iso: string) => boolean;
      isCompletedOn?: (iso: string) => boolean;
      getCompletionHistory?: () => string[];
    };
    const calcLongest = (h: HabitLike) => {
      let longest = 0;
      let current = 0;
      for (let i = 0; i < daysBack; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const iso = toISO(date);
        if (!h.isDueOn?.(iso)) continue;
        if (h.isCompletedOn?.(iso)) {
          current += 1;
          if (current > longest) longest = current;
        } else {
          current = 0;
        }
      }
      return longest;
    };
    const longestStreak = habits.reduce((m, h) => Math.max(m, calcLongest(h)), 0);

    return { todayISO, dueCount, doneCount, totalSuccess, xpTotal, level, levelPct, xpRemaining, longestStreak };
  }, [habits, todayISO]);
}
