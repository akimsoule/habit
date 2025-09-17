import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "../providers/useTheme";
import { useHabitApp } from "../providers/useHabitApp";
import { useToast } from "../providers/useToast";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export const AddCategoryModal: React.FC<Props> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { addCategory } = useHabitApp();
  const { show } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!visible) {
      setName("");
      setDescription("");
    }
  }, [visible]);

  const onCreate = async () => {
    const n = name.trim();
    if (!n) return;
    await addCategory(n, undefined, description.trim() || undefined);
    show("Catégorie créée", { type: "success" });
    onClose();
  };

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
              Nouvelle catégorie
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 20, color: colors.muted }}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <Text style={[styles.label, { color: colors.text }]}>Nom</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: colors.muted + "55", color: colors.text },
              ]}
              placeholder="Ex: Santé"
              value={name}
              onChangeText={setName}
            />

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
              placeholder="Quelques détails..."
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>
          <View
            style={[styles.footer, { borderTopColor: colors.muted + "33" }]}
          >
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.muted + "22" }]}
              onPress={onClose}
            >
              <Text style={[styles.btnText, { color: colors.text }]}>
                Annuler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btn,
                {
                  backgroundColor: colors.primary,
                  opacity: name.trim() ? 1 : 0.5,
                },
              ]}
              disabled={!name.trim()}
              onPress={onCreate}
            >
              <Text style={[styles.btnText, { color: "#fff" }]}>Ajouter</Text>
            </TouchableOpacity>
          </View>
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
  footer: { flexDirection: "row", gap: 8, padding: 16, borderTopWidth: 1 },
  btn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  btnText: { fontWeight: "600" },
});
