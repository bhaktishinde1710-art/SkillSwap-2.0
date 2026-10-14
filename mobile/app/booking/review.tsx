import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sessionApi } from '../../src/services/api';
import { Colors, BorderRadius, Spacing } from '../../src/constants/theme';
import { RatingStars } from '../../src/components/RatingStars';

export default function ReviewModal() {
  const router = useRouter();
  const { session_id, mentor_name } = useLocalSearchParams<{
    session_id: string;
    mentor_name?: string;
  }>();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!session_id) return;
    if (!comment.trim()) {
      Alert.alert('Feedback Required', 'Please write a brief comment describing your learning experience.');
      return;
    }

    try {
      setSubmitting(true);
      await sessionApi.submitReview({
        session_id: parseInt(session_id, 10),
        rating,
        comment: comment.trim(),
      });

      Alert.alert(
        'Review Submitted!',
        'Thank you! Your feedback helps update the mentor trust score and assists fellow students.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to submit review';
      Alert.alert('Error', typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.white }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Review Your Session</Text>
          <Text style={styles.subtitle}>
            How was your peer learning session with{' '}
            <Text style={{ fontWeight: '700', color: Colors.text }}>
              {mentor_name || 'your mentor'}
            </Text>
            ?
          </Text>
        </View>

        {/* Interactive Star Picker */}
        <View style={styles.starPickerCard}>
          <Text style={styles.starLabel}>Overall Rating</Text>
          <View style={styles.starRow}>
            <RatingStars
              rating={rating}
              size={36}
              interactive
              onRatingChange={(newVal) => setRating(newVal)}
            />
          </View>
          <Text style={styles.ratingDescriptor}>
            {rating === 5 && '🌟 Excellent experience'}
            {rating === 4 && '👍 Great session'}
            {rating === 3 && '👌 Good learning'}
            {rating === 2 && '👎 Needs improvement'}
            {rating === 1 && '⚠️ Unsatisfactory'}
          </Text>
        </View>

        {/* Written Review */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Your Feedback & Review</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Share how helpful the mentor was, the topics you covered, and what you learned..."
            placeholderTextColor={Colors.textMuted}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={5}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitBtnText}>Submit Review</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  starPickerCard: {
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  starLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  starRow: {
    marginVertical: 4,
  },
  ratingDescriptor: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 24,
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    padding: 12,
    height: 120,
    fontSize: 14,
    color: Colors.text,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  cancelText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
