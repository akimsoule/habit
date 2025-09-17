import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Switch } from 'react-native';
import { useTheme } from '../providers/useTheme';
import { useHabitApp } from '../providers/useHabitApp';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreateCategory?: () => void;
  onCreateHabit?: (categoryId?: string) => void;
  onCreateGoal?: () => void;
  onRequestNotifications?: () => void;
  onSendReminders?: (times: string[], activeDays: number[], onLoad: boolean) => void;
  onResetAll?: () => void;
};

export const QuickActionsDrawer: React.FC<Props> = ({
  visible,
  onClose,
  onCreateCategory,
  onCreateHabit,
  onCreateGoal,
  onRequestNotifications,
  onSendReminders,
  onResetAll,
}) => {
  const { colors } = useTheme();
  const { categories } = useHabitApp();
  const [timeInput, setTimeInput] = useState('');
  const [times, setTimes] = useState<string[]>(['06:30']);
  const [activeDays, setActiveDays] = useState<Record<number, boolean>>({ 0:true, 1:true, 2:true, 3:true, 4:true, 5:true, 6:true });
  const [sendOnLoad, setSendOnLoad] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);

  const activeDaysList = useMemo(() => Object.entries(activeDays).filter(([,v])=>v).map(([k])=>Number(k)), [activeDays]);
  const DAYS = ['Di','Lu','Ma','Me','Je','Ve','Sa'];

  const addTime = () => {
    const t = timeInput.trim();
    if (/^\d{2}:\d{2}$/.test(t)) {
      setTimes((arr) => Array.from(new Set([...arr, t])));
      setTimeInput('');
    }
  };

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.card }]}> 
          <View style={[styles.header, { borderBottomColor: colors.muted + '22' }]}>
            <Text style={[styles.title, { color: colors.text }]}>Actions rapides</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Fermer" style={styles.closeBtn}>
              <Text style={[styles.close, { color: colors.muted }]}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 32 }]}> 
            <Text style={[styles.sectionLabel, { color: colors.muted }]}>Catégorie</Text>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={onCreateCategory}>
              <Text style={styles.primaryText}>Créer une catégorie</Text>
            </TouchableOpacity>

            <Text style={[styles.sectionLabel, { color: colors.muted }]}>Habitude</Text>
            {categories.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 8 }}
                contentContainerStyle={{ gap: 8 }}
              >
                {categories.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.catChip, { borderColor: colors.muted + '44', backgroundColor: selectedCategoryId === c.id ? colors.primary : 'transparent' }]}
                    onPress={() => setSelectedCategoryId((prev) => (prev === c.id ? undefined : c.id))}
                  >
                    <Text style={{ color: selectedCategoryId === c.id ? '#fff' : colors.text }}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={() => onCreateHabit?.(selectedCategoryId)}>
              <Text style={styles.primaryText}>Créer une habitude</Text>
            </TouchableOpacity>

            <Text style={[styles.sectionLabel, { color: colors.muted }]}>Objectif SMART</Text>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={onCreateGoal}>
              <Text style={styles.primaryText}>Créer un objectif</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.secondaryBtn, { borderColor: colors.muted + '44' }]} onPress={onRequestNotifications}>
              <Text style={[styles.secondaryText, { color: colors.text }]}>Autoriser les notifications</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: colors.muted + '22', borderColor: colors.muted + '33' }]} onPress={() => onSendReminders?.(times, activeDaysList, sendOnLoad)}>
              <Text style={[styles.secondaryText, { color: colors.text }]}>Envoyer les rappels</Text>
            </TouchableOpacity>

            <Text style={[styles.sectionLabel, { color: colors.muted }]}>Heures de rappel</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TextInput
                placeholder="--:--"
                value={timeInput}
                onChangeText={setTimeInput}
                style={[styles.input, { borderColor: colors.muted + '44', color: colors.text }]}
              />
              <TouchableOpacity style={[styles.secondaryBtn, { paddingVertical: 10, paddingHorizontal: 16, borderColor: colors.muted + '44' }]} onPress={addTime}>
                <Text style={[styles.secondaryText, { color: colors.text }]}>Ajouter</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.chipsRow}>
              {times.map((t) => (
                <View key={t} style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.muted + '44' }]}> 
                  <Text style={{ color: colors.text }}>{t}</Text>
                  <Text style={{ marginLeft: 6, color: colors.muted }}>×</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.muted }]}>Jours actifs</Text>
            <View style={styles.daysRow}>
              {DAYS.map((label, idx) => (
                <TouchableOpacity
                  key={label}
                  style={[styles.dayBtn, { backgroundColor: activeDays[idx] ? colors.primary : colors.muted + '22' }]}
                  onPress={() => setActiveDays((m) => ({ ...m, [idx]: !m[idx] }))}
                >
                  <Text style={{ color: activeDays[idx] ? '#fff' : colors.text }}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.toggleRow}>
              <Switch value={sendOnLoad} onValueChange={setSendOnLoad} />
              <Text style={{ marginLeft: 8, color: colors.muted }}>Rappels au chargement</Text>
            </View>

            <TouchableOpacity style={styles.dangerBtn} onPress={onResetAll}>
              <Text style={styles.dangerText}>Réinitialiser toutes les données</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { maxHeight: '95%', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  title: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '700' },
  closeBtn: { position: 'absolute', right: 16 },
  close: { fontSize: 20 },
  content: { padding: 16 },
  sectionLabel: { fontSize: 14, marginTop: 12, marginBottom: 8 },
  primaryBtn: { paddingVertical: 14, borderRadius: 20, alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  primaryText: { color: '#fff', fontWeight: '700' },
  secondaryBtn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, marginTop: 8 },
  secondaryText: { fontWeight: '600' },
  catChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  dangerBtn: { paddingVertical: 14, borderRadius: 16, alignItems: 'center', backgroundColor: '#ef4444', marginTop: 16, marginBottom: 24 },
  dangerText: { color: '#fff', fontWeight: '700' },
  input: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  dayBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
});
