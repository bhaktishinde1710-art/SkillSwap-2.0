import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminApi } from '../../src/services/api';
import { ReportItem } from '../../src/types';
import { Colors, BorderRadius, Spacing } from '../../src/constants/theme';
import { StatusBadge } from '../../src/components/StatusBadge';

const STATUS_FILTERS = ['All', 'pending', 'investigating', 'resolved', 'dismissed'];

export default function AdminReportsScreen() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      const data = await adminApi.getReports(statusFilter !== 'All' ? statusFilter : undefined);
      setReports(data);
    } catch (err) {
      console.warn('Failed to load admin reports:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const handleUpdateStatus = async (reportId: number, status: string) => {
    try {
      await adminApi.updateReportStatus(reportId, status);
      Alert.alert('Updated', `Report marked as ${status}`);
      fetchReports();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail || 'Failed to update report');
    }
  };

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        {STATUS_FILTERS.map((st) => {
          const active = statusFilter === st;
          return (
            <TouchableOpacity
              key={st}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setStatusFilter(st)}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {st.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="shield-checkmark-outline" size={44} color={Colors.success} />
              <Text style={styles.emptyTitle}>No Incident Reports</Text>
              <Text style={styles.emptyDesc}>No user reports found for the selected status.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reasonText}>{item.reason}</Text>
                  <Text style={styles.userMeta}>
                    Reported: <Text style={{ fontWeight: '700', color: Colors.text }}>{item.reported_user?.full_name || 'Student'}</Text>
                    {' • '}By: {item.reporter?.full_name || 'Reporter'}
                  </Text>
                </View>
                <StatusBadge status={item.status} />
              </View>

              <Text style={styles.descText}>{item.description}</Text>

              {/* Moderation Actions */}
              {item.status === 'pending' && (
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.actBtn, { backgroundColor: Colors.info }]}
                    onPress={() => handleUpdateStatus(item.id, 'investigating')}
                  >
                    <Text style={styles.actBtnText}>Investigate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actBtn, { backgroundColor: Colors.success }]}
                    onPress={() => handleUpdateStatus(item.id, 'resolved')}
                  >
                    <Text style={styles.actBtnText}>Resolve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actBtn, { backgroundColor: '#F1F5F9' }]}
                    onPress={() => handleUpdateStatus(item.id, 'dismissed')}
                  >
                    <Text style={[styles.actBtnText, { color: Colors.textSecondary }]}>Dismiss</Text>
                  </TouchableOpacity>
                </View>
              )}
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterChip: {
    paddingHorizontal: 12,
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
    fontSize: 11,
    fontWeight: '700',
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dangerDark,
  },
  userMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  descText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
    marginVertical: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  actBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  actBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
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
