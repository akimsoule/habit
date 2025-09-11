import type {
  Category,
  GoalSmart,
  Habit,
  HabitManager,
  InMemoryHabitRepository,
  Priority,
} from "habit.app";
import React, { createContext, useContext } from "react";
import { LocalStorageStorage } from "@/services/storage.local";

export type HabitAppContextValue = {
  repo: InMemoryHabitRepository;
  manager: HabitManager;
  storage: LocalStorageStorage;
  categories: Category[];
  habits: Habit[];
  goals: GoalSmart[];
  addCategory: (name: string, id?: string, description?: string) => Category;
  createHabit: (input: {
    id?: string;
    name: string;
    frequency?: "daily" | "weekly" | "monthly";
    categoryId?: string;
    priority?: Priority;
    description?: string;
    daysOfWeek?: number[];
    dayOfMonth?: number;
  }) => Habit;
  toggleHabitToday: (habitId: string) => void;
  addGoal: (input: {
    id?: string;
    name: string;
    habitIds: string[];
    priority?: Priority;
    description?: string;
    dueDate?: string;
  }) => GoalSmart;
  removeGoal: (goalId: string) => void;
  saveSnapshot: () => void;
  requestNotifications: () => Promise<NotificationPermission>;
  sendReminders: () => void;
  /** Assigne ou change la catégorie d'une habitude existante */
  setHabitCategory: (habitId: string, categoryId?: string) => void;
  /** Ajoute une habitude à un objectif existant */
  addHabitToGoal: (goalId: string, habitId: string) => void;
  /** Renomme une habitude */
  renameHabit: (habitId: string, name: string) => void;
  /** Met à jour la description d'une habitude */
  setHabitDescription: (habitId: string, description?: string) => void;
  /** Définit les jours actifs pour une habitude hebdomadaire */
  setHabitWeeklyDays: (habitId: string, days: number[]) => void;
  /** Définit le jour du mois pour une habitude mensuelle */
  setHabitMonthlyDay: (habitId: string, day: number) => void;
  /** Archive une habitude */
  archiveHabit: (habitId: string) => void;
  /** Désarchive une habitude */
  unarchiveHabit: (habitId: string) => void;
  /** Supprime une habitude (et la retire des objectifs) */
  removeHabit: (habitId: string) => void;
  /** Calcule la prochaine date disponible (due) à partir d'une date de référence (incluant le lendemain) */
  nextAvailableDate: (habitId: string, fromISO?: string) => string | undefined;
  /**
   * Réinitialise toutes les données de l'application stockées en local.
   * Supprime les clés localStorage commençant par "habit.app." et
   * réinitialise le repository/manager en mémoire.
   */
  resetAll: () => void;
  /** Enregistre une note pour une complétion (par date ISO YYYY-MM-DD). */
  setCompletionNote: (habitId: string, dateISO: string, note: string) => void;
  /** Récupère la note de complétion (ou undefined). */
  getCompletionNote: (habitId: string, dateISO: string) => string | undefined;
};

export const HabitAppContext = createContext<HabitAppContextValue | null>(null);

export const useHabitApp = () => {
  const ctx = useContext(HabitAppContext);
  if (!ctx) throw new Error("useHabitApp must be used within HabitAppProvider");
  return ctx;
};
