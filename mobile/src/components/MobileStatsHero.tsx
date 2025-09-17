import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useHabitApp } from "../providers/useHabitApp";
import { useWebLikeStats } from "./useWebLikeStats";
import { useTheme } from "../providers/useTheme";

export const MobileStatsHero: React.FC = () => {
  const { habits } = useHabitApp();
  const { dueCount, doneCount, xpTotal, level, levelPct, xpRemaining } =
    useWebLikeStats();
  const { colors } = useTheme();

  const todayPct = useMemo(
    () => (dueCount > 0 ? Math.round((doneCount / dueCount) * 100) : 0),
    [dueCount, doneCount]
  );

  return (
    <View style={[styles.card, { backgroundColor: colors.primary }]}>
      <View style={styles.row}>
        <Text style={styles.level}>Niv. {level}</Text>
        <Text style={styles.xp}>{xpTotal} XP</Text>
      </View>
      <Text style={styles.percent}>
        {levelPct}% · {xpRemaining} XP restants
      </Text>
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${levelPct}%` }]} />
      </View>
      <View style={styles.pillRow}>
        <Text style={styles.pill}>Aujourd'hui</Text>
        <Text style={styles.counter}>
          {doneCount}/{dueCount}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  level: { color: "white", fontWeight: "700" },
  xp: { color: "white", fontWeight: "700" },
  percent: { color: "white", opacity: 0.95, marginBottom: 8 },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progress: { height: "100%", backgroundColor: "white" },
  pillRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  pill: {
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "white",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 8,
    fontWeight: "600",
  },
  counter: { color: "white", fontWeight: "700" },
});
