import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useWebLikeStats } from './useWebLikeStats';

export const MobileStatsOverview: React.FC = () => {
  const { longestStreak, totalSuccess, level } = useWebLikeStats();

  return (
    <View style={styles.row}>
  <View style={styles.box}><Text style={styles.label}>Série</Text><Text style={styles.value}>{longestStreak}</Text></View>
  <View style={styles.box}><Text style={styles.label}>Succès</Text><Text style={styles.value}>{totalSuccess}</Text></View>
      <View style={styles.box}><Text style={styles.label}>Niveau</Text><Text style={styles.value}>{level}</Text></View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, marginTop: 12 },
  box: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 2,
    alignItems: 'center',
  },
  label: { color: '#6b7280', marginBottom: 4 },
  value: { fontSize: 18, fontWeight: '700' },
});
