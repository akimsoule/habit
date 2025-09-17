import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { useHabitApp } from "../providers/useHabitApp";
import { HabitCard } from "./HabitCard";
import { AddHabitModal } from "./AddHabitModal";
import { AddCategoryModal } from "./AddCategoryModal";
import { AddGoalModal } from "./AddGoalModal";
import { Priority } from "habit.app";
import { MobileStatsHero } from "./MobileStatsHero";
import { MobileStatsOverview } from "./MobileStatsOverview";
import { MobileHeader } from "./MobileHeader";
import { SegmentedControl } from "./SegmentedControl";
import { useTheme } from "../providers/useTheme";
import { QuickActionsDrawer } from "./QuickActionsDrawer";
import { NotificationService } from "../services/notification.service";
import { useToast } from "../providers/useToast";

export function HomeScreen() {
  const { habits, goals, resetAll } = useHabitApp();
  const { colors } = useTheme();
  const { show } = useToast();
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [filter, setFilter] = useState<"all" | "today">("today");
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [defaultHabitCategoryId, setDefaultHabitCategoryId] = useState<
    string | undefined
  >(undefined);

  const today = new Date().toISOString().split("T")[0];
  const dueHabits = habits.filter((h) => h.isDueOn(today));
  const otherHabits = habits.filter((h) => !h.isDueOn(today));

  const todayProgress =
    dueHabits.length > 0
      ? dueHabits.reduce((acc, h) => acc + h.getProgress(today, today), 0) /
        dueHabits.length
      : 0;

  const urgentGoal = goals
    .filter((g) => g.dueDate && g.dueDate >= today)
    .sort((a, b) => {
      if (a.priority === b.priority) {
        return (a.dueDate || "").localeCompare(b.dueDate || "");
      }
      return b.priority === Priority.High
        ? 1
        : b.priority === Priority.Medium
        ? 0
        : -1;
    })[0];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header brandé */}
      <MobileHeader
        onPressBolt={() => setShowQuickActions(true)}
        onPressSun={undefined}
      />

      {/* En-tête avec les stats du jour */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>Aujourd'hui</Text>
        <MobileStatsHero />
        <MobileStatsOverview />
        <SegmentedControl value={filter} onChange={setFilter} />

        {urgentGoal && (
          <View
            style={[
              styles.statsCard,
              styles.goalCard,
              { backgroundColor: colors.card },
            ]}
          >
            <Text style={[styles.statsTitle, { color: colors.text }]}>
              Objectif prioritaire
            </Text>
            <Text style={[styles.goalName, { color: colors.text }]}>
              {urgentGoal.name}
            </Text>
            <Text style={[styles.goalDueDate, { color: colors.muted }]}>
              Échéance :{" "}
              {new Date(urgentGoal.dueDate!).toLocaleDateString("fr-FR")}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progress,
                  { width: `${urgentGoal.getProgress(today) * 100}%` },
                ]}
              />
            </View>
          </View>
        )}
      </View>

      {/* Liste des habitudes */}
      <FlatList
        data={filter === "today" ? dueHabits : [...dueHabits, ...otherHabits]}
        renderItem={({ item: habit }) => <HabitCard habit={habit} />}
        keyExtractor={(habit) => habit.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />

      {/* Bouton d'ajout */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setAddModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal d'ajout */}
      <AddHabitModal
        visible={isAddModalVisible}
        onClose={() => {
          setAddModalVisible(false);
          setDefaultHabitCategoryId(undefined);
        }}
        defaultCategoryId={defaultHabitCategoryId}
      />

      <AddCategoryModal
        visible={showAddCategory}
        onClose={() => setShowAddCategory(false)}
      />

      <AddGoalModal
        visible={showAddGoal}
        onClose={() => setShowAddGoal(false)}
      />

      <QuickActionsDrawer
        visible={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        onCreateCategory={() => {
          setShowQuickActions(false);
          setShowAddCategory(true);
        }}
        onCreateHabit={(categoryId) => {
          setShowQuickActions(false);
          setDefaultHabitCategoryId(categoryId);
          setAddModalVisible(true);
        }}
        onCreateGoal={() => {
          setShowQuickActions(false);
          setShowAddGoal(true);
        }}
        onRequestNotifications={async () => {
          const svc = new NotificationService();
          await svc.requestPermissions();
        }}
        onSendReminders={async (times, activeDays, sendOnLoad) => {
          const svc = new NotificationService();
          await svc.requestPermissions();
          const today = new Date();
          for (const h of habits) {
            // Programmer uniquement sur jours actifs
            for (const t of times) {
              const [HH, mm] = t.split(":").map((x) => parseInt(x, 10));
              const d = new Date(today);
              d.setHours(HH, mm, 0, 0);
              if (activeDays.includes(d.getDay())) {
                await svc.scheduleHabitReminder(h.id, h.name, d);
              }
            }
          }
          if (sendOnLoad) {
            // Optionnel: notification immédiate d’info
            console.log("Rappels programmés au chargement");
          }
        }}
        onResetAll={async () => {
          Alert.alert(
            "Réinitialiser toutes les données ?",
            "Cette action va supprimer définitivement vos catégories, habitudes et objectifs.",
            [
              { text: "Annuler", style: "cancel" },
              {
                text: "Oui, réinitialiser",
                style: "destructive",
                onPress: async () => {
                  await resetAll();
                  setShowQuickActions(false);
                  show("Données réinitialisées", { type: "success" });
                },
              },
            ]
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  // stats cards now moved to components
  goalName: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 4,
  },
  goalDueDate: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    overflow: "hidden",
  },
  progress: {
    height: "100%",
    backgroundColor: "#22c55e",
  },
  statsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  goalCard: {
    backgroundColor: "#fffbeb",
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#111827",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 80, // Espace pour le FAB
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 24,
    color: "#fff",
  },
});
