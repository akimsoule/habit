import AsyncStorage from '@react-native-async-storage/async-storage';
import { Priority } from 'habit.app';

type CategoryDTO = {
  id: string;
  name: string;
  description?: string;
};

type HabitDTO = {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  categoryId: string;
  priority: Priority;
  archived: boolean;
  completedDates: string[];
  completionNotes?: Record<string, string>;
  daysOfWeek?: number[];
  dayOfMonth?: number;
};

type GoalDTO = {
  id: string;
  name: string;
  description?: string;
  priority: Priority;
  habitIds: string[];
  dueDate?: string;
};

export type Snapshot = {
  categories: CategoryDTO[];
  habits: HabitDTO[];
  goals: GoalDTO[];
};

export interface IStorageProvider {
  loadSnapshot(): Promise<Snapshot | null>;
  saveSnapshot(snapshot: Snapshot): Promise<void>;
}

export class AsyncStorageService implements IStorageProvider {
  private KEY_SNAPSHOT = '@habit_snapshot';

  async saveSnapshot(snapshot: Snapshot): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEY_SNAPSHOT, JSON.stringify(snapshot));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du snapshot:', error);
      throw error;
    }
  }

  async loadSnapshot(): Promise<Snapshot | null> {
    try {
      const data = await AsyncStorage.getItem(this.KEY_SNAPSHOT);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erreur lors du chargement du snapshot:', error);
      throw error;
    }
  }
}