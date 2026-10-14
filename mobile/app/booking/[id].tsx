import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { sessionApi } from '../../src/services/api';
import { SessionItem } from '../../src/types';
import { Colors, BorderRadius, Spacing } from '../../src/constants/theme';
import { StatusBadge } from '../../src/components/StatusBadge';

export default function BookingDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [session, setSession] = useState<SessionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSession = useCallback(async () => {
    if (!id) return;
    try {
      const sessionId = parseInt(id, 10);
      const data = await sessionApi.getSessionDetail(sessionId);
      setSession(data);
    } catch (err) {
      console.warn('Failed to load session details:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSession();
  };

  const handleUpdateStatus = async (status: string, cancellation_reason?: string) => {
    if (!session) return;
    try {
      setActionLoading(true);
      const updated = await sessionApi.updateSessionStatus(session.id, {
        status,
        cancellation_reason,
      });
      setSession(updated);
      Alert.alert('Success', `Session status changed to ${status}`);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail || 'Failed to update session');
    } finally {
      setActionLoading(false);
    }
  };

  const promptCancelSession = () => {
    Alert.prompt
      ? Alert.prompt(
          'Cancel Session',
          'Please enter a reason for cancellation:',
          [
            { text: 'Back', style: 'cancel' },
            {
              text: 'Cancel Session',
              style: 'destructive',
              onPress: (reason?: string) => handleUpdateStatus('Cancelled', reason || 'Cancelled by student'),
            },
          ]
        )
      : Alert.alert('Cancel Session', 'Are you sure you want to cancel this scheduled session?', [
          { text: 'Back', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: () => handleUpdateStatus('Cancelled', 'Cancelled by student'),
          },
        ]);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.notFoundText}>Session not found</Text>
      </View>
    );
  }

  const isLearner = session.learner_id === user?.id;
  const isMentor = session.mentor_id === user?.id;
  const counterpart = isLearner ? session.mentor : session.learner;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
    >
      {/* Session Header Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.skillBox}>
            <Text style={styles.skillName}>{session.skill?.name || 'Peer Learning Session'}</Text>
            <Text style={styles.skillCategory}>{session.skill?.category}</Text>
          </View>
          <StatusBadge status={session.status} />
        </View>

        <View style={styles.divider} />

        {/* Counterpart Info */}
        <View style={styles.partnerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{counterpart?.first_name?.[0] || 'U'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.roleLabel}>{isLearner ? 'Your Mentor' : 'Your Learner'}</Text>
            <Text style={styles.partnerName}>{counterpart?.full_name || counterpart?.first_name}</Text>
            <Text style={styles.partnerDept}>
              {counterpart?.department} • {counterpart?.year}
            </Text>
          </View>
          {isLearner && (
            <TouchableOpacity
              style={styles.viewProfileBtn}
              onPress={() => router.push(`/mentor/${session.mentor_id}` as any)}
            >
              <Text style={styles.viewProfileText}>Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Schedule & Location Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Session Information</Text>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Scheduled Date</Text>
            <Text style={styles.infoValue}>{session.scheduled_date}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={18} color={Colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Time Slot</Text>
            <Text style={styles.infoValue}>{session.start_time} - {session.end_time}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name={session.mode === 'Online' ? 'videocam-outline' : 'location-outline'}
            size={18}
            color={Colors.primary}
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Meeting Mode</Text>
            <Text style={styles.infoValue}>{session.mode}</Text>
          </View>
        </View>

        {session.mode === 'Online' && session.meeting_link && (
          <View style={styles.infoRow}>
            <Ionicons name="link-outline" size={18} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Meeting Link</Text>
              <TouchableOpacity
                onPress={() => {
                  if (session.meeting_link) {
                    Linking.openURL(session.meeting_link).catch(() =>
                      Alert.alert('Link', session.meeting_link || '')
                    );
                  }
                }}
              >
                <Text style={styles.linkText}>{session.meeting_link}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {session.mode === 'Offline' && session.location && (
          <View style={styles.infoRow}>
            <Ionicons name="navigate-outline" size={18} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Campus Location</Text>
              <Text style={styles.infoValue}>{session.location}</Text>
            </View>
          </View>
        )}

        {session.notes && (
          <View style={styles.infoRow}>
            <Ionicons name="chatbox-outline" size={18} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Session Notes</Text>
              <Text style={styles.infoValue}>{session.notes}</Text>
            </View>
          </View>
        )}

        {session.cancellation_reason && (
          <View style={[styles.infoRow, { backgroundColor: '#FEE2E2', padding: 8, borderRadius: BorderRadius.sm }]}>
            <Ionicons name="alert-circle" size={18} color={Colors.danger} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: Colors.dangerDark }]}>Cancellation Reason</Text>
              <Text style={[styles.infoValue, { color: Colors.dangerDark }]}>{session.cancellation_reason}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsCard}>
        {actionLoading && <ActivityIndicator style={{ marginBottom: 12 }} color={Colors.primary} />}

        {/* Mentor Pending Actions */}
        {isMentor && session.status === 'Pending' && (
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btn, styles.acceptBtn]}
              onPress={() => handleUpdateStatus('Accepted')}
              disabled={actionLoading}
            >
              <Ionicons name="checkmark" size={18} color={Colors.white} />
              <Text style={styles.acceptBtnText}>Accept Booking</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.rejectBtn]}
              onPress={() => handleUpdateStatus('Rejected')}
              disabled={actionLoading}
            >
              <Ionicons name="close" size={18} color={Colors.dangerDark} />
              <Text style={styles.rejectBtnText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Confirmed Session Actions */}
        {(session.status === 'Accepted' || session.status === 'Scheduled') && (
          <View style={{ gap: 10 }}>
            {isMentor && (
              <TouchableOpacity
                style={[styles.btn, styles.completeBtn]}
                onPress={() => handleUpdateStatus('Completed')}
                disabled={actionLoading}
              >
                <Ionicons name="checkmark-done" size={18} color={Colors.white} />
                <Text style={styles.completeBtnText}>Mark Completed</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.btn, styles.cancelBtn]}
              onPress={promptCancelSession}
              disabled={actionLoading}
            >
              <Ionicons name="close-circle-outline" size={18} color={Colors.danger} />
              <Text style={styles.cancelBtnText}>Cancel Session</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Completed Session Actions */}
        {session.status === 'Completed' && isLearner && (
          <TouchableOpacity
            style={[styles.btn, styles.reviewBtn]}
            onPress={() =>
              router.push({
                pathname: '/booking/review',
                params: {
                  session_id: session.id,
                  mentor_name: session.mentor?.full_name || session.mentor?.first_name,
                },
              })
            }
          >
            <Ionicons name="star" size={18} color="#D97706" />
            <Text style={styles.reviewBtnText}>Rate & Leave Review</Text>
          </TouchableOpacity>
        )}
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
    gap: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  skillBox: {
    flex: 1,
  },
  skillName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  skillCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 14,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  roleLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 1,
  },
  partnerDept: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  viewProfileBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primaryLight,
  },
  viewProfileText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
    marginTop: 2,
  },
  linkText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
    textDecorationLine: 'underline',
  },
  actionsCard: {
    gap: 10,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: Colors.success,
  },
  acceptBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectBtnText: {
    color: Colors.dangerDark,
    fontSize: 14,
    fontWeight: '700',
  },
  completeBtn: {
    backgroundColor: Colors.primary,
  },
  completeBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  cancelBtn: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  reviewBtn: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  reviewBtnText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '700',
  },
});
