import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Platform } from 'react-native';
import { Habit } from 'habit.app';

export class NotificationService {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      // Android ne nécessite pas de permission explicite
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  sendReminder(habit: Habit): void {
    // Programmer un rappel quotidien à 9h du matin par défaut
    const defaultTime = new Date();
    defaultTime.setHours(9, 0, 0, 0);
    this.scheduleHabitReminder(habit.id, habit.name, defaultTime);
  }

  async scheduleHabitReminder(habitId: string, habitName: string, time: Date) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Rappel d\'habitude',
        body: `N'oubliez pas : ${habitName}`,
        data: { habitId },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.CALENDAR,
        hour: time.getHours(),
        minute: time.getMinutes(),
        repeats: true,
      },
    });
  }

  async cancelHabitReminder(habitId: string) {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    const notification = notifications.find(
      n => n.content.data?.habitId === habitId
    );
    if (notification) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }

  setupNotificationHandler() {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
}