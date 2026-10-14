import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminApi } from '../../src/services/api';
import { UserDetail } from '../../src/types';
import { Colors, BorderRadius, Spacing } from '../../src/constants/theme';
import { StatusBadge } from '../../src/components/StatusBadge';

const STATUS_FILTERS = ['All', 'pending', 'verified', 'suspended'];

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await adminApi.getUsers({
        search: search.trim() || undefined,
        status_filter: selectedStatus !== 'All' ? selectedStatus : undefined,
      });
      setUsers(data);
    } catch (err) {
      console.warn('Failed to fetch admin users:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, selectedStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleUpdateStatus = async (
    userId: number,
    statusAction: 'verify' | 'suspend' | 'activate' | 'reject'
  ) => {
    try {
      await adminApi.updateUserStatus(userId, statusAction);
      Alert.alert('Updated', `User status updated successfully`);
      fetchUsers();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail || 'Failed to update user status');
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={Colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by student name or email..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filter Chips */}
      <View style={styles.filterBar}>
        {STATUS_FILTERS.map((st) => {
          const active = selectedStatus === st;
          return (
            <TouchableOpacity
              key={st}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setSelectedStatus(st)}
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
          data={users}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="person-outline" size={44} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Students Found</Text>
              <Text style={styles.emptyDesc}>Try adjusting search criteria or status filter.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.userCard}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.first_name?.[0] || 'U'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{item.full_name || item.first_name}</Text>
                  <Text style={styles.userEmail}>{item.college_email}</Text>
                  <Text style={styles.userDept}>
                    {item.department} • {item.year}
                  </Text>
                </View>
                <StatusBadge status={item.verification_status} />
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                {item.verification_status === 'pending' && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.verifyBtn]}
                      onPress={() => handleUpdateStatus(item.id, 'verify')}
                    >
                      <Ionicons name="checkmark" size={14} color={Colors.white} />
                      <Text style={styles.verifyBtnText}>Verify</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.rejectBtn]}
                      onPress={() => handleUpdateStatus(item.id, 'reject')}
                    >
                      <Ionicons name="close" size={14} color={Colors.dangerDark} />
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </>
                )}

                {item.verification_status === 'verified' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.suspendBtn]}
                    onPress={() => handleUpdateStatus(item.id, 'suspend')}
                  >
                    <Ionicons name="ban" size={14} color={Colors.dangerDark} />
                    <Text style={styles.suspendBtnText}>Suspend Access</Text>
                  </TouchableOpacity>
                )}

                {item.verification_status === 'suspended' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.activateBtn]}
                    onPress={() => handleUpdateStatus(item.id, 'activate')}
                  >
                    <Ionicons name="refresh" size={14} color={Colors.white} />
                    <Text style={styles.activateBtnText}>Reinstate Student</Text>
                  </TouchableOpacity>
                )}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 10,
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
  userCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  userDept: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  actionsRow: {
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
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  verifyBtn: {
    backgroundColor: Colors.success,
  },
  verifyBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  rejectBtn: {
    backgroundColor: Colors.dangerLight,
  },
  rejectBtnText: {
    color: Colors.dangerDark,
    fontSize: 12,
    fontWeight: '700',
  },
  suspendBtn: {
    backgroundColor: Colors.dangerLight,
  },
  suspendBtnText: {
    color: Colors.dangerDark,
    fontSize: 12,
    fontWeight: '700',
  },
  activateBtn: {
    backgroundColor: Colors.primary,
  },
  activateBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
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
