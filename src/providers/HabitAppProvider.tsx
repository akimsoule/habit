import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Category,
  GoalSmart,
  Habit,
  HabitManager,
  InMemoryHabitRepository,
  NotificationService,
  Priority,
} from "habit.app";
import { LocalStorageStorage } from "@/services/storage.local";
import { HabitAppContext, type HabitAppContextValue } from "./habitContext";

type Frequency = "daily" | "weekly" | "monthly";

type CreateHabitInput = {
  id?: string;
  name: string;
  frequency?: Frequency;
  categoryId?: string;
  priority?: Priority;
  description?: string;
  daysOfWeek?: number[];
  dayOfMonth?: number;
};

type CreateGoalInput = {
  id?: string;
  name: string;
  habitIds: string[];
  priority?: Priority;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
};

// context/type moved to habitContext.ts to keep Fast Refresh happy

export const HabitAppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const repoRef = useRef<InMemoryHabitRepository>();
  const notifierRef = useRef<NotificationService>();
  const managerRef = useRef<HabitManager>();
  const storageRef = useRef<LocalStorageStorage>();

  const [rev, setRev] = useState(0);
  const bump = () => setRev((r) => r + 1);

  // Initialize singletons once
  if (!repoRef.current) {
    repoRef.current = new InMemoryHabitRepository();
    notifierRef.current = new NotificationService();
    managerRef.current = new HabitManager(repoRef.current, notifierRef.current);
    storageRef.current = new LocalStorageStorage();
  }

  const repo = repoRef.current!;
  const manager = managerRef.current!;
  const storage = storageRef.current!;

  // Load snapshot from localStorage on mount
  useEffect(() => {
    storage.loadInto(manager, repo);
    bump();
    // we intentionally run only once on mount with stable refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSnapshot = () => {
    storage.saveFrom(manager, repo);
  };

  // Notes de complétion: clé locale séparée
  const COMPLETION_NOTES_KEY = "habit.app.completionNotes";
  const notesRef = useRef<Record<string, string>>();
  if (!notesRef.current) {
    try {
      const raw = localStorage.getItem(COMPLETION_NOTES_KEY);
      notesRef.current = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    } catch {
      notesRef.current = {};
    }
  }
  const saveNotes = () => {
    try {
      localStorage.setItem(COMPLETION_NOTES_KEY, JSON.stringify(notesRef.current ?? {}));
    } catch (e) {
      console.warn("[HabitApp] saveNotes failed", e);
    }
  };
  const noteKey = (habitId: string, dateISO: string) => `${habitId}::${dateISO}`;
  const setCompletionNote = (habitId: string, dateISO: string, note: string) => {
    notesRef.current![noteKey(habitId, dateISO)] = note;
    saveNotes();
  };
  const getCompletionNote = (habitId: string, dateISO: string) => {
    return notesRef.current![noteKey(habitId, dateISO)];
  };

  const resetAll = () => {
    // 1) Purger les clés localStorage utilisées par l'app
    try {
      const keysToDelete: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        if (k.startsWith("habit.app.")) keysToDelete.push(k);
      }
      for (const k of keysToDelete) localStorage.removeItem(k);
    } catch (e) {
      console.error("[HabitApp] resetAll: localStorage purge failed", e);
    }

    // 2) Réinstancier repo/manager pour un état neuf
    repoRef.current = new InMemoryHabitRepository();
    notifierRef.current = new NotificationService();
    managerRef.current = new HabitManager(repoRef.current, notifierRef.current);
    storageRef.current = new LocalStorageStorage();

    // 3) Sauvegarder un snapshot vide et rafraîchir l'UI
    storageRef.current.saveFrom(managerRef.current, repoRef.current);
    setRev((r) => r + 1);
  };

  const addCategory = (name: string, id?: string, description?: string) => {
    const category = new Category(id ?? crypto.randomUUID(), name, description);
    manager.addCategory(category);
    saveSnapshot();
    bump();
    return category;
  };

  const createHabit = (input: CreateHabitInput) => {
    const category = input.categoryId
      ? manager.getAllCategories().find((c) => c.id === input.categoryId)
      : undefined;
    const habit = manager.createHabit({
      id: input.id ?? crypto.randomUUID(),
      name: input.name,
      frequency: input.frequency ?? "daily",
      category,
      priority: input.priority ?? Priority.Medium,
      description: input.description,
    });
    if (input.daysOfWeek && habit.setDaysOfWeek)
      habit.setDaysOfWeek(input.daysOfWeek);
    if (input.dayOfMonth && habit.setDayOfMonth)
      habit.setDayOfMonth(input.dayOfMonth);
    saveSnapshot();
    bump();
    return habit;
  };

  const toggleHabitToday = (habitId: string) => {
    const todayISO = new Date().toISOString().slice(0, 10);
    const habit = manager.getHabit(habitId);
    if (!habit) return;
    habit.toggleCompleted(todayISO);
    saveSnapshot();
    bump();
  };

  const addGoal = (input: CreateGoalInput) => {
    const habits: Habit[] = [];
    for (const id of input.habitIds) {
      const h = manager.getHabit(id);
      if (h) habits.push(h);
    }
    const goal = new GoalSmart(
      input.id ?? crypto.randomUUID(),
      input.name,
      habits,
      input.priority ?? Priority.Medium,
      input.description,
      input.dueDate
    );
    manager.addGoal(goal);
    saveSnapshot();
    bump();
    return goal;
  };

  const removeGoal = (goalId: string) => {
    // Simple remove by replacing the internal list (if API supports direct remove, use it)
    const all = manager.getAllGoals();
    const keep = all.filter((g) => g.id !== goalId);
    // Manager may not have a clear API to set all, so recreate manager state for goals only
    // Fallback: clear goals by reloading snapshot without goals.
    // Simpler: save snapshot excluding target and reload.
    const categories = manager.getAllCategories();
    const habits = manager.getAllHabits({ includeArchived: true });
    // Rebuild manager
    repoRef.current = new InMemoryHabitRepository();
    notifierRef.current = new NotificationService();
    managerRef.current = new HabitManager(repoRef.current, notifierRef.current);
    const mgr = managerRef.current;
    // re-add categories
    for (const c of categories)
      mgr.addCategory(
        new Category(
          c.id,
          c.name,
          (c as unknown as { description?: string }).description
        )
      );
    // re-add habits and their states
    const catsMap = new Map(manager.getAllCategories().map((c) => [c.id, c]));
    for (const h of habits) {
      const nh = mgr.createHabit({
        id: h.id,
        name: h.name,
        frequency: h.frequency as Frequency,
        category: h.category?.id ? catsMap.get(h.category.id) : undefined,
        priority: h.priority,
        description: (h as unknown as { description?: string }).description,
      });
      if (
        (h as unknown as { daysOfWeek?: number[] }).daysOfWeek &&
        nh.setDaysOfWeek
      )
        nh.setDaysOfWeek(
          (h as unknown as { daysOfWeek?: number[] }).daysOfWeek!
        );
      if (
        (h as unknown as { dayOfMonth?: number }).dayOfMonth &&
        nh.setDayOfMonth
      )
        nh.setDayOfMonth((h as unknown as { dayOfMonth?: number }).dayOfMonth!);
      for (const d of h.getCompletionHistory?.() ?? []) nh.markAsCompleted(d);
    }
    // re-add filtered goals
    for (const g of keep) {
      mgr.addGoal(
        new GoalSmart(
          g.id,
          g.name,
          g.getHabits?.() ?? [],
          g.priority,
          (g as unknown as { description?: string }).description,
          (g as unknown as { dueDate?: string }).dueDate
        )
      );
    }
    storageRef.current = new LocalStorageStorage();
    storageRef.current.saveFrom(managerRef.current, repoRef.current);
    bump();
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) return "denied";
    const perm = await Notification.requestPermission();
    return perm;
  };

  const sendReminders = () => {
    // Use library reminders (console), and additionally push browser notifications for due today
    manager.sendReminders();
    const todayISO = new Date().toISOString().slice(0, 10);
    const dueToday = manager
      .getAllHabits()
      .filter((h) => h.isDueOn(todayISO) && !h.isCompletedOn(todayISO));
    if ("Notification" in window && Notification.permission === "granted") {
      for (const h of dueToday) {
        new Notification("Rappel habitude", {
          body: `${h.name} [${
            h.category?.name ?? "Sans catégorie"
          }] est due aujourd'hui`,
        });
      }
    }
  };

  const value: HabitAppContextValue = useMemo(
    () => ({
      repo,
      manager,
      storage,
      categories: manager.getAllCategories(),
      habits: manager.getAllHabits(),
      goals: manager.getAllGoals(),
      addCategory,
      createHabit,
      toggleHabitToday,
      addGoal,
      removeGoal,
      saveSnapshot,
      requestNotifications,
  sendReminders,
  resetAll,
  setCompletionNote,
  getCompletionNote,
    }),
    // Recompute whenever we bump state
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [repo, manager, storage, rev]
  );

  return (
    <HabitAppContext.Provider value={value}>
      {children}
    </HabitAppContext.Provider>
  );
};

export { Priority };
