import { useContext } from 'react';
import { HabitAppContext } from '../providers/habitContext';

export function useHabitApp() {
  const context = useContext(HabitAppContext);
  if (!context) {
    throw new Error('useHabitApp doit être utilisé dans un HabitAppProvider');
  }
  return context;
}