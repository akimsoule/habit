import { createContext } from 'react';
import { HabitManager, InMemoryHabitRepository, Category, GoalSmart, Habit } from 'habit.app';
import type { AsyncStorageService } from '../services/async-storage.service';
import type { NotificationService } from '../services/notification.service';

export type HabitAppContextValue = {
  repo: InMemoryHabitRepository;
  manager: HabitManager;
  storage: AsyncStorageService;
  notifications: NotificationService;
  categories: Category[];
  habits: Habit[];
  goals: GoalSmart[];
  addCategory: (name: string, id?: string, description?: string) => Promise<Category>;
  createHabit: (input: {
    id?: string;
    name: string;
    frequency?: 'daily' | 'weekly' | 'monthly';
    categoryId?: string;
    priority?: 'low' | 'medium' | 'high';
    description?: string;
    daysOfWeek?: number[];
    dayOfMonth?: number;
  }) => Promise<Habit>;
  toggleHabitToday: (habitId: string) => Promise<void>;
  addGoal: (input: {
    id?: string;
    name: string;
    habitIds: string[];
    priority?: 'low' | 'medium' | 'high';
    description?: string;
    dueDate?: string;
  }) => Promise<GoalSmart>;
  removeGoal: (goalId: string) => Promise<void>;
  saveSnapshot: () => Promise<void>;
  requestNotifications: () => Promise<boolean>;
  setHabitCategory: (habitId: string, categoryId?: string) => Promise<void>;
  addHabitToGoal: (goalId: string, habitId: string) => Promise<void>;
  renameHabit: (habitId: string, name: string) => Promise<void>;
  setHabitDescription: (habitId: string, description?: string) => Promise<void>;
  archiveHabit: (habitId: string) => Promise<void>;
  removeHabit: (habitId: string) => Promise<void>;
  resetAll: () => Promise<void>;
};

export const HabitAppContext = createContext<HabitAppContextValue | null>(null);