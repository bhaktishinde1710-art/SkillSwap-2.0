import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { sessionApi } from '../../src/services/api';
import { SessionItem } from '../../src/types';
import { Colors, BorderRadius, Spacing } from '../../src/constants/theme';
import { StatusBadge } from '../../src/components/StatusBadge';

const STATUS_FILTERS = ['All', 'Upcoming', 'Pending', 'Completed', 'Cancelled'];

export default function BookingsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState<'all' | 'learner' | 'mentor'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      const data = await sessionApi.getSessions(roleFilter);
      setSessions(data);
    } catch (err) {
      console.warn('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSessions();
  };

  const handleUpdateStatus = async (sessionId: number, newStatus: string) => {
    try {
      await sessionApi.updateSessionStatus(sessionId, { status: newStatus });
      fetchSessions();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail || 'Failed to update session');
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Upcoming') return s.status === 'Accepted' || s.status === 'Scheduled';
    if (activeFilter === 'Pending') return s.status === 'Pending';
    if (activeFilter === 'Completed') return s.status === 'Completed';
    if (activeFilter === 'Cancelled') return s.status === 'Cancelled' || s.status === 'Rejected';
    return true;
  });

  const renderSessionItem = ({ item }: { item: SessionItem }) => {
    const isLearner = item.learner_id === user?.id;
    const isMentor = item.mentor_id === user?.id;
    const counterpart = isLearner ? item.mentor : item.learner;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => router.push(`/booking/${item.id}` as any)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.skillBadge}>
            <Text style={styles.skillBadgeText}>{item.skill?.name || 'Peer Session'}</Text>
          </View>
          <StatusBadge status={item.status} />
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.partnerName}>
            {isLearner ? 'Mentor: ' : 'Learner: '}
            <Text style={{ fontWeight: '700' }}>{counterpart?.full_name || counterpart?.first_name}</Text>
          </Text>

          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={15} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{item.scheduled_date}</Text>
            <Ionicons name="time-outline" size={15} color={Colors.textSecondary} style={{ marginLeft: 10 }} />
            <Text style={styles.metaText}>{item.start_time} - {item.end_time}</Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons
              name={item.mode === 'Online' ? 'videocam-outline' : 'location-outline'}
              size={15}
              color={Colors.primary}
            />
            <Text style={[styles.metaText, { color: Colors.primary, fontWeight: '600' }]}>
              {item.mode} {item.location ? `(${item.location})` : ''}
            </Text>
          </View>

          {item.notes ? (
            <Text style={styles.notesText} numberOfLines={2}>
              "{item.notes}"
            </Text>
          ) : null}
        </View>

        {/* Quick action buttons on card */}
        {isMentor && item.status === 'Pending' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={() => handleUpdateStatus(item.id, 'Accepted')}
            >
              <Ionicons name="checkmark" size={16} color={Colors.white} />
              <Text style={styles.acceptBtnText}>Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => handleUpdateStatus(item.id, 'Rejected')}
            >
              <Ionicons name="close" size={16} color={Colors.dangerDark} />
              <Text style={styles.rejectBtnText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}

        {isLearner && item.status === 'Completed' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.reviewBtn]}
              onPress={() => router.push({
                pathname: '/booking/review',
                params: { session_id: item.id, mentor_name: item.mentor?.full_name || item.mentor?.first_name }
              })}
            >
              <Ionicons name="star" size={15} color="#D97706" />
              <Text style={styles.reviewBtnText}>Leave Review</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Role Tabs */}
      <View style={styles.roleTabs}>
        <TouchableOpacity
          style={[styles.roleTab, roleFilter === 'all' && styles.roleTabActive]}
          onPress={() => setRoleFilter('all')}
        >
          <Text style={[styles.roleTabText, roleFilter === 'all' && styles.roleTabTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleTab, roleFilter === 'learner' && styles.roleTabActive]}
          onPress={() => setRoleFilter('learner')}
        >
          <Text style={[styles.roleTabText, roleFilter === 'learner' && styles.roleTabTextActive]}>As Learner</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleTab, roleFilter === 'mentor' && styles.roleTabActive]}
          onPress={() => setRoleFilter('mentor')}
        >
          <Text style={[styles.roleTabText, roleFilter === 'mentor' && styles.roleTabTextActive]}>As Mentor</Text>
        </TouchableOpacity>
      </View>

      {/* Status Chips */}
      <View style={styles.statusChipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusChipsScroll}>
          {STATUS_FILTERS.map((filter) => {
            const active = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.statusChip, active && styles.statusChipActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.statusChipText, active && styles.statusChipTextActive]}>{filter}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Sessions List */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredSessions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSessionItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-clear-outline" size={44} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Sessions Found</Text>
              <Text style={styles.emptyDesc}>
                {activeFilter !== 'All'
                  ? `No sessions with status "${activeFilter}".`
                  : 'You have not booked or accepted any learning sessions yet.'}
              </Text>
              <TouchableOpacity
                style={styles.exploreCta}
                onPress={() => router.push('/(tabs)/explore')}
              >
                <Text style={styles.exploreCtaText}>Find Mentors</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: 8,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  roleTabActive: {
    borderBottomColor: Colors.primary,
  },
  roleTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  roleTabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  statusChipsContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 8,
  },
  statusChipsScroll: {
    paddingHorizontal: Spacing.lg,
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  statusChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  listContent: {
    padding: Spacing.lg,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  skillBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  skillBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  cardBody: {
    gap: 6,
  },
  partnerName: {
    fontSize: 15,
    color: Colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  notesText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  actionBtn: {
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
  rejectBtn: {
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectBtnText: {
    color: Colors.dangerDark,
    fontSize: 13,
    fontWeight: '700',
  },
  reviewBtn: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  reviewBtnText: {
    color: '#B45309',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 32,
    lineHeight: 18,
  },
  exploreCta: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  exploreCtaText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
