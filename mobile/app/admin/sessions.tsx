import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminApi } from '../../src/services/api';
import { SessionItem } from '../../src/types';
import { Colors, BorderRadius, Spacing } from '../../src/constants/theme';
import { StatusBadge } from '../../src/components/StatusBadge';

const STATUS_FILTERS = ['All', 'Pending', 'Accepted', 'Scheduled', 'Completed', 'Cancelled'];

export default function AdminSessionsScreen() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      const data = await adminApi.getAllSessions(statusFilter);
      setSessions(data);
    } catch (err) {
      console.warn('Failed to fetch admin sessions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSessions();
  };

  return (
    <View style={styles.container}>
      {/* Filter Chips Bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {STATUS_FILTERS.map((st) => {
            const active = statusFilter === st;
            return (
              <TouchableOpacity
                key={st}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setStatusFilter(st)}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{st}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={44} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Sessions Found</Text>
              <Text style={styles.emptyDesc}>No sessions match the selected status filter.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.skillName}>{item.skill?.name || 'Session'}</Text>
                <StatusBadge status={item.status} />
              </View>

              <View style={styles.detailsGrid}>
                <Text style={styles.detailText}>
                  <Text style={{ fontWeight: '700' }}>Learner: </Text>
                  {item.learner?.full_name || item.learner?.first_name}
                </Text>
                <Text style={styles.detailText}>
                  <Text style={{ fontWeight: '700' }}>Mentor: </Text>
                  {item.mentor?.full_name || item.mentor?.first_name}
                </Text>
                <Text style={styles.detailText}>
                  <Text style={{ fontWeight: '700' }}>Scheduled: </Text>
                  {item.scheduled_date} ({item.start_time} - {item.end_time})
                </Text>
                <Text style={styles.detailText}>
                  <Text style={{ fontWeight: '700' }}>Mode: </Text>
                  {item.mode} {item.location ? `• ${item.location}` : ''}
                </Text>
              </View>
            </View>
          )}
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
  filterBar: {
    backgroundColor: Colors.white,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterScroll: {
    paddingHorizontal: Spacing.lg,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.white,
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
  skillName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  detailsGrid: {
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 10,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
