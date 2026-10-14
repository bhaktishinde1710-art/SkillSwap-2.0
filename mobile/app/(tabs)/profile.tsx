import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { userApi } from '../../src/services/api';
import { UserDetail } from '../../src/types';
import { Colors, BorderRadius, Spacing } from '../../src/constants/theme';
import { TrustScoreBadge } from '../../src/components/TrustScoreBadge';
import { RatingStars } from '../../src/components/RatingStars';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();

  const [profile, setProfile] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await userApi.getProfile();
      setProfile(data);
    } catch (err) {
      console.warn('Failed to load profile:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
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

  const isVerified = user?.verification_status === 'verified';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
    >
      {/* Profile Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.first_name?.[0] || 'U'}</Text>
        </View>

        <Text style={styles.fullName}>
          {profile?.full_name || `${user?.first_name} ${user?.last_name}`}
        </Text>
        <Text style={styles.emailText}>{user?.college_email}</Text>

        <View style={styles.badgeRow}>
          <View style={[styles.verifBadge, isVerified ? styles.verifBadgeOk : styles.verifBadgePending]}>
            <Ionicons
              name={isVerified ? 'checkmark-circle' : 'time'}
              size={14}
              color={isVerified ? Colors.successDark : Colors.warningDark}
            />
            <Text
              style={[
                styles.verifBadgeText,
                isVerified ? { color: Colors.successDark } : { color: Colors.warningDark },
              ]}
            >
              {isVerified ? 'Campus Verified' : 'Verification Pending'}
            </Text>
          </View>

          {profile?.trust_score && (
            <TrustScoreBadge score={profile.trust_score.score} size="md" />
          )}
        </View>

        <Text style={styles.campusInfo}>
          {profile?.department || user?.department} • {profile?.year || user?.year}
        </Text>
        <Text style={styles.collegeName}>{user?.college}</Text>

        {profile?.bio ? (
          <Text style={styles.bioText}>{profile.bio}</Text>
        ) : null}

        {/* Reputation & Stats summary */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{profile?.completed_sessions_count || 0}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{profile?.teaching_skills?.length || 0}</Text>
            <Text style={styles.statLabel}>Teaching</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{profile?.learning_interests?.length || 0}</Text>
            <Text style={styles.statLabel}>Learning</Text>
          </View>
          <View style={styles.statBox}>
            <RatingStars rating={profile?.average_rating || 0} size={13} showText />
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </View>

      {/* Profile Management Menu Options */}
      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/profile/edit')}
        >
          <View style={[styles.menuIconBox, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="create-outline" size={20} color={Colors.primary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Edit Profile Information</Text>
            <Text style={styles.menuSubtitle}>Update bio, department, and academic year</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/profile/skills')}
        >
          <View style={[styles.menuIconBox, { backgroundColor: '#F5F3FF' }]}>
            <Ionicons name="ribbon-outline" size={20} color={Colors.secondary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Skills & Learning Interests</Text>
            <Text style={styles.menuSubtitle}>Manage teaching skills and target subjects</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/notifications')}
        >
          <View style={[styles.menuIconBox, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="notifications-outline" size={20} color={Colors.warningDark} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Notifications</Text>
            <Text style={styles.menuSubtitle}>View session updates and platform alerts</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/admin/index' as any)}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#1E293B' }]}>
              <Ionicons name="shield-outline" size={20} color={Colors.white} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: Colors.primary }]}>Admin Management Suite</Text>
              <Text style={styles.menuSubtitle}>Platform users, moderation, analytics</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Logout Option */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
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
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
  },
  fullName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  emailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  verifBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  verifBadgeOk: {
    backgroundColor: Colors.successLight,
  },
  verifBadgePending: {
    backgroundColor: Colors.warningLight,
  },
  verifBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  campusInfo: {
    fontSize: 13,
    color: Colors.text,
    marginTop: 10,
    fontWeight: '600',
  },
  collegeName: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  bioText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 10,
    paddingHorizontal: 8,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginTop: 16,
    paddingTop: 14,
    width: '100%',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  menuSection: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    gap: 8,
  },
  logoutText: {
    color: Colors.danger,
    fontSize: 15,
    fontWeight: '700',
  },
});
