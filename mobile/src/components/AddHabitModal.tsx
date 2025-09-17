import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Priority } from "habit.app";
import { useHabitApp } from "../providers/useHabitApp";
import { useTheme } from "../providers/useTheme";
import { useToast } from "../providers/useToast";

interface Props {
  visible: boolean;
  onClose: () => void;
  defaultCategoryId?: string;
}

const DAYS: { label: string; value: number }[] = [
  { label: "Dim", value: 0 },
  { label: "Lun", value: 1 },
  { label: "Mar", value: 2 },
  { label: "Mer", value: 3 },
  { label: "Jeu", value: 4 },
  { label: "Ven", value: 5 },
  { label: "Sam", value: 6 },
];

export function AddHabitModal({ visible, onClose, defaultCategoryId }: Props) {
  const { categories, createHabit } = useHabitApp();
  const { colors } = useTheme();
  const { show } = useToast();

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1]); // default Monday
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);

  const frequencies = useMemo(
    () => [
      { label: "Quotidien", value: "daily" },
      { label: "Hebdomadaire", value: "weekly" },
      { label: "Mensuel", value: "monthly" },
    ],
    []
  );

  const priorities = useMemo(
    () => [
      { label: "Haute", value: Priority.High },
      { label: "Moyenne", value: Priority.Medium },
      { label: "Basse", value: Priority.Low },
    ],
    []
  );

  const monthDays = useMemo(
    () =>
      Array.from({ length: 31 }, (_, i) => ({
        label: `${i + 1}`,
        value: i + 1,
      })),
    []
  );

  const handleCreate = useCallback(async () => {
    if (!name) return;

    try {
      await createHabit({
        name,
        categoryId,
        frequency,
        priority:
          priority === Priority.High
            ? "high"
            : priority === Priority.Medium
            ? "medium"
            : "low",
        daysOfWeek: frequency === "weekly" ? daysOfWeek : undefined,
        dayOfMonth: frequency === "monthly" ? dayOfMonth : undefined,
      });

      setName("");
      setCategoryId(undefined);
      setFrequency("daily");
      setPriority(Priority.Medium);
      setDaysOfWeek([1]);
      setDayOfMonth(1);

      onClose();
      show("Habitude créée", { type: "success" });
    } catch (error) {
      console.error("Erreur lors de la création de l'habitude:", error);
    }
  }, [
    name,
    categoryId,
    frequency,
    priority,
    daysOfWeek,
    dayOfMonth,
    createHabit,
    onClose,
    show,
  ]);

  // Préselectionner la catégorie quand on ouvre la modale depuis le drawer
  React.useEffect(() => {
    if (visible) {
      setCategoryId(defaultCategoryId);
    }
  }, [visible, defaultCategoryId]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.modalContainer]}
      >
        <View style={[styles.modal, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Nouvelle habitude
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeButton, { color: colors.muted }]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={[styles.label, { color: colors.text }]}>Nom</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: colors.muted + "55", color: colors.text },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Nom de l'habitude"
            />

            <Text style={[styles.label, { color: colors.text }]}>
              Catégorie
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryList}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    { backgroundColor: colors.muted + "22" },
                    categoryId === category.id && styles.categoryButtonSelected,
                  ]}
                  onPress={() => setCategoryId(category.id)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      { color: colors.text },
                      categoryId === category.id &&
                        styles.categoryButtonTextSelected,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: colors.text }]}>
              Fréquence
            </Text>
            <View style={styles.frequencyButtons}>
              {frequencies.map((f) => (
                <TouchableOpacity
                  key={f.value}
                  style={[
                    styles.frequencyButton,
                    { backgroundColor: colors.muted + "22" },
                    frequency === f.value && styles.frequencyButtonSelected,
                  ]}
                  onPress={() => setFrequency(f.value as typeof frequency)}
                >
                  <Text
                    style={[
                      styles.frequencyButtonText,
                      { color: colors.text },
                      frequency === f.value &&
                        styles.frequencyButtonTextSelected,
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.text }]}>Priorité</Text>
            <View style={styles.priorityButtons}>
              {priorities.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  style={[
                    styles.priorityButton,
                    { backgroundColor: colors.muted + "22" },
                    priority === p.value && styles.priorityButtonSelected,
                  ]}
                  onPress={() => setPriority(p.value)}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      { color: colors.text },
                      priority === p.value && styles.priorityButtonTextSelected,
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {frequency === "weekly" && (
              <>
                <Text style={[styles.label, { color: colors.text }]}>
                  Jours de la semaine
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.daysOfWeekList}
                >
                  {DAYS.map((day) => (
                    <TouchableOpacity
                      key={day.value}
                      style={[
                        styles.dayButton,
                        { backgroundColor: colors.muted + "22" },
                        daysOfWeek.includes(day.value) &&
                          styles.dayButtonSelected,
                      ]}
                      onPress={() => {
                        if (daysOfWeek.includes(day.value)) {
                          setDaysOfWeek(
                            daysOfWeek.filter((d) => d !== day.value)
                          );
                        } else {
                          setDaysOfWeek([...daysOfWeek, day.value].sort());
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.dayButtonText,
                          { color: colors.text },
                          daysOfWeek.includes(day.value) &&
                            styles.dayButtonTextSelected,
                        ]}
                      >
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {frequency === "monthly" && (
              <>
                <Text style={[styles.label, { color: colors.text }]}>
                  Jour du mois
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.monthDaysList}
                >
                  {monthDays.map((day) => (
                    <TouchableOpacity
                      key={day.value}
                      style={[
                        styles.dayButton,
                        { backgroundColor: colors.muted + "22" },
                        dayOfMonth === day.value && styles.dayButtonSelected,
                      ]}
                      onPress={() => setDayOfMonth(day.value)}
                    >
                      <Text
                        style={[
                          styles.dayButtonText,
                          { color: colors.text },
                          dayOfMonth === day.value &&
                            styles.dayButtonTextSelected,
                        ]}
                      >
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </ScrollView>

          <View
            style={[styles.footer, { borderTopColor: colors.muted + "33" }]}
          >
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { backgroundColor: colors.muted + "22" },
              ]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                Annuler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.createButton,
                { backgroundColor: colors.primary },
                !name && styles.createButtonDisabled,
              ]}
              onPress={handleCreate}
              disabled={!name}
            >
              <Text
                style={[
                  styles.createButtonText,
                  !name && styles.createButtonTextDisabled,
                ]}
              >
                Créer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    fontSize: 20,
    color: "#6b7280",
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  categoryList: {
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  categoryButtonSelected: {
    backgroundColor: "#2563eb",
  },
  categoryButtonText: {
    color: "#374151",
  },
  categoryButtonTextSelected: {
    color: "#fff",
  },
  frequencyButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  frequencyButtonSelected: {
    backgroundColor: "#2563eb",
  },
  frequencyButtonText: {
    color: "#374151",
  },
  frequencyButtonTextSelected: {
    color: "#fff",
  },
  priorityButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  priorityButtonSelected: {
    backgroundColor: "#2563eb",
  },
  priorityButtonText: {
    color: "#374151",
  },
  priorityButtonTextSelected: {
    color: "#fff",
  },
  daysOfWeekList: {
    marginBottom: 8,
  },
  monthDaysList: {
    marginBottom: 8,
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  dayButtonSelected: {
    backgroundColor: "#2563eb",
  },
  dayButtonText: {
    color: "#374151",
  },
  dayButtonTextSelected: {
    color: "#fff",
  },
  footer: {
    flexDirection: "row",
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#374151",
    fontWeight: "500",
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#2563eb",
    alignItems: "center",
  },
  createButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  createButtonTextDisabled: {
    color: "#e5e7eb",
  },
});
