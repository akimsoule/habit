/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncStorage from '@react-native-async-storage/async-storage';

// Legacy local helpers kept only if some code still imports this file.
// Prefer using AsyncStorageService (snapshot-based) instead.
export class StorageService {
  static readonly KEY_HABITS = '@habits';
  static readonly KEY_CATEGORIES = '@categories';
  static readonly KEY_GOALS = '@goals';

  async saveHabits(habits: any[]): Promise<void> {
    try {
  await AsyncStorage.setItem(StorageService.KEY_HABITS, JSON.stringify(habits));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des habitudes:', error);
    }
  }

  async saveCategories(categories: any[]): Promise<void> {
    try {
  await AsyncStorage.setItem(StorageService.KEY_CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des catégories:', error);
    }
  }

  async saveGoals(goals: any[]): Promise<void> {
    try {
  await AsyncStorage.setItem(StorageService.KEY_GOALS, JSON.stringify(goals));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des objectifs:', error);
    }
  }

  async loadHabits(): Promise<any[]> {
    try {
  const data = await AsyncStorage.getItem(StorageService.KEY_HABITS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erreur lors du chargement des habitudes:', error);
      return [];
    }
  }

  async loadCategories(): Promise<any[]> {
    try {
  const data = await AsyncStorage.getItem(StorageService.KEY_CATEGORIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      return [];
    }
  }

  async loadGoals(): Promise<any[]> {
    try {
  const data = await AsyncStorage.getItem(StorageService.KEY_GOALS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erreur lors du chargement des objectifs:', error);
      return [];
    }
  }
}