import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '../constants/theme';

interface TrustScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const TrustScoreBadge: React.FC<TrustScoreBadgeProps> = ({
  score,
  size = 'md',
  showLabel = false,
}) => {
  // Categorize trust score tier
  const getTier = () => {
    if (score >= 90) return { label: 'Top Mentor', bg: '#ECFDF5', text: '#059669', icon: 'shield-checkmark' as const };
    if (score >= 75) return { label: 'Trusted', bg: '#EFF6FF', text: '#2563EB', icon: 'shield' as const };
    if (score >= 50) return { label: 'Good', bg: '#FEF3C7', text: '#D97706', icon: 'shield-outline' as const };
    return { label: 'New Mentor', bg: '#F1F5F9', text: '#64748B', icon: 'shield-outline' as const };
  };

  const tier = getTier();

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: tier.bg },
        isSmall && styles.badgeSm,
        isLarge && styles.badgeLg,
      ]}
    >
      <Ionicons
        name={tier.icon}
        size={isSmall ? 12 : isLarge ? 18 : 14}
        color={tier.text}
        style={{ marginRight: 3 }}
      />
      <Text
        style={[
          styles.scoreText,
          { color: tier.text },
          isSmall && styles.scoreTextSm,
          isLarge && styles.scoreTextLg,
        ]}
      >
        {Math.round(score)}%
      </Text>
      {showLabel && (
        <Text style={[styles.labelText, { color: tier.text }]}> • {tier.label}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeLg: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  scoreText: {
    fontWeight: '700',
    fontSize: 12,
  },
  scoreTextSm: {
    fontSize: 10,
  },
  scoreTextLg: {
    fontSize: 15,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
