import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { adminApi } from '../../src/services/api';
import { AdminOverview } from '../../src/types';
import { Colors, BorderRadius, Spacing } from '../../src/constants/theme';

export default function AdminIndexScreen() {
  const router = useRouter();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = useCallback(async () => {
    try {
      const data = await adminApi.getOverview();
      setOverview(data);
    } catch (err) {
      console.warn('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOverview();
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>VIT Campus Administration</Text>
        <Text style={styles.headerSubtitle}>SkillSwap 2.0 Management & Verification Hub</Text>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Ionicons name="people" size={24} color={Colors.primary} />
          <Text style={styles.metricVal}>{overview?.total_students || 0}</Text>
          <Text style={styles.metricLabel}>Total Students</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="checkmark-done-circle" size={24} color={Colors.success} />
          <Text style={styles.metricVal}>{overview?.verified_students || 0}</Text>
          <Text style={styles.metricLabel}>Verified Students</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="school" size={24} color={Colors.secondary} />
          <Text style={styles.metricVal}>{overview?.active_mentors || 0}</Text>
          <Text style={styles.metricLabel}>Active Mentors</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="calendar" size={24} color={Colors.info} />
          <Text style={styles.metricVal}>{overview?.total_sessions || 0}</Text>
          <Text style={styles.metricLabel}>Total Sessions</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="pie-chart" size={24} color="#059669" />
          <Text style={styles.metricVal}>{overview?.completion_rate ? `${Math.round(overview.completion_rate)}%` : '0%'}</Text>
          <Text style={styles.metricLabel}>Completion Rate</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="star" size={24} color="#D97706" />
          <Text style={styles.metricVal}>{overview?.average_rating ? overview.average_rating.toFixed(1) : '5.0'}</Text>
          <Text style={styles.metricLabel}>Average Rating</Text>
        </View>
      </View>

      {/* Administrative Navigation Menu */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Management Modules</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/admin/users')}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="person-circle-outline" size={22} color={Colors.primary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>User Verification & Directory</Text>
            <Text style={styles.menuDesc}>Approve pending campus students, suspend or restore access</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/admin/sessions')}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="calendar-outline" size={22} color={Colors.success} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Sessions Oversight</Text>
            <Text style={styles.menuDesc}>Inspect all peer learning sessions and statuses</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/admin/skills')}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#F5F3FF' }]}>
            <Ionicons name="ribbon-outline" size={22} color={Colors.secondary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Skills Catalog</Text>
            <Text style={styles.menuDesc}>Add new learning topics and manage skill categories</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/admin/reports')}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="flag-outline" size={22} color={Colors.danger} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Reports & Moderation</Text>
            <Text style={styles.menuDesc}>Review flagged students and moderate feedback</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
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
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  menuContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  menuDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
