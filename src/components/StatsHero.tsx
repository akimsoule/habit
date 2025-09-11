import { useMemo } from "react";
import { Trophy, Flame, Target, Medal } from "lucide-react";
import { useHabitApp } from "@/providers/habitContext";

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function StatsHero() {
  const { habits } = useHabitApp();

  const todayISO = toISO(new Date());

  const {
    dueCount,
    doneCount,
    xpTotal,
    level,
    levelPct,
    xpRemaining,
    longestStreak,
    totalSuccess,
  } = useMemo(() => {
    const due = habits.filter((h) => h.isDueOn?.(todayISO)).length;
    const done = habits.filter((h) => h.isCompletedOn?.(todayISO)).length;

    // Total successes across all time (best-effort)
    const success = habits.reduce(
      (sum, h) => sum + (h.getCompletionHistory?.().length ?? 0),
      0
    );

    // Gamification (simple): 10 XP per success, 250 XP per level
    const XP_PER_SUCCESS = 10;
    const XP_PER_LEVEL = 250;
    const totalXP = success * XP_PER_SUCCESS;
    const levelIdx = Math.max(1, Math.floor(totalXP / XP_PER_LEVEL) + 1);
    const xpInto = totalXP % XP_PER_LEVEL;
    const remaining = XP_PER_LEVEL - xpInto;
    const pct = Math.round((xpInto / XP_PER_LEVEL) * 100);

    // Longest streak per habit over the last 365 days (best-effort)
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
        const dueDay = h.isDueOn?.(iso);
        if (!dueDay) continue;
        const doneDay = h.isCompletedOn?.(iso);
        if (doneDay) {
          current += 1;
          if (current > longest) longest = current;
        } else {
          current = 0;
        }
      }
      return longest;
    };
    const longest = habits.reduce((m, h) => Math.max(m, calcLongest(h)), 0);

    return {
      dueCount: due,
      doneCount: done,
      xpTotal: totalXP,
      level: levelIdx,
      levelPct: pct,
      xpRemaining: remaining,
      longestStreak: longest,
      totalSuccess: success,
    };
  }, [habits, todayISO]);

  const todayPct = dueCount > 0 ? Math.round((doneCount / dueCount) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-6 sm:p-8 text-primary-foreground bg-gradient-to-br from-[hsl(var(--hero-from))] to-[hsl(var(--hero-to))] shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold">Bonjour ! 👋</h2>
            <p className="opacity-90 mt-1 text-lg">Niveau {level}</p>
          </div>
          <div className="flex items-center gap-2 text-right">
            <Trophy className="w-5 h-5 opacity-90" />
            <div className="leading-tight">
              <div className="text-xl font-semibold">{xpTotal}</div>
              <div className="text-xs opacity-90">XP</div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm opacity-90 mb-2">
            <span>Progression niveau</span>
            <span>{xpRemaining} XP restants</span>
          </div>
          <div className="h-3 w-full rounded-full bg-primary-foreground/20 overflow-hidden">
            <div
              className="h-full bg-primary-foreground rounded-full"
              style={{ width: `${levelPct}%` }}
            />
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-primary-foreground/10">
          <div className="flex items-center justify-between text-primary-foreground">
            <span className="font-medium">Aujourd'hui</span>
            <span className="text-lg font-semibold">
              {doneCount}/{dueCount}
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-primary-foreground/20 overflow-hidden">
            <div
              className="h-full bg-primary-foreground rounded-full"
              style={{ width: `${todayPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl p-4 border bg-card text-card-foreground">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Plus longue série</span>
          </div>
          <div className="mt-2 text-3xl font-bold">{longestStreak}</div>
        </div>
        <div className="rounded-2xl p-4 border bg-card text-card-foreground">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Habitudes réussies</span>
          </div>
          <div className="mt-2 text-3xl font-bold">{totalSuccess}</div>
        </div>
        <div className="rounded-2xl p-4 border bg-card text-card-foreground">
          <div className="flex items-center gap-2">
            <Medal className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Niveau actuel</span>
          </div>
          <div className="mt-2 text-3xl font-bold">{level}</div>
        </div>
      </div>
    </div>
  );
}
