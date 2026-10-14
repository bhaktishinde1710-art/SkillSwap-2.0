import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { matchingApi, skillApi } from '../src/services/api';
import { MentorRecommendation, Skill } from '../src/types';
import { Colors, BorderRadius, Spacing } from '../src/constants/theme';
import { TrustScoreBadge } from '../src/components/TrustScoreBadge';
import { RatingStars } from '../src/components/RatingStars';

export default function RecommendationsScreen() {
  const router = useRouter();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [recommendations, setRecommendations] = useState<MentorRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [querying, setQuerying] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        const [allSkills, initialRecs] = await Promise.all([
          skillApi.getSkills(),
          matchingApi.getDashboardRecommendations().catch(() => []),
        ]);
        setSkills(allSkills);
        setRecommendations(initialRecs);
        if (allSkills.length > 0) {
          setSelectedSkill(allSkills[0]);
        }
      } catch (err) {
        console.warn('Failed to load recommendation data:', err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  const handleSelectSkill = async (skill: Skill) => {
    setSelectedSkill(skill);
    try {
      setQuerying(true);
      const results = await matchingApi.recommendMentors({
        skill_id: skill.id,
      });
      setRecommendations(results);
    } catch (err) {
      console.warn('Matching query failed:', err);
    } finally {
      setQuerying(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Skill Selector Bar */}
      <View style={styles.selectorBar}>
        <Text style={styles.selectorTitle}>Select Target Skill for AI Matching:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.skillList}>
          {skills.map((s) => {
            const active = selectedSkill?.id === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.skillChip, active && styles.skillChipActive]}
                onPress={() => handleSelectSkill(s)}
              >
                <Text style={[styles.skillChipText, active && styles.skillChipTextActive]}>
                  {s.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="sparkles" size={18} color={Colors.secondary} />
          <Text style={styles.resultsTitle}>
            {recommendations.length} Best Mentor Matches
          </Text>
        </View>
        {selectedSkill && (
          <Text style={styles.resultsSubtitle}>for {selectedSkill.name}</Text>
        )}
      </View>

      {querying ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.secondary} />
          <Text style={{ marginTop: 10, color: Colors.textSecondary, fontSize: 13 }}>
            Computing AI similarity scores...
          </Text>
        </View>
      ) : (
        <FlatList
          data={recommendations}
          keyExtractor={(item) => `${item.mentor.id}-${item.matched_skill.id}`}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={44} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Matching Mentors Yet</Text>
              <Text style={styles.emptyDesc}>
                There are currently no active mentors offering this skill. Try selecting a different topic.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.recCard}>
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.mentor.first_name?.[0]}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.mentorName}>
                      {item.mentor.full_name || item.mentor.first_name}
                    </Text>
                  </View>
                  <Text style={styles.deptText}>
                    {item.mentor.department} • {item.mentor.year}
                  </Text>
                  <View style={styles.ratingRow}>
                    <RatingStars rating={item.average_rating || 0} size={13} showText />
                    <Text style={styles.expText}>• {item.years_of_experience}y exp</Text>
                  </View>
                </View>

                {/* Match Score Badge */}
                <View style={styles.matchScoreBadge}>
                  <Ionicons name="flash" size={14} color="#7C3AED" />
                  <Text style={styles.matchScoreText}>{Math.round(item.match_score)}%</Text>
                  <Text style={styles.matchScoreSub}>Match</Text>
                </View>
              </View>

              {/* AI Explanation Callout */}
              <View style={styles.explanationBox}>
                <Ionicons name="sparkles" size={14} color={Colors.secondary} style={{ marginTop: 2 }} />
                <Text style={styles.explanationText}>{item.explanation}</Text>
              </View>

              {/* Trust & Meta Row */}
              <View style={styles.cardFooter}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {item.trust_score ? (
                    <TrustScoreBadge score={item.trust_score} size="sm" />
                  ) : null}
                  <Text style={styles.completedSessionsText}>
                    {item.completed_sessions} taught
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() =>
                    router.push({
                      pathname: '/booking/new',
                      params: {
                        mentor_id: item.mentor.id,
                        skill_id: item.matched_skill.id,
                      },
                    })
                  }
                >
                  <Text style={styles.bookBtnText}>Book Session</Text>
                </TouchableOpacity>
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
  selectorBar: {
    backgroundColor: Colors.white,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectorTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginHorizontal: Spacing.lg,
    marginBottom: 8,
  },
  skillList: {
    paddingHorizontal: Spacing.lg,
    gap: 8,
  },
  skillChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  skillChipActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  skillChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  skillChipTextActive: {
    color: Colors.white,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
  },
  resultsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  resultsSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 30,
    gap: 14,
  },
  recCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mentorName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  deptText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  expText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  matchScoreBadge: {
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  matchScoreText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#7C3AED',
  },
  matchScoreSub: {
    fontSize: 9,
    color: '#7C3AED',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  explanationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: 10,
    marginTop: 12,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary,
  },
  explanationText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  completedSessionsText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  bookBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
  },
  bookBtnText: {
    color: Colors.white,
    fontSize: 12,
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
});
