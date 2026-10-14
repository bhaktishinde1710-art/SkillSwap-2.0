import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { userApi, sessionApi } from '../../src/services/api';
import { UserDetail, ReviewItem } from '../../src/types';
import { Colors, BorderRadius, Spacing } from '../../src/constants/theme';
import { RatingStars } from '../../src/components/RatingStars';
import { TrustScoreBadge } from '../../src/components/TrustScoreBadge';

export default function MentorProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [mentor, setMentor] = useState<UserDetail | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentorDetails = async () => {
      if (!id) return;
      try {
        const mentorId = parseInt(id, 10);
        const [detail, reviewList] = await Promise.all([
          userApi.getMentorById(mentorId),
          sessionApi.getUserReviews(mentorId).catch(() => []),
        ]);
        setMentor(detail);
        setReviews(reviewList);
      } catch (err) {
        console.warn('Failed to load mentor details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!mentor) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.notFoundText}>Mentor not found</Text>
      </View>
    );
  }

  const verified = mentor.verification_status === 'verified';

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{mentor.first_name?.[0] || 'M'}</Text>
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.name}>{mentor.full_name || mentor.first_name}</Text>
            {verified && (
              <Ionicons name="checkmark-circle" size={18} color={Colors.primary} style={{ marginLeft: 6 }} />
            )}
          </View>

          <Text style={styles.deptText}>
            {mentor.department} • {mentor.year}
          </Text>
          <Text style={styles.collegeText}>{mentor.college}</Text>

          <View style={styles.badgeRow}>
            <RatingStars rating={mentor.average_rating || 0} size={15} showText />
            <Text style={styles.reviewCount}>({mentor.total_reviews_count || 0} reviews)</Text>
            {mentor.trust_score && (
              <TrustScoreBadge score={mentor.trust_score.score} size="md" showLabel />
            )}
          </View>

          {mentor.bio ? (
            <Text style={styles.bio}>{mentor.bio}</Text>
          ) : null}
        </View>

        {/* Trust Score Breakdown */}
        {mentor.trust_score && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Trust & Verification Breakdown</Text>
            <View style={styles.trustGrid}>
              <View style={styles.trustItem}>
                <Text style={styles.trustVal}>{mentor.trust_score.reliability_score}%</Text>
                <Text style={styles.trustLabel}>Reliability</Text>
              </View>
              <View style={styles.trustItem}>
                <Text style={styles.trustVal}>{mentor.trust_score.teaching_score}%</Text>
                <Text style={styles.trustLabel}>Teaching</Text>
              </View>
              <View style={styles.trustItem}>
                <Text style={styles.trustVal}>{mentor.trust_score.completion_score}%</Text>
                <Text style={styles.trustLabel}>Completion</Text>
              </View>
              <View style={styles.trustItem}>
                <Text style={styles.trustVal}>{mentor.completed_sessions_count}</Text>
                <Text style={styles.trustLabel}>Sessions</Text>
              </View>
            </View>
          </View>
        )}

        {/* Teaching Skills */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Teaching Skills</Text>
          <View style={styles.skillsGrid}>
            {mentor.teaching_skills?.map((ts) => (
              <View key={ts.id} style={styles.skillBox}>
                <Text style={styles.skillBoxName}>{ts.skill?.name}</Text>
                <Text style={styles.skillBoxCategory}>{ts.skill?.category}</Text>
                <View style={styles.skillBoxMeta}>
                  <Text style={styles.skillBoxBadge}>{ts.proficiency_level}</Text>
                  <Text style={styles.skillExp}>{ts.years_of_experience}y experience</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Availability Schedule */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Availability Schedule</Text>
          {mentor.availabilities && mentor.availabilities.length > 0 ? (
            <View style={styles.availList}>
              {mentor.availabilities
                .filter((a) => a.available)
                .map((a) => (
                  <View key={a.day} style={styles.availRow}>
                    <Text style={styles.availDay}>{a.day}</Text>
                    <Text style={styles.availTime}>
                      {a.start_time} - {a.end_time}
                    </Text>
                  </View>
                ))}
            </View>
          ) : (
            <Text style={styles.emptyNotice}>Flexible schedule upon booking.</Text>
          )}
        </View>

        {/* Reviews Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Student Reviews ({reviews.length})</Text>
          {reviews.length === 0 ? (
            <Text style={styles.emptyNotice}>No reviews recorded yet for this mentor.</Text>
          ) : (
            reviews.map((r) => (
              <View key={r.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{r.reviewer?.full_name || 'VIT Student'}</Text>
                  <RatingStars rating={r.rating} size={12} />
                </View>
                <Text style={styles.reviewComment}>{r.comment}</Text>
                <Text style={styles.reviewDate}>{r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bookCta}
          activeOpacity={0.85}
          onPress={() => router.push({
            pathname: '/booking/new',
            params: { mentor_id: mentor.id }
          })}
        >
          <Ionicons name="calendar" size={18} color={Colors.white} />
          <Text style={styles.bookCtaText}>Book Session with {mentor.first_name}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 90,
  },
  headerCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  deptText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  collegeText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  reviewCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bio: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 12,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  trustGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: 12,
  },
  trustItem: {
    flex: 1,
    alignItems: 'center',
  },
  trustVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  trustLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  skillsGrid: {
    gap: 10,
  },
  skillBox: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  skillBoxName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  skillBoxCategory: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  skillBoxMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  skillBoxBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  skillExp: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  availList: {
    gap: 8,
  },
  availRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  availDay: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  availTime: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyNotice: {
    fontSize: 13,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingVertical: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  reviewComment: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  reviewDate: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bookCta: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bookCtaText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
