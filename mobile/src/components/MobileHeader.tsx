import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../providers/useTheme";

type Props = {
  onPressBolt?: () => void;
  onPressSun?: () => void;
  onPressUser?: () => void;
};

export const MobileHeader: React.FC<Props> = ({
  onPressBolt,
  onPressSun,
  onPressUser,
}) => {
  const { colors, toggleTheme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.left}>
        <View style={[styles.logoCircle, { backgroundColor: "#eef2ff" }]}>
          <Ionicons name="checkbox-outline" size={18} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Rituos</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onPressBolt}
          style={styles.iconBtn}
          accessibilityLabel="Actions rapides"
        >
          <Ionicons name="flash-outline" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onPressSun ?? toggleTheme}
          style={styles.iconBtn}
          accessibilityLabel="Basculer le thème"
        >
          <Ionicons name="sunny-outline" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onPressUser}
          style={styles.iconBtn}
          accessibilityLabel="Profil"
        >
          <Ionicons name="person-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 8,
  },
  left: { flexDirection: "row", alignItems: "center" },
  logoCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  title: { fontSize: 20, fontWeight: "700" },
  actions: { flexDirection: "row", alignItems: "center" },
  iconBtn: {
    padding: 6,
    marginLeft: 6,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
});
