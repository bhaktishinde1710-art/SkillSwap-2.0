import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { userApi, sessionApi, matchingApi } from '../../src/services/api';
import { UserDetail, SessionItem, MentorRecommendation } from '../../src/types';
import { Colors, BorderRadius, Spacing } from '../../src/constants/theme';
import { TrustScoreBadge } from '../../src/components/TrustScoreBadge';
import { StatusBadge } from '../../src/components/StatusBadge';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserDetail | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<SessionItem[]>([]);
  const [recommendations, setRecommendations] = useState<MentorRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      const [profileData, sessionsData, recsData] = await Promise.allSettled([
        userApi.getProfile(),
        sessionApi.getSessions('all'),
        matchingApi.getDashboardRecommendations(),
      ]);

      if (profileData.status === 'fulfilled') {
        setProfile(profileData.value);
      }
      if (sessionsData.status === 'fulfilled') {
        const upcoming = sessionsData.value.filter(
          (s) => s.status === 'Accepted' || s.status === 'Scheduled' || s.status === 'Pending'
        );
        setUpcomingSessions(upcoming);
      }
      if (recsData.status === 'fulfilled') {
        setRecommendations(recsData.value);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
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
      {/* Verification Notice if Pending */}
      {!isVerified && (
        <View style={styles.verificationBanner}>
          <Ionicons name="information-circle" size={20} color={Colors.warningDark} />
          <View style={{ flex: 1 }}>
            <Text style={styles.verificationBannerTitle}>Campus Verification Pending</Text>
            <Text style={styles.verificationBannerText}>
              Your college profile is under review by VIT administration.
            </Text>
          </View>
        </View>
      )}

      {/* Header Greeting */}
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeInfo}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.first_name || 'Student'} {user?.last_name || ''}</Text>
          <Text style={styles.userDept}>
            {user?.department || 'Student'} • {user?.year || 'VIT Pune'}
          </Text>
        </View>

        {profile?.trust_score && (
          <View style={styles.scoreContainer}>
            <TrustScoreBadge score={profile.trust_score.score} size="lg" showLabel />
          </View>
        )}
      </View>

      {/* Quick Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="time" size={22} color={Colors.primary} />
          <Text style={styles.statValue}>{upcomingSessions.length}</Text>
          <Text style={styles.statLabel}>Active Sessions</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="school" size={22} color={Colors.secondary} />
          <Text style={styles.statValue}>{profile?.teaching_skills?.length || 0}</Text>
          <Text style={styles.statLabel}>Teaching Skills</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="checkmark-done" size={22} color={Colors.success} />
          <Text style={styles.statValue}>{profile?.completed_sessions_count || 0}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Quick Action Shortcuts */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
      </View>
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push('/(tabs)/explore')}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="search" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.actionBtnText}>Find Mentor</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push('/recommendations')}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#F5F3FF' }]}>
            <Ionicons name="sparkles" size={20} color={Colors.secondary} />
          </View>
          <Text style={styles.actionBtnText}>AI Match</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push('/(tabs)/bookings')}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="calendar" size={20} color={Colors.success} />
          </View>
          <Text style={styles.actionBtnText}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push('/profile/skills')}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="book" size={20} color={Colors.warningDark} />
          </View>
          <Text style={styles.actionBtnText}>My Skills</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming / Active Sessions Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/bookings')}>
          <Text style={styles.seeAllText}>See all ({upcomingSessions.length})</Text>
        </TouchableOpacity>
      </View>

      {upcomingSessions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="calendar-outline" size={36} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No Upcoming Sessions</Text>
          <Text style={styles.emptySubtitle}>Connect with a peer mentor to schedule your next learning session.</Text>
          <TouchableOpacity
            style={styles.emptyCta}
            onPress={() => router.push('/(tabs)/explore')}
          >
            <Text style={styles.emptyCtaText}>Explore Mentors</Text>
          </TouchableOpacity>
        </View>
      ) : (
        upcomingSessions.slice(0, 3).map((session) => {
          const isLearner = session.learner_id === user?.id;
          const counterpart = isLearner ? session.mentor : session.learner;
          return (
            <TouchableOpacity
              key={session.id}
              style={styles.sessionCard}
              activeOpacity={0.85}
              onPress={() => router.push(`/booking/${session.id}` as any)}
            >
              <View style={styles.sessionHeaderRow}>
                <View style={styles.sessionSkillTag}>
                  <Text style={styles.sessionSkillText}>{session.skill?.name || 'Peer Session'}</Text>
                </View>
                <StatusBadge status={session.status} />
              </View>

              <View style={styles.sessionDetails}>
                <Text style={styles.sessionPartner}>
                  {isLearner ? 'Mentor: ' : 'Learner: '}
                  <Text style={{ fontWeight: '700' }}>{counterpart?.full_name || counterpart?.first_name}</Text>
                </Text>
                <View style={styles.sessionMetaRow}>
                  <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.sessionMetaText}>{session.scheduled_date}</Text>
                  <Ionicons name="time-outline" size={14} color={Colors.textSecondary} style={{ marginLeft: 8 }} />
                  <Text style={styles.sessionMetaText}>{session.start_time} - {session.end_time}</Text>
                </View>
                <View style={styles.sessionMetaRow}>
                  <Ionicons
                    name={session.mode === 'Online' ? 'videocam-outline' : 'location-outline'}
                    size={14}
                    color={Colors.primary}
                  />
                  <Text style={[styles.sessionMetaText, { color: Colors.primary, fontWeight: '600' }]}>
                    {session.mode} {session.location ? `• ${session.location}` : ''}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}

      {/* AI Recommendations Section */}
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="sparkles" size={18} color={Colors.secondary} />
          <Text style={styles.sectionTitle}>AI Recommended Mentors</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/recommendations')}>
          <Text style={styles.seeAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      {recommendations.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="sparkles-outline" size={32} color={Colors.secondary} />
          <Text style={styles.emptyTitle}>AI Matching Available</Text>
          <Text style={styles.emptySubtitle}>
            Add learning interests in your profile to receive smart mentor suggestions.
          </Text>
          <TouchableOpacity
            style={[styles.emptyCta, { backgroundColor: Colors.secondary }]}
            onPress={() => router.push('/profile/skills')}
          >
            <Text style={styles.emptyCtaText}>Add Learning Interests</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recScroll}>
          {recommendations.map((rec) => (
            <TouchableOpacity
              key={rec.mentor.id}
              style={styles.recCard}
              activeOpacity={0.85}
              onPress={() => router.push(`/mentor/${rec.mentor.id}` as any)}
            >
              <View style={styles.recMatchBadge}>
                <Ionicons name="flash" size={12} color="#7C3AED" />
                <Text style={styles.recMatchText}>{Math.round(rec.match_score)}% Match</Text>
              </View>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{rec.mentor.first_name?.[0] || 'M'}</Text>
              </View>
              <Text style={styles.recName} numberOfLines={1}>
                {rec.mentor.full_name || rec.mentor.first_name}
              </Text>
              <Text style={styles.recDept} numberOfLines={1}>{rec.mentor.department}</Text>
              <View style={styles.recSkillChip}>
                <Text style={styles.recSkillText} numberOfLines={1}>{rec.matched_skill.name}</Text>
              </View>
              <Text style={styles.recExplanation} numberOfLines={2}>
                {rec.explanation}
              </Text>
              <TouchableOpacity
                style={styles.recBookBtn}
                onPress={() => router.push({
                  pathname: '/booking/new',
                  params: { mentor_id: rec.mentor.id, skill_id: rec.matched_skill.id }
                })}
              >
                <Text style={styles.recBookBtnText}>Book Session</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Admin Quick Shortcut if Admin */}
      {user?.role === 'admin' && (
        <TouchableOpacity
          style={styles.adminBanner}
          activeOpacity={0.85}
          onPress={() => router.push('/admin/index' as any)}
        >
          <View style={styles.adminBannerIcon}>
            <Ionicons name="shield-half" size={24} color={Colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.adminBannerTitle}>Administrator Suite</Text>
            <Text style={styles.adminBannerSubtitle}>Manage campus users, verify students, and oversee sessions</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.white} />
        </TouchableOpacity>
      )}
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
    backgroundColor: Colors.background,
  },
  verificationBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.warningLight,
    padding: 12,
    borderRadius: BorderRadius.md,
    marginBottom: 16,
    gap: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  verificationBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.warningDark,
  },
  verificationBannerText: {
    fontSize: 12,
    color: '#92400E',
    marginTop: 2,
  },
  welcomeCard: {
    backgroundColor: Colors.white,
    padding: 18,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
  },
  userDept: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
  },
  emptyCard: {
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
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  emptyCta: {
    marginTop: 14,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  emptyCtaText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  sessionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionSkillTag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  sessionSkillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  sessionDetails: {
    gap: 4,
  },
  sessionPartner: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  sessionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  sessionMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  recScroll: {
    flexDirection: 'row',
    marginBottom: 20,
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  recCard: {
    width: 220,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  recMatchBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    gap: 3,
  },
  recMatchText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C3AED',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  recName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  recDept: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  recSkillChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  recSkillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
  },
  recExplanation: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
    marginBottom: 12,
    height: 30,
  },
  recBookBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    alignItems: 'center',
  },
  recBookBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  adminBanner: {
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  adminBannerIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminBannerTitle: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  adminBannerSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
});
