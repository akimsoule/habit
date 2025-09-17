import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../providers/useTheme';

type Props = {
  value: 'all' | 'today';
  onChange: (v: 'all' | 'today') => void;
};

export const SegmentedControl: React.FC<Props> = ({ value, onChange }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.muted + '33' }]}>
      <TouchableOpacity style={[styles.segment, value === 'all' && { backgroundColor: colors.card }]} onPress={() => onChange('all')}>
        <Text style={[styles.label, { color: colors.text }, value === 'all' && { color: colors.text }]}>Toutes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.segment, value === 'today' && { backgroundColor: colors.card }]} onPress={() => onChange('today')}>
        <Text style={[styles.label, { color: colors.text }, value === 'today' && { color: colors.text }]}>Aujourd'hui</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 3,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  segment: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  label: { fontWeight: '600' },
});
