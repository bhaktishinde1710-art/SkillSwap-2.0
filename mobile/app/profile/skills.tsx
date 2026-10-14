import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userApi, skillApi } from '../../src/services/api';
import { UserDetail, Skill, SkillProficiency, SkillPriority } from '../../src/types';
import { Colors, BorderRadius, Spacing } from '../../src/constants/theme';

const PROFICIENCY_LEVELS: SkillProficiency[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const PRIORITIES: SkillPriority[] = ['Low', 'Medium', 'High'];

export default function SkillsManagementScreen() {
  const [activeTab, setActiveTab] = useState<'teaching' | 'interests'>('teaching');
  const [profile, setProfile] = useState<UserDetail | null>(null);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for adding
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [proficiency, setProficiency] = useState<SkillProficiency>('Intermediate');
  const [yearsOfExp, setYearsOfExp] = useState(1);
  const [priority, setPriority] = useState<SkillPriority>('High');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [profileData, skillsData] = await Promise.all([
        userApi.getProfile(),
        skillApi.getSkills(),
      ]);
      setProfile(profileData);
      setAllSkills(skillsData);
      if (skillsData.length > 0) {
        setSelectedSkillId(skillsData[0].id);
      }
    } catch (err) {
      console.warn('Failed to load skills management data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRemoveTeaching = async (userSkillId: number) => {
    Alert.alert('Remove Skill', 'Are you sure you want to stop offering this teaching skill?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await skillApi.removeTeachingSkill(userSkillId);
            fetchData();
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.detail || 'Failed to remove skill');
          }
        },
      },
    ]);
  };

  const handleRemoveInterest = async (interestId: number) => {
    Alert.alert('Remove Interest', 'Remove this learning goal from your profile?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await skillApi.removeLearningInterest(interestId);
            fetchData();
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.detail || 'Failed to remove interest');
          }
        },
      },
    ]);
  };

  const handleAddSubmit = async () => {
    if (!selectedSkillId) {
      Alert.alert('Error', 'Please select a skill');
      return;
    }

    try {
      setSubmitting(true);
      if (activeTab === 'teaching') {
        await skillApi.addTeachingSkill({
          skill_id: selectedSkillId,
          proficiency_level: proficiency,
          years_of_experience: yearsOfExp,
        });
      } else {
        await skillApi.addLearningInterest({
          skill_id: selectedSkillId,
          desired_level: proficiency,
          priority,
        });
      }
      setShowAddModal(false);
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail || 'Failed to add entry');
    } finally {
      setSubmitting(false);
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
      {/* Segment Switcher */}
      <View style={styles.segmentBar}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'teaching' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('teaching')}
        >
          <Text style={[styles.segmentText, activeTab === 'teaching' && styles.segmentTextActive]}>
            Teaching Skills ({profile?.teaching_skills?.length || 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'interests' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('interests')}
        >
          <Text style={[styles.segmentText, activeTab === 'interests' && styles.segmentTextActive]}>
            Learning Goals ({profile?.learning_interests?.length || 0})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'teaching' ? (
          <View style={styles.listSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Skills You Can Mentor</Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setShowAddModal(true)}
              >
                <Ionicons name="add" size={16} color={Colors.white} />
                <Text style={styles.addBtnText}>Add Skill</Text>
              </TouchableOpacity>
            </View>

            {profile?.teaching_skills?.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="school-outline" size={40} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>No Teaching Skills Added</Text>
                <Text style={styles.emptySubtitle}>
                  Add the programming languages, subjects, and frameworks you want to teach other students.
                </Text>
              </View>
            ) : (
              profile?.teaching_skills?.map((ts) => (
                <View key={ts.id} style={styles.itemCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{ts.skill?.name}</Text>
                    <Text style={styles.itemCategory}>{ts.skill?.category}</Text>
                    <View style={styles.itemMetaRow}>
                      <View style={styles.badgeBox}>
                        <Text style={styles.badgeText}>{ts.proficiency_level}</Text>
                      </View>
                      <Text style={styles.expText}>{ts.years_of_experience}y exp</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleRemoveTeaching(ts.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        ) : (
          <View style={styles.listSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Skills You Want to Learn</Text>
              <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: Colors.secondary }]}
                onPress={() => setShowAddModal(true)}
              >
                <Ionicons name="add" size={16} color={Colors.white} />
                <Text style={styles.addBtnText}>Add Goal</Text>
              </TouchableOpacity>
            </View>

            {profile?.learning_interests?.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="book-outline" size={40} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>No Learning Goals Added</Text>
                <Text style={styles.emptySubtitle}>
                  Add skills you want to learn so the AI recommendation system can match you with the best mentors.
                </Text>
              </View>
            ) : (
              profile?.learning_interests?.map((li) => (
                <View key={li.id} style={styles.itemCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{li.skill?.name}</Text>
                    <Text style={styles.itemCategory}>{li.skill?.category}</Text>
                    <View style={styles.itemMetaRow}>
                      <View style={[styles.badgeBox, { backgroundColor: '#F5F3FF' }]}>
                        <Text style={[styles.badgeText, { color: Colors.secondary }]}>
                          Target: {li.desired_level}
                        </Text>
                      </View>
                      <Text style={[styles.expText, { color: Colors.warningDark }]}>
                        {li.priority} Priority
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleRemoveInterest(li.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeTab === 'teaching' ? 'Add Teaching Skill' : 'Add Learning Interest'}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {/* Choose Skill */}
            <Text style={styles.modalLabel}>Select Skill</Text>
            <ScrollView style={{ maxHeight: 120, marginBottom: 12 }}>
              <View style={styles.skillWrap}>
                {allSkills.map((sk) => {
                  const sel = selectedSkillId === sk.id;
                  return (
                    <TouchableOpacity
                      key={sk.id}
                      style={[styles.modalSkillChip, sel && styles.modalSkillChipActive]}
                      onPress={() => setSelectedSkillId(sk.id)}
                    >
                      <Text style={[styles.modalSkillText, sel && styles.modalSkillTextActive]}>
                        {sk.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Proficiency Level */}
            <Text style={styles.modalLabel}>
              {activeTab === 'teaching' ? 'Your Proficiency' : 'Target Goal Level'}
            </Text>
            <View style={styles.optionRow}>
              {PROFICIENCY_LEVELS.map((lvl) => {
                const sel = proficiency === lvl;
                return (
                  <TouchableOpacity
                    key={lvl}
                    style={[styles.optionChip, sel && styles.optionChipActive]}
                    onPress={() => setProficiency(lvl)}
                  >
                    <Text style={[styles.optionText, sel && styles.optionTextActive]}>{lvl}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {activeTab === 'teaching' ? (
              <>
                <Text style={styles.modalLabel}>Years of Experience</Text>
                <View style={styles.optionRow}>
                  {[1, 2, 3, 4, 5].map((y) => {
                    const sel = yearsOfExp === y;
                    return (
                      <TouchableOpacity
                        key={y}
                        style={[styles.optionChip, sel && styles.optionChipActive]}
                        onPress={() => setYearsOfExp(y)}
                      >
                        <Text style={[styles.optionText, sel && styles.optionTextActive]}>{y}y</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalLabel}>Learning Priority</Text>
                <View style={styles.optionRow}>
                  {PRIORITIES.map((p) => {
                    const sel = priority === p;
                    return (
                      <TouchableOpacity
                        key={p}
                        style={[styles.optionChip, sel && styles.optionChipActive]}
                        onPress={() => setPriority(p)}
                      >
                        <Text style={[styles.optionText, sel && styles.optionTextActive]}>{p}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            <TouchableOpacity
              style={[styles.modalSubmitBtn, submitting && { opacity: 0.7 }]}
              onPress={handleAddSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.modalSubmitText}>Save to Profile</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  segmentBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  segmentBtnActive: {
    backgroundColor: Colors.primaryLight,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  content: {
    padding: Spacing.lg,
  },
  listSection: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  addBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
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
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  itemCategory: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  badgeBox: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  expText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  deleteBtn: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 8,
  },
  skillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modalSkillChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  modalSkillChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modalSkillText: {
    fontSize: 12,
    color: Colors.text,
  },
  modalSkillTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  optionChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  optionChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  optionTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  modalSubmitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  modalSubmitText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
