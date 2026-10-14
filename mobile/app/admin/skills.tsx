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
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { skillApi, adminApi } from '../../src/services/api';
import { Skill } from '../../src/types';
import { Colors, BorderRadius, Spacing } from '../../src/constants/theme';

export default function AdminSkillsScreen() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // New Skill Modal
  const [showModal, setShowModal] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState('Programming');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSkills = useCallback(async () => {
    try {
      const data = await skillApi.getSkills();
      setSkills(data);
    } catch (err) {
      console.warn('Failed to load skills:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSkills();
  };

  const handleCreateSkill = async () => {
    if (!skillName.trim() || !category.trim()) {
      Alert.alert('Required', 'Please enter skill name and category');
      return;
    }

    try {
      setSubmitting(true);
      await adminApi.createSkill({
        name: skillName.trim(),
        category: category.trim(),
        description: description.trim() || undefined,
      });

      setSkillName('');
      setDescription('');
      setShowModal(false);
      fetchSkills();
      Alert.alert('Success', 'Skill successfully created and published');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail || 'Failed to create skill');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSkill = (skillId: number, name: string) => {
    Alert.alert('Delete Skill', `Are you sure you want to delete "${name}" from the campus catalog?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminApi.deleteSkill(skillId);
            fetchSkills();
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.detail || 'Failed to delete skill');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topCount}>{skills.length} Registered Skills</Text>
        <TouchableOpacity style={styles.createBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={16} color={Colors.white} />
          <Text style={styles.createBtnText}>Add New Skill</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={skills}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.skillName}>{item.name}</Text>
                <Text style={styles.categoryBadge}>{item.category}</Text>
                {item.description ? (
                  <Text style={styles.descText} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={styles.delBtn}
                onPress={() => handleDeleteSkill(item.id, item.name)}
              >
                <Ionicons name="trash-outline" size={18} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Add Skill Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Campus Skill</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Skill Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Flutter & Dart"
                placeholderTextColor={Colors.textMuted}
                value={skillName}
                onChangeText={setSkillName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Mobile Development"
                placeholderTextColor={Colors.textMuted}
                value={category}
                onChangeText={setCategory}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Brief description of learning scope..."
                placeholderTextColor={Colors.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={[styles.modalSubmitBtn, submitting && { opacity: 0.7 }]}
              onPress={handleCreateSkill}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.modalSubmitText}>Publish Skill</Text>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topCount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  createBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: Spacing.lg,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  skillName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  categoryBadge: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  descText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  delBtn: {
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
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 14,
    color: Colors.text,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
    paddingVertical: 8,
  },
  modalSubmitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  modalSubmitText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
