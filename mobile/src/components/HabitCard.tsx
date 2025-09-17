import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Habit } from "habit.app";
import { useHabitApp } from "../providers/useHabitApp";
import { useTheme } from "../providers/useTheme";
function HabitCardBase({ habit }: { habit: Habit }) {
  // Handlers pour chaque action du menu
  const { renameHabit, setHabitDescription } = useHabitApp();
  const [editModal, setEditModal] = useState<null | "name" | "desc">(null);
  const [editValue, setEditValue] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const handleRename = () => {
    setMenuVisible(false);
    setEditValue(habit.name);
    setEditModal("name");
  };
  const handleEditDescription = () => {
    setMenuVisible(false);
    setEditValue(habit.description || "");
    setEditModal("desc");
  };
  const handleEditSubmit = async () => {
    setEditLoading(true);
    if (editModal === "name") {
      await renameHabit(habit.id, editValue.trim());
    } else if (editModal === "desc") {
      await setHabitDescription(habit.id, editValue.trim());
    }
    setEditLoading(false);
    setEditModal(null);
  };
  const { archiveHabit, removeHabit } = useHabitApp();
  const handleArchive = async () => {
    setMenuVisible(false);
    await archiveHabit(habit.id);
  };
  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      "Supprimer cette habitude ?",
      "Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            await removeHabit(habit.id);
          },
        },
      ]
    );
  };
  const { toggleHabitToday } = useHabitApp();
  const { colors } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const progress = habit.getProgress(today, today);
  const isDueToday = habit.isDueOn(today);
  const isCompletedToday = habit.isCompletedOn(today);

  const handleToggle = async () => {
    await toggleHabitToday(habit.id);
  };
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, shadowColor: "#000" },
      ]}
    >
      <View style={styles.rowTop}>
        <Text style={[styles.title, { color: colors.text }]}>{habit.name}</Text>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="ellipsis-vertical" size={22} color={colors.muted} />
        </TouchableOpacity>
      </View>
      <View style={styles.rowProgress}>
        <Text style={[styles.progressLabel, { color: colors.muted }]}>
          Progression
        </Text>
        <Text style={[styles.progressPercent, { color: colors.muted }]}>
          {Math.round(progress * 100)}%
        </Text>
      </View>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progress,
            { width: `${progress * 100}%`, backgroundColor: colors.primary },
          ]}
        />
      </View>
      <View style={styles.goalBlock}>
        <Text style={[styles.goalLabel, { color: colors.muted }]}>
          Associer à un objectif
        </Text>
        <Text style={[styles.goalDesc, { color: colors.muted }]}>
          Aucun objectif — créez-en un depuis le tiroir d’actions.
        </Text>
      </View>
      <TouchableOpacity
        style={styles.doneBtnWeb}
        onPress={isCompletedToday ? undefined : handleToggle}
        disabled={isCompletedToday}
        activeOpacity={0.85}
      >
        <View style={styles.doneBtnContent}>
          <Ionicons
            name="add"
            size={22}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.doneBtnWebText}>Marquer fait</Text>
        </View>
      </TouchableOpacity>

      {/* Menu contextuel natif */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.menuModal, { backgroundColor: colors.card }]}>
            <Text style={styles.menuTitle}>Options</Text>
            <TouchableOpacity style={styles.menuItem} onPress={handleRename}>
              <Text style={{ color: colors.text }}>Renommer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleEditDescription}
            >
              <Text style={{ color: colors.text }}>
                Modifier la description
              </Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleArchive}>
              <Text style={{ color: colors.text }}>Archiver</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
              <Text style={{ color: "red" }}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Modal édition nom/description */}
      <Modal
        visible={!!editModal}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModal(null)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setEditModal(null)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Pressable
              style={[
                styles.menuModal,
                { backgroundColor: colors.card, minWidth: 280 },
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              <Text style={styles.menuTitle}>
                {editModal === "name"
                  ? "Renommer l’habitude"
                  : "Modifier la description"}
              </Text>
              <TextInput
                style={styles.input}
                value={editValue}
                onChangeText={setEditValue}
                placeholder={editModal === "name" ? "Nom..." : "Description..."}
                placeholderTextColor={colors.muted}
                editable={!editLoading}
                multiline={editModal === "desc"}
                autoFocus
              />
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {
                    marginTop: 12,
                    backgroundColor: colors.primary,
                    borderRadius: 8,
                    alignItems: "center",
                  },
                ]}
                onPress={handleEditSubmit}
                disabled={editLoading || !editValue.trim()}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {editLoading ? "Enregistrement..." : "Valider"}
                </Text>
              </TouchableOpacity>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
// --- Styles à la fin du fichier ---
export const HabitCard = React.memo(HabitCardBase);

const styles = StyleSheet.create({
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuModal: {
    minWidth: 220,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 0,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  menuTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#fff",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#222",
    marginVertical: 4,
    marginHorizontal: 12,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    marginVertical: 12,
    marginHorizontal: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    // Web fallback
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }
      : {}),
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  rowProgress: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: "500",
  },
  goalBlock: {
    marginTop: 20,
    marginBottom: 16,
  },
  goalLabel: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
  },
  goalDesc: {
    fontSize: 14,
    opacity: 0.7,
  },
  doneBtnWeb: {
    marginTop: 8,
    backgroundColor: "#4ade80",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#4ade80",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  doneBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtnWebText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
    letterSpacing: 0.2,
  },
  notDue: {
    opacity: 0.6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuBtn: {
    marginLeft: 8,
    padding: 4,
  },
  doneBtn: {
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#2563eb",
  },
  doneBtnDisabled: {
    backgroundColor: "#e5e7eb",
  },
  doneBtnText: {
    fontWeight: "700",
    fontSize: 16,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    overflow: "hidden",
  },
  progress: {
    height: "100%",
  },
  input: {
    backgroundColor: "#222",
    color: "#fff",
    fontSize: 16,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 10,
    minHeight: 44,
    marginHorizontal: 12,
  },
});
