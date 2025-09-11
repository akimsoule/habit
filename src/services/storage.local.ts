// Simple LocalStorage-based snapshot storage compatible with habit.app DTOs
// It mirrors JsonStorage.loadInto/saveFrom but uses browser localStorage.
import {
  Category,
  GoalSmart,
  Habit,
  Priority,
  InMemoryHabitRepository,
  HabitManager,
} from "habit.app";

type CategoryDTO = { id: string; name: string; description?: string };
type HabitDTO = {
  id: string;
  name: string;
  frequency: "daily" | "weekly" | "monthly";
  categoryId?: string;
  priority: number;
  archived: boolean;
  completedDates: string[];
  daysOfWeek?: number[];
  dayOfMonth?: number;
  description?: string;
};
type GoalDTO = {
  id: string;
  name: string;
  priority: number;
  habitIds: string[];
  dueDate?: string;
  description?: string;
};

type Snapshot = {
  categories: CategoryDTO[];
  habits: HabitDTO[];
  goals: GoalDTO[];
};

const STORAGE_KEY = "habit.app.snapshot";

export class LocalStorageStorage {
  private key: string;
  constructor(key: string = STORAGE_KEY) {
    this.key = key;
  }

  loadInto(manager: HabitManager, repo: InMemoryHabitRepository) {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return;
      const snap: Snapshot = JSON.parse(raw);

      // Categories
      const categories = new Map<string, Category>();
      for (const c of snap.categories || []) {
        const cat = new Category(c.id, c.name, c.description);
        manager.addCategory(cat);
        categories.set(cat.id, cat);
      }

      // Habits
      const habitsById = new Map<string, Habit>();
      for (const h of snap.habits || []) {
        const cat = h.categoryId ? categories.get(h.categoryId) : undefined;
        const habit = manager.createHabit({
          id: h.id,
          name: h.name,
          frequency: h.frequency,
          category: cat,
          priority: (h.priority as unknown as Priority) ?? Priority.Medium,
          description: h.description,
        });
        if (h.daysOfWeek) habit.setDaysOfWeek?.(h.daysOfWeek);
        if (h.dayOfMonth) habit.setDayOfMonth?.(h.dayOfMonth);
        if (h.archived) manager.archiveHabit?.(h.id);
        // restore completions
        for (const d of h.completedDates || []) habit.markAsCompleted(d);
        habitsById.set(habit.id, habit);
      }

      // Goals
      for (const g of snap.goals || []) {
        const goalHabits: Habit[] = [];
        for (const id of g.habitIds || []) {
          const h = habitsById.get(id);
          if (h) goalHabits.push(h);
        }
        const goal = new GoalSmart(
          g.id,
          g.name,
          goalHabits,
          (g.priority as unknown as Priority) ?? Priority.Medium,
          g.description,
          g.dueDate
        );
        manager.addGoal(goal);
      }
    } catch (e) {
      console.error("[LocalStorageStorage] loadInto failed", e);
    }
  }

  saveFrom(manager: HabitManager, repo: InMemoryHabitRepository) {
    try {
      type CategoryIntrospect = { description?: string };
      const cats = manager.getAllCategories().map<CategoryDTO>((c) => ({
        id: c.id,
        name: c.name,
        description: (c as unknown as CategoryIntrospect).description,
      }));

      type HabitIntrospect = {
        archived?: boolean;
        daysOfWeek?: number[];
        dayOfMonth?: number;
        description?: string;
      };
      const habits = manager
        .getAllHabits({ includeArchived: true })
        .map<HabitDTO>((h) => ({
          id: h.id,
          name: h.name,
          frequency: h.frequency as HabitDTO["frequency"],
          categoryId: h.category?.id,
          priority: h.priority as unknown as number,
          archived: (h as unknown as HabitIntrospect).archived ?? false,
          completedDates: h.getCompletionHistory?.() ?? [],
          daysOfWeek: (h as unknown as HabitIntrospect).daysOfWeek,
          dayOfMonth: (h as unknown as HabitIntrospect).dayOfMonth,
          description: (h as unknown as HabitIntrospect).description,
        }));

      type GoalIntrospect = { dueDate?: string; description?: string };
      const goals = manager.getAllGoals().map<GoalDTO>((g) => ({
        id: g.id,
        name: g.name,
        priority: g.priority as unknown as number,
        habitIds: g.getHabits?.().map((h: Habit) => h.id) ?? [],
        dueDate: (g as unknown as GoalIntrospect).dueDate,
        description: (g as unknown as GoalIntrospect).description,
      }));

      const snap: Snapshot = { categories: cats, habits, goals };
      localStorage.setItem(this.key, JSON.stringify(snap));
    } catch (e) {
      console.error("[LocalStorageStorage] saveFrom failed", e);
    }
  }
}
