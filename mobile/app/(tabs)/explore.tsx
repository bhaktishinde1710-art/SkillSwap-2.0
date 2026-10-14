import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { userApi, skillApi } from '../../src/services/api';
import { UserDetail } from '../../src/types';
import { Colors, BorderRadius, Spacing } from '../../src/constants/theme';
import { RatingStars } from '../../src/components/RatingStars';
import { TrustScoreBadge } from '../../src/components/TrustScoreBadge';

export default function ExploreScreen() {
  const router = useRouter();

  const [mentors, setMentors] = useState<UserDetail[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMentorsAndCategories = useCallback(async () => {
    try {
      const [cats, mentorList] = await Promise.all([
        skillApi.getCategories().catch(() => []),
        userApi.getMentors({ search: searchQuery.trim() || undefined }),
      ]);
      setCategories(['All', ...cats]);
      setMentors(mentorList);
    } catch (err) {
      console.warn('Failed to load mentors:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchMentorsAndCategories();
  }, [fetchMentorsAndCategories]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMentorsAndCategories();
  };

  // Filter mentors by selected category
  const filteredMentors = mentors.filter((mentor) => {
    if (selectedCategory === 'All') return true;
    return mentor.teaching_skills?.some(
      (ts) => ts.skill?.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  });

  const renderMentorCard = ({ item }: { item: UserDetail }) => {
    const verified = item.verification_status === 'verified';
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => router.push(`/mentor/${item.id}` as any)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.first_name?.[0] || 'U'}</Text>
          </View>

          <View style={styles.cardInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.mentorName} numberOfLines={1}>
                {item.full_name || `${item.first_name} ${item.last_name}`}
              </Text>
              {verified && (
                <Ionicons name="checkmark-circle" size={16} color={Colors.primary} style={{ marginLeft: 4 }} />
              )}
            </View>
            <Text style={styles.deptText} numberOfLines={1}>
              {item.department} • {item.year}
            </Text>
            <View style={styles.ratingRow}>
              <RatingStars rating={item.average_rating || 0} size={14} showText />
              <Text style={styles.reviewCount}>({item.total_reviews_count || 0})</Text>
            </View>
          </View>

          {item.trust_score && (
            <View style={styles.trustBadgeWrapper}>
              <TrustScoreBadge score={item.trust_score.score} size="md" />
            </View>
          )}
        </View>

        {item.bio ? (
          <Text style={styles.bioText} numberOfLines={2}>
            {item.bio}
          </Text>
        ) : null}

        {/* Teaching Skills Chips */}
        <View style={styles.skillsContainer}>
          {item.teaching_skills?.slice(0, 3).map((ts) => (
            <View key={ts.id} style={styles.skillPill}>
              <Text style={styles.skillName}>{ts.skill?.name}</Text>
              <Text style={styles.skillLevel}>{ts.proficiency_level}</Text>
            </View>
          ))}
          {(item.teaching_skills?.length || 0) > 3 && (
            <View style={[styles.skillPill, { backgroundColor: '#F1F5F9' }]}>
              <Text style={[styles.skillName, { color: Colors.textSecondary }]}>
                +{(item.teaching_skills?.length || 0) - 3}
              </Text>
            </View>
          )}
        </View>

        {/* Card Footer Actions */}
        <View style={styles.cardFooter}>
          <View style={styles.sessionsCount}>
            <Ionicons name="school-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.sessionsText}>
              {item.completed_sessions_count || 0} sessions taught
            </Text>
          </View>

          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => router.push({
              pathname: '/booking/new',
              params: { mentor_id: item.id }
            })}
          >
            <Text style={styles.bookButtonText}>Book Session</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Input Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by mentor or skill..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.aiButton}
          onPress={() => router.push('/recommendations')}
        >
          <Ionicons name="sparkles" size={18} color={Colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Category Chips Bar */}
      <View style={styles.categoryBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, active && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Mentor Cards List */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredMentors}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMentorCard}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={44} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Mentors Found</Text>
              <Text style={styles.emptyDesc}>
                {searchQuery || selectedCategory !== 'All'
                  ? 'Try adjusting your search filters or browse other categories.'
                  : 'No mentors are currently available.'}
              </Text>
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
  searchBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: 10,
    backgroundColor: Colors.white,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  aiButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBar: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 8,
  },
  categoryScroll: {
    paddingHorizontal: Spacing.lg,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: Colors.white,
  },
  listContent: {
    padding: Spacing.lg,
    gap: 14,
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
    alignItems: 'flex-start',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  cardInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mentorName: {
    fontSize: 16,
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
  reviewCount: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  trustBadgeWrapper: {
    alignItems: 'flex-end',
  },
  bioText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 10,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  skillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  skillName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  skillLevel: {
    fontSize: 10,
    color: Colors.primaryHover,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  sessionsCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sessionsText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
  },
  bookButtonText: {
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
