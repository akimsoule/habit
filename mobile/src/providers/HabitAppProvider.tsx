import { useState, useCallback, useEffect, useMemo } from "react";
import {
  HabitManager,
  Category,
  Habit,
  GoalSmart,
  Priority,
  StorageHelper,
} from "habit.app";
import {
  AsyncStorageService,
  Snapshot,
} from "../services/async-storage.service";
import { NotificationService } from "../services/notification.service";
import { HabitAppContext } from "./habitContext";
import { InMemoryHabitRepository } from "habit.app";
import { errorService } from "../services/error.service";

export function HabitAppProvider({ children }: { children: React.ReactNode }) {
  const [storage] = useState(() => new AsyncStorageService());
  const [notifications] = useState(() => new NotificationService());
  const [repo] = useState(() => new InMemoryHabitRepository());
  const [manager] = useState(() => new HabitManager(repo, notifications));

  const [categories, setCategories] = useState<Category[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<GoalSmart[]>([]);

  const updateState = useCallback(() => {
    setCategories(manager.getAllCategories());
    setHabits(manager.getAllHabits());
    setGoals(manager.getAllGoals());
  }, [manager]);

  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      try {
        const snapshot = await storage.loadSnapshot();
        if (snapshot) {
          // Restaurer via l'utilitaire de la lib
          StorageHelper.fromSnapshot(snapshot, manager, repo);
        }
        updateState();
      } catch (error) {
        errorService.log('error', "Erreur lors du chargement des données", error as Error, {
          component: 'HabitAppProvider',
          action: 'loadData'
        });
      }
    };

    loadData();
  }, [manager, storage, updateState, repo]);

  const saveSnapshot = async () => {
    try {
      const snapshot = StorageHelper.toSnapshot(manager, repo);
      await storage.saveSnapshot(snapshot);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des données:", error);
    }
  };

  const resetAll = async () => {
    try {
      // Snapshot vide puis restauration en mémoire
      const empty: Snapshot = { categories: [], habits: [], goals: [] };
      await storage.saveSnapshot(empty);
      StorageHelper.fromSnapshot(empty, manager, repo);
      updateState();
    } catch (e) {
      console.error("Erreur resetAll:", e);
    }
  };

  const addCategory = async (
    name: string,
    id?: string,
    description?: string
  ) => {
    const category = new Category(id || name, name, description);
    manager.addCategory(category);
    updateState();
    await saveSnapshot();
    return category;
  };

  const createHabit = async (input: {
    id?: string;
    name: string;
    frequency?: "daily" | "weekly" | "monthly";
    categoryId?: string;
    priority?: "low" | "medium" | "high";
    description?: string;
    daysOfWeek?: number[];
    dayOfMonth?: number;
  }) => {
    const category = input.categoryId
      ? manager.getAllCategories().find((c) => c.id === input.categoryId)
      : undefined;
    const habit = manager.createHabit({
      id: input.id || input.name,
      name: input.name,
      frequency: input.frequency,
      category,
      priority:
        input.priority === "high"
          ? Priority.High
          : input.priority === "medium"
          ? Priority.Medium
          : Priority.Low,
      description: input.description,
    });

    if (input.daysOfWeek && input.frequency === "weekly") {
      habit.setDaysOfWeek(input.daysOfWeek);
    }
    if (input.dayOfMonth && input.frequency === "monthly") {
      habit.setDayOfMonth(input.dayOfMonth);
    }

    updateState();
    await saveSnapshot();
    return habit;
  };

  const toggleHabitToday = async (habitId: string) => {
    const habit = manager.getHabit(habitId);
    if (habit) {
      const today = new Date().toISOString().split("T")[0];
      if (habit.isCompletedOn(today)) {
        habit.unmarkAsCompleted(today);
      } else {
        habit.markAsCompleted(today);
      }
      updateState();
      await saveSnapshot();
    }
  };

  const addGoal = async (input: {
    id?: string;
    name: string;
    habitIds: string[];
    priority?: "low" | "medium" | "high";
    description?: string;
    dueDate?: string;
  }) => {
    const habits = input.habitIds
      .map((id) => manager.getHabit(id))
      .filter((h): h is Habit => h !== undefined);

    const goal = new GoalSmart(
      input.id || input.name,
      input.name,
      habits,
      input.priority === "high"
        ? Priority.High
        : input.priority === "medium"
        ? Priority.Medium
        : Priority.Low,
      input.description,
      input.dueDate
    );
    manager.addGoal(goal);
    updateState();
    await saveSnapshot();
    return goal;
  };

  const removeGoal = async (goalId: string) => {
    const goal = manager.getAllGoals().find((g) => g.id === goalId);
    if (goal) {
      const habits = goal.getHabits();
      habits.forEach((habit) => goal.removeHabit(habit.id));
      updateState();
      await saveSnapshot();
    }
  };

  const requestNotifications = async () => {
    // Nous utiliserons les notifications natives plus tard
    return Promise.resolve(true);
  };

  const defaultCategory = useMemo(
    () => new Category("default", "Aucune catégorie", ""),
    []
  );

  const setHabitCategory = async (habitId: string, categoryId?: string) => {
    const habit = manager.getHabit(habitId);
    let category = categoryId
      ? manager.getAllCategories().find((c) => c.id === categoryId)
      : null;

    if (habit) {
      if (!category) {
        category = defaultCategory;
      }
      habit.category = category;
      updateState();
      await saveSnapshot();
    }
  };

  const addHabitToGoal = async (goalId: string, habitId: string) => {
    const goal = manager.getAllGoals().find((g) => g.id === goalId);
    const habit = manager.getHabit(habitId);
    if (goal && habit && !goal.getHabits().includes(habit)) {
      goal.addHabit(habit);
      updateState();
      await saveSnapshot();
    }
  };

  const renameHabit = async (habitId: string, name: string) => {
    const habit = manager.getHabit(habitId);
    if (habit) {
      // Mettre à jour le nom
      habit.name = name;
      updateState();
      await saveSnapshot();
    }
  };

  const setHabitDescription = async (habitId: string, description?: string) => {
    const habit = manager.getHabit(habitId);
    if (habit) {
      // Mettre à jour la description
      habit.description = description || "";
      updateState();
      await saveSnapshot();
    }
  };

  // --- ARCHIVE ET SUPPRESSION ---
  const archiveHabit = async (habitId: string) => {
    const habit = manager.getHabit(habitId);
    if (habit) {
      habit.archived = true;
      updateState();
      await saveSnapshot();
    }
  };

  const removeHabit = async (habitId: string) => {
    const habit = manager.getHabit(habitId);
    if (habit) {
      manager.removeHabit(habitId);
      updateState();
      await saveSnapshot();
    }
  };

  return (
    <HabitAppContext.Provider
      value={{
        repo,
        manager,
        storage,
        notifications,
        categories,
        habits,
        goals,
        addCategory,
        createHabit,
        toggleHabitToday,
        addGoal,
        removeGoal,
        saveSnapshot,
        requestNotifications,
        setHabitCategory,
        addHabitToGoal,
        renameHabit,
        setHabitDescription,
        resetAll,
        archiveHabit,
        removeHabit,
      }}
    >
      {children}
    </HabitAppContext.Provider>
  );
}
