import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showText?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxStars = 5,
  size = 16,
  interactive = false,
  onRatingChange,
  showText = false,
}) => {
  const stars = [];

  for (let i = 1; i <= maxStars; i++) {
    const isFilled = rating >= i;
    const isHalf = !isFilled && rating >= i - 0.5;

    const iconName = isFilled ? 'star' : isHalf ? 'star-half' : 'star-outline';
    const iconColor = isFilled || isHalf ? '#F59E0B' : '#CBD5E1';

    if (interactive) {
      stars.push(
        <TouchableOpacity
          key={i}
          activeOpacity={0.7}
          onPress={() => onRatingChange && onRatingChange(i)}
          style={{ paddingHorizontal: 2 }}
        >
          <Ionicons name={iconName} size={size} color={iconColor} />
        </TouchableOpacity>
      );
    } else {
      stars.push(
        <View key={i} style={{ paddingHorizontal: 1 }}>
          <Ionicons name={iconName} size={size} color={iconColor} />
        </View>
      );
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.starRow}>{stars}</View>
      {showText && (
        <Text style={[styles.text, { fontSize: size * 0.85 }]}>
          {rating ? rating.toFixed(1) : 'New'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    marginLeft: 4,
    fontWeight: '600',
    color: Colors.text,
  },
});
