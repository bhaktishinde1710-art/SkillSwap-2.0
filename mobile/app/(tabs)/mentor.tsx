import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { userApi, sessionApi } from '../../src/services/api';
import { UserDetail, Availability, SessionItem, DayOfWeek } from '../../src/types';
import { Colors, BorderRadius, Spacing } from '../../src/constants/theme';
import { TrustScoreBadge } from '../../src/components/TrustScoreBadge';

const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function MentorHubScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserDetail | null>(null);
  const [requests, setRequests] = useState<SessionItem[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);

  const fetchMentorData = useCallback(async () => {
    try {
      const [profileData, reqsData, availData] = await Promise.all([
        userApi.getProfile(),
        sessionApi.getMentorRequests().catch(() => []),
        userApi.getMyAvailability().catch(() => []),
      ]);

      setProfile(profileData);
      setRequests(reqsData);

      // Ensure all 7 days have an entry in state
      const initialized = DAYS_OF_WEEK.map((day) => {
        const existing = availData.find((a) => a.day === day);
        if (existing) return existing;
        return {
          id: 0,
          user_id: user?.id || 0,
          day,
          start_time: '14:00',
          end_time: '18:00',
          available: false,
        };
      });
      setAvailabilities(initialized);
    } catch (err) {
      console.warn('Failed to load mentor hub data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMentorData();
  }, [fetchMentorData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMentorData();
  };

  const handleUpdateRequest = async (sessionId: number, status: 'Accepted' | 'Rejected') => {
    try {
      await sessionApi.updateSessionStatus(sessionId, { status });
      setRequests((prev) => prev.filter((r) => r.id !== sessionId));
      Alert.alert('Success', `Session ${status.toLowerCase()} successfully`);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail || 'Failed to update request');
    }
  };

  const toggleDayAvailable = (day: DayOfWeek) => {
    setAvailabilities((prev) =>
      prev.map((a) => (a.day === day ? { ...a, available: !a.available } : a))
    );
  };

  const updateDayTime = (day: DayOfWeek, field: 'start_time' | 'end_time', value: string) => {
    setAvailabilities((prev) =>
      prev.map((a) => (a.day === day ? { ...a, [field]: value } : a))
    );
  };

  const handleSaveAvailability = async () => {
    try {
      setSavingAvailability(true);
      const payload = availabilities.map((a) => ({
        day: a.day,
        start_time: a.start_time,
        end_time: a.end_time,
        available: a.available,
      }));
      await userApi.setMyAvailability(payload);
      Alert.alert('Saved', 'Your weekly availability schedule has been updated');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail || 'Failed to save availability');
    } finally {
      setSavingAvailability(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
    >
      {/* Mentor Performance / Trust Score Card */}
      <View style={styles.metricsCard}>
        <View style={styles.metricsHeader}>
          <View>
            <Text style={styles.metricsTitle}>Mentor Reputation</Text>
            <Text style={styles.metricsSubtitle}>Calculated from completed sessions and learner reviews</Text>
          </View>
          {profile?.trust_score && (
            <TrustScoreBadge score={profile.trust_score.score} size="lg" showLabel />
          )}
        </View>

        <View style={styles.breakdownGrid}>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownScore}>{profile?.trust_score?.reliability_score || 100}%</Text>
            <Text style={styles.breakdownLabel}>Reliability</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownScore}>{profile?.trust_score?.teaching_score || 100}%</Text>
            <Text style={styles.breakdownLabel}>Teaching</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownScore}>{profile?.trust_score?.review_score || 100}%</Text>
            <Text style={styles.breakdownLabel}>Feedback</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownScore}>{profile?.completed_sessions_count || 0}</Text>
            <Text style={styles.breakdownLabel}>Sessions</Text>
          </View>
        </View>
      </View>

      {/* Incoming Requests Section */}
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="mail-unread" size={18} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Incoming Session Requests ({requests.length})</Text>
        </View>
      </View>

      {requests.length === 0 ? (
        <View style={styles.emptyRequests}>
          <Ionicons name="checkmark-circle-outline" size={36} color={Colors.success} />
          <Text style={styles.emptyTitle}>All Caught Up</Text>
          <Text style={styles.emptyDesc}>No pending student booking requests waiting for your approval.</Text>
        </View>
      ) : (
        requests.map((req) => (
          <View key={req.id} style={styles.requestCard}>
            <View style={styles.reqHeader}>
              <View>
                <Text style={styles.reqLearnerName}>{req.learner?.full_name || req.learner?.first_name}</Text>
                <Text style={styles.reqSkill}>Skill: {req.skill?.name}</Text>
              </View>
              <View style={styles.reqModeBadge}>
                <Text style={styles.reqModeText}>{req.mode}</Text>
              </View>
            </View>

            <View style={styles.reqDetails}>
              <Text style={styles.reqMeta}>
                Date: <Text style={{ fontWeight: '600', color: Colors.text }}>{req.scheduled_date}</Text> • {req.start_time} - {req.end_time}
              </Text>
              {req.notes ? (
                <Text style={styles.reqNotes}>Note: "{req.notes}"</Text>
              ) : null}
            </View>

            <View style={styles.reqBtnRow}>
              <TouchableOpacity
                style={[styles.reqBtn, styles.acceptBtn]}
                onPress={() => handleUpdateRequest(req.id, 'Accepted')}
              >
                <Ionicons name="checkmark" size={16} color={Colors.white} />
                <Text style={styles.acceptBtnText}>Accept Request</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.reqBtn, styles.declineBtn]}
                onPress={() => handleUpdateRequest(req.id, 'Rejected')}
              >
                <Ionicons name="close" size={16} color={Colors.dangerDark} />
                <Text style={styles.declineBtnText}>Decline</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* Teaching Skills Shortcut */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Teaching Skills</Text>
        <TouchableOpacity onPress={() => router.push('/profile/skills')}>
          <Text style={styles.manageLink}>Manage (+)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.skillsCard}>
        {profile?.teaching_skills && profile.teaching_skills.length > 0 ? (
          <View style={styles.skillsPillList}>
            {profile.teaching_skills.map((ts) => (
              <View key={ts.id} style={styles.skillChip}>
                <Text style={styles.skillChipName}>{ts.skill?.name}</Text>
                <Text style={styles.skillChipLevel}>{ts.proficiency_level}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={{ alignItems: 'center', paddingVertical: 12 }}>
            <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
              No teaching skills listed yet. Add skills to be discovered by students.
            </Text>
            <TouchableOpacity
              style={styles.addSkillBtn}
              onPress={() => router.push('/profile/skills')}
            >
              <Text style={styles.addSkillBtnText}>Add Teaching Skills</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Weekly Availability Schedule Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Weekly Availability Schedule</Text>
      </View>

      <View style={styles.availCard}>
        <Text style={styles.availHelp}>
          Turn on the days you are free for student mentoring sessions:
        </Text>

        {availabilities.map((avail) => (
          <View key={avail.day} style={styles.dayRow}>
            <View style={styles.daySwitchSection}>
              <Switch
                value={avail.available}
                onValueChange={() => toggleDayAvailable(avail.day)}
                trackColor={{ false: '#CBD5E1', true: Colors.primaryLight }}
                thumbColor={avail.available ? Colors.primary : '#F1F5F9'}
              />
              <Text style={[styles.dayName, avail.available && { fontWeight: '700', color: Colors.text }]}>
                {avail.day}
              </Text>
            </View>

            {avail.available ? (
              <View style={styles.timeInputsRow}>
                <TextInput
                  style={styles.timeInput}
                  value={avail.start_time}
                  onChangeText={(val) => updateDayTime(avail.day, 'start_time', val)}
                  placeholder="14:00"
                  maxLength={5}
                />
                <Text style={{ color: Colors.textSecondary }}>to</Text>
                <TextInput
                  style={styles.timeInput}
                  value={avail.end_time}
                  onChangeText={(val) => updateDayTime(avail.day, 'end_time', val)}
                  placeholder="18:00"
                  maxLength={5}
                />
              </View>
            ) : (
              <Text style={styles.unavailableText}>Unavailable</Text>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={[styles.saveAvailBtn, savingAvailability && { opacity: 0.7 }]}
          onPress={handleSaveAvailability}
          disabled={savingAvailability}
        >
          {savingAvailability ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.saveAvailBtnText}>Save Availability Schedule</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  metricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  metricsSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  breakdownGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: 12,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownScore: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  breakdownLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  manageLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyRequests: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  requestCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  reqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reqLearnerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  reqSkill: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  reqModeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  reqModeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  reqDetails: {
    marginBottom: 12,
    gap: 4,
  },
  reqMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  reqNotes: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  reqBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  reqBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  acceptBtn: {
    backgroundColor: Colors.success,
  },
  acceptBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  declineBtn: {
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  declineBtnText: {
    color: Colors.dangerDark,
    fontSize: 13,
    fontWeight: '700',
  },
  skillsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  skillsPillList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  skillChipName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  skillChipLevel: {
    fontSize: 10,
    color: Colors.primaryHover,
  },
  addSkillBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    marginTop: 8,
  },
  addSkillBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  availCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  availHelp: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  daySwitchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dayName: {
    fontSize: 14,
    color: Colors.textSecondary,
    width: 90,
  },
  timeInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeInput: {
    width: 56,
    height: 32,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    textAlign: 'center',
    fontSize: 12,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  unavailableText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  saveAvailBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveAvailBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
