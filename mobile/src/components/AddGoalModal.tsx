import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useTheme } from "../providers/useTheme";
import { useHabitApp } from "../providers/useHabitApp";
import { Priority } from "habit.app";
import { useToast } from "../providers/useToast";

type Props = { visible: boolean; onClose: () => void };

export const AddGoalModal: React.FC<Props> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { habits, addGoal } = useHabitApp();
  const { show } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>(Priority.High);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!visible) {
      setName("");
      setDescription("");
      setDueDate("");
      setPriority(Priority.High);
      setSelected({});
    }
  }, [visible]);

  const selectedIds = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, v]) => v)
        .map(([id]) => id),
    [selected]
  );
  const canSubmit = name.trim().length > 0 && selectedIds.length > 0;

  const submit = async () => {
    if (!canSubmit) return;
    const priorityKey =
      priority === Priority.High
        ? "high"
        : priority === Priority.Medium
        ? "medium"
        : "low";
    await addGoal({
      name: name.trim(),
      habitIds: selectedIds,
      description: description || undefined,
      dueDate: dueDate || undefined,
      priority: priorityKey,
    });
    show("Objectif créé", { type: "success" });
    onClose();
  };

  const toKey = (p: Priority) =>
    p === Priority.High ? "Haute" : p === Priority.Medium ? "Moyenne" : "Basse";
  const nextPriority = () =>
    setPriority((p) =>
      p === Priority.High
        ? Priority.Medium
        : p === Priority.Medium
        ? Priority.Low
        : Priority.High
    );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View
            style={[styles.header, { borderBottomColor: colors.muted + "33" }]}
          >
            <Text style={[styles.title, { color: colors.text }]}>
              Créer un objectif SMART
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 20, color: colors.muted }}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={[styles.label, { color: colors.text }]}>Nom</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: colors.muted + "55", color: colors.text },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Ex: Obtenir une certification (2 ans)"
            />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Date butoir
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: colors.muted + "55", color: colors.text },
                  ]}
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder="AAAA-MM-JJ"
                />
              </View>
              <View style={{ width: 140 }}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Priorité
                </Text>
                <TouchableOpacity
                  onPress={nextPriority}
                  style={[styles.select, { borderColor: colors.muted + "55" }]}
                >
                  <Text style={{ color: colors.text }}>{toKey(priority)}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.label, { color: colors.text }]}>
              Description (optionnel)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.muted + "55",
                  color: colors.text,
                  height: 90,
                },
              ]}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text style={[styles.label, { color: colors.text }]}>
              Sélectionnez des habitudes
            </Text>
            <View
              style={[styles.listBox, { borderColor: colors.muted + "55" }]}
            >
              {habits.length === 0 && (
                <Text style={{ color: colors.muted, fontSize: 12, padding: 6 }}>
                  Aucune habitude — commencez par en créer une.
                </Text>
              )}
              {habits.map((h) => (
                <TouchableOpacity
                  key={h.id}
                  style={styles.row}
                  onPress={() =>
                    setSelected((s) => ({ ...s, [h.id]: !s[h.id] }))
                  }
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: colors.muted + "55",
                        backgroundColor: selected[h.id]
                          ? colors.primary
                          : "transparent",
                      },
                    ]}
                  />
                  <Text style={{ color: colors.text }}>{h.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ color: colors.muted, fontSize: 12 }}>
              {selectedIds.length} habitude(s) sélectionnée(s)
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 12,
              }}
            >
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.muted + "22" }]}
                onPress={onClose}
              >
                <Text style={{ color: colors.text, fontWeight: "600" }}>
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.btn,
                  {
                    backgroundColor: colors.primary,
                    opacity: canSubmit ? 1 : 0.5,
                  },
                ]}
                disabled={!canSubmit}
                onPress={submit}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Créer</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: "700" },
  content: { padding: 16 },
  label: { marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12 },
  select: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    justifyContent: "center",
  },
  listBox: { maxHeight: 240, borderWidth: 1, borderRadius: 10, padding: 6 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 4,
  },
  btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 },
});
