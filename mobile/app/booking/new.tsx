import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { userApi, sessionApi } from '../../src/services/api';
import { UserDetail, Skill } from '../../src/types';
import { Colors, BorderRadius, Spacing } from '../../src/constants/theme';

export default function BookSessionScreen() {
  const router = useRouter();
  const { mentor_id, skill_id } = useLocalSearchParams<{ mentor_id?: string; skill_id?: string }>();

  const [mentor, setMentor] = useState<UserDetail | null>(null);
  const [loadingMentor, setLoadingMentor] = useState(true);

  // Form states
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(
    skill_id ? parseInt(skill_id, 10) : null
  );

  // Default date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [scheduledDate, setScheduledDate] = useState(defaultDateStr);
  const [startTime, setStartTime] = useState('15:00');
  const [endTime, setEndTime] = useState('16:00');
  const [mode, setMode] = useState<'Online' | 'Offline'>('Online');
  const [locationOrLink, setLocationOrLink] = useState('Google Meet (VIT Campus domain)');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMentor = async () => {
      if (!mentor_id) {
        setLoadingMentor(false);
        return;
      }
      try {
        const idNum = parseInt(mentor_id, 10);
        const data = await userApi.getMentorById(idNum);
        setMentor(data);

        // Preselect skill if not set
        if (!selectedSkillId && data.teaching_skills?.length > 0) {
          setSelectedSkillId(data.teaching_skills[0].skill_id);
        }
      } catch (err) {
        console.warn('Failed to load mentor for booking:', err);
      } finally {
        setLoadingMentor(false);
      }
    };

    fetchMentor();
  }, [mentor_id]);

  const handleConfirmBooking = async () => {
    if (!mentor_id || !selectedSkillId) {
      Alert.alert('Required Field', 'Please select a skill to learn.');
      return;
    }
    if (!scheduledDate || !startTime || !endTime) {
      Alert.alert('Required Field', 'Please provide date, start time, and end time.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await sessionApi.bookSession({
        mentor_id: parseInt(mentor_id, 10),
        skill_id: selectedSkillId,
        scheduled_date: scheduledDate,
        start_time: startTime,
        end_time: endTime,
        mode,
        location: mode === 'Offline' ? locationOrLink : undefined,
        notes: notes.trim() || undefined,
      });

      Alert.alert(
        'Session Requested!',
        'Your booking request has been sent to the mentor. You will be notified when they accept.',
        [
          {
            text: 'View Booking',
            onPress: () => router.replace(`/booking/${res.id}` as any),
          },
        ]
      );
    } catch (err: any) {
      if (err?.response?.status === 409) {
        Alert.alert(
          'Scheduling Conflict',
          err?.response?.data?.detail ||
            'The selected mentor or learner already has a confirmed session during this time slot. Please choose another time.'
        );
      } else {
        const msg = err?.response?.data?.detail || err?.message || 'Failed to book session';
        Alert.alert('Booking Error', typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingMentor) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Mentor summary banner */}
        {mentor && (
          <View style={styles.mentorBanner}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{mentor.first_name?.[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.mentorName}>{mentor.full_name || mentor.first_name}</Text>
              <Text style={styles.mentorDept}>
                {mentor.department} • {mentor.college}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.formCard}>
          {/* Select Skill */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Choose Skill to Learn</Text>
            <View style={styles.skillChips}>
              {mentor?.teaching_skills?.map((ts) => {
                const selected = selectedSkillId === ts.skill_id;
                return (
                  <TouchableOpacity
                    key={ts.id}
                    style={[styles.skillChip, selected && styles.skillChipActive]}
                    onPress={() => setSelectedSkillId(ts.skill_id)}
                  >
                    <Text style={[styles.skillChipText, selected && styles.skillChipTextActive]}>
                      {ts.skill?.name}
                    </Text>
                    <Text style={[styles.skillChipLevel, selected && { color: '#E0E7FF' }]}>
                      ({ts.proficiency_level})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Date Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Scheduled Date (YYYY-MM-DD)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="calendar-outline" size={18} color={Colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.input}
                value={scheduledDate}
                onChangeText={setScheduledDate}
                placeholder="2026-10-15"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          {/* Time Slot Inputs */}
          <View style={styles.timeRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Start Time (HH:MM)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="time-outline" size={18} color={Colors.textMuted} style={{ marginRight: 6 }} />
                <TextInput
                  style={styles.input}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="15:00"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>End Time (HH:MM)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="time-outline" size={18} color={Colors.textMuted} style={{ marginRight: 6 }} />
                <TextInput
                  style={styles.input}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="16:00"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>
          </View>

          {/* Mode Selector (Online / Offline) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Session Mode</Text>
            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[styles.modeBtn, mode === 'Online' && styles.modeBtnActive]}
                onPress={() => {
                  setMode('Online');
                  setLocationOrLink('Google Meet (VIT Campus domain)');
                }}
              >
                <Ionicons
                  name="videocam"
                  size={18}
                  color={mode === 'Online' ? Colors.white : Colors.textSecondary}
                />
                <Text style={[styles.modeBtnText, mode === 'Online' && styles.modeBtnTextActive]}>
                  Online (Meet / Zoom)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeBtn, mode === 'Offline' && styles.modeBtnActive]}
                onPress={() => {
                  setMode('Offline');
                  setLocationOrLink('VIT Library Room 204');
                }}
              >
                <Ionicons
                  name="location"
                  size={18}
                  color={mode === 'Offline' ? Colors.white : Colors.textSecondary}
                />
                <Text style={[styles.modeBtnText, mode === 'Offline' && styles.modeBtnTextActive]}>
                  Offline (In-Person)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Location or Meeting Link */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {mode === 'Online' ? 'Meeting Link / Platform' : 'Campus Location'}
            </Text>
            <TextInput
              style={styles.input}
              value={locationOrLink}
              onChangeText={setLocationOrLink}
              placeholder={mode === 'Online' ? 'https://meet.google.com/...' : 'e.g. Reading Hall, 3rd Floor'}
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          {/* Notes for Mentor */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes or Topics to Cover</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Tell your peer mentor what you would like to work on..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
            activeOpacity={0.85}
            onPress={handleConfirmBooking}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitBtnText}>Request Booking</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  mentorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  mentorName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  mentorDept: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  skillChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    gap: 4,
  },
  skillChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  skillChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  skillChipTextActive: {
    color: Colors.white,
  },
  skillChipLevel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    height: 46,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    gap: 6,
  },
  modeBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modeBtnTextActive: {
    color: Colors.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingVertical: 10,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
