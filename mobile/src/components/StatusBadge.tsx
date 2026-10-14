import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius } from '../constants/theme';
import { SessionStatus } from '../types';

interface StatusBadgeProps {
  status: SessionStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyle = () => {
    switch (status.toLowerCase()) {
      case 'accepted':
      case 'scheduled':
        return { bg: Colors.successLight, text: Colors.successDark, border: '#A7F3D0' };
      case 'completed':
        return { bg: Colors.primaryLight, text: Colors.primary, border: Colors.primaryBorder };
      case 'pending':
        return { bg: Colors.warningLight, text: Colors.warningDark, border: '#FDE68A' };
      case 'rejected':
      case 'cancelled':
        return { bg: Colors.dangerLight, text: Colors.dangerDark, border: '#FECACA' };
      case 'verified':
        return { bg: Colors.successLight, text: Colors.successDark, border: '#A7F3D0' };
      case 'suspended':
        return { bg: Colors.dangerLight, text: Colors.dangerDark, border: '#FECACA' };
      default:
        return { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' };
    }
  };

  const style = getStyle();

  return (
    <View style={[styles.badge, { backgroundColor: style.bg, borderColor: style.border }]}>
      <Text style={[styles.text, { color: style.text }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
