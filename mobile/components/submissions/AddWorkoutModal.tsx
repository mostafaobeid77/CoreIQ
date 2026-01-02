import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { submissionService, WorkoutSubmissionData } from '../../services/submissionService';
import { api } from '../../services/api';
import { useTheme } from '../../context/themeContext';
import { Colors } from '../../constants/theme';
import { useWorkoutSearch } from '../../hooks/workouts/useWorkoutSearch';
import { useDebounce } from '../../hooks/meals/useDebounce';

const { width } = Dimensions.get('window');

interface AddWorkoutModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddWorkoutModal: React.FC<AddWorkoutModalProps> = ({ visible, onClose, onSuccess }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const colors = Colors[theme];

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [existsWarning, setExistsWarning] = useState(false);
  const [searching, setSearching] = useState(false);

  const [formData, setFormData] = useState<WorkoutSubmissionData>({
    name: '',
    description: '',
    category: '',
    muscle_group: '',
    equipment: '',
  });

  const { searchWorkouts } = useWorkoutSearch();
  const debouncedName = useDebounce(formData.name, 600);

  useEffect(() => {
    if (visible) {
      fetchMetadata();
      resetForm();
      setIsSuccess(false);
    }
  }, [visible]);

  // Real-time existence check
  useEffect(() => {
    const checkExistence = async () => {
      if (debouncedName.trim().length < 3) {
        setExistsWarning(false);
        return;
      }

      setSearching(true);
      try {
        const results = await searchWorkouts(debouncedName);
        const exactMatch = results.some(
          (w: any) => w.name.toLowerCase() === debouncedName.trim().toLowerCase()
        );
        setExistsWarning(exactMatch);
      } catch (error) {
        console.error('Check existence failed:', error);
      } finally {
        setSearching(false);
      }
    };

    checkExistence();
  }, [debouncedName]);

  const fetchMetadata = async () => {
    try {
      setLoading(true);
      const [categoriesData, muscleGroupsData] = await Promise.all([
        api.get<string[]>('/workouts/categories'),
        api.get<string[]>('/workouts/muscle-groups'),
      ]);

      setCategories(categoriesData);
      setMuscleGroups(muscleGroupsData);

      if (categoriesData.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: categoriesData[0] }));
      }
      if (muscleGroupsData.length > 0 && !formData.muscle_group) {
        setFormData(prev => ({ ...prev, muscle_group: muscleGroupsData[0] }));
      }
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
      setCategories(['Strength', 'Cardio']);
      setMuscleGroups(['Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core', 'Cardio']);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: categories[0] || '',
      muscle_group: muscleGroups[0] || '',
      equipment: '',
    });
    setExistsWarning(false);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.description.trim() || !formData.category || !formData.muscle_group) {
      return;
    }

    try {
      setSubmitting(true);
      await submissionService.submitWorkout(formData);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error('Submission failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.card, { alignItems: 'center', padding: 40, backgroundColor: colors.background }]}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={50} color="#fff" />
            </View>
            <Text style={[styles.title, { color: colors.text, marginTop: 24 }]}>Submission Sent!</Text>
            <Text style={[styles.subtitle, { color: isLight ? '#64748b' : '#94a3b8', textAlign: 'center', marginTop: 12 }]}>
              Our admins will review your workout soon. You'll be notified once it's live!
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: isLight ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.6)' }]} />

          <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()} style={[styles.card, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Add New Workout</Text>
              <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: isLight ? '#f3f4f6' : '#334155' }]}>
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <View style={[styles.infoBanner, { backgroundColor: isLight ? '#f5f3ff' : 'rgba(139, 92, 246, 0.1)' }]}>
                <Ionicons name="sparkles" size={18} color="#8b5cf6" />
                <Text style={[styles.infoText, { color: isLight ? '#7c3aed' : '#a78bfa' }]}>
                  Help us grow! Submit workouts for review.
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Workout Name</Text>
                <View style={[styles.inputContainer, { borderColor: existsWarning ? '#ef4444' : isLight ? '#e2e8f0' : '#334155' }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="e.g. Barbell Bench Press"
                    placeholderTextColor={isLight ? '#94a3b8' : '#64748b'}
                    value={formData.name}
                    onChangeText={text => setFormData(prev => ({ ...prev, name: text }))}
                  />
                  {searching && <ActivityIndicator size="small" color="#8b5cf6" style={{ marginRight: 12 }} />}
                </View>
                {existsWarning && (
                  <View style={styles.warningBox}>
                    <Ionicons name="warning" size={14} color="#ef4444" />
                    <Text style={styles.warningText}>This workout already exists!</Text>
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                  {categories.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setFormData(prev => ({ ...prev, category: cat }))}
                      style={[
                        styles.chip,
                        { backgroundColor: isLight ? '#f1f5f9' : '#1e1e1e' },
                        formData.category === cat && styles.chipActive
                      ]}
                    >
                      <Text style={[styles.chipText, { color: isLight ? '#64748b' : '#94a3b8' }, formData.category === cat && styles.chipTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Muscle Group</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                  {muscleGroups.map(group => (
                    <TouchableOpacity
                      key={group}
                      onPress={() => setFormData(prev => ({ ...prev, muscle_group: group }))}
                      style={[
                        styles.chip,
                        { backgroundColor: isLight ? '#f1f5f9' : '#1e1e1e' },
                        formData.muscle_group === group && styles.chipActive
                      ]}
                    >
                      <Text style={[styles.chipText, { color: isLight ? '#64748b' : '#94a3b8' }, formData.muscle_group === group && styles.chipTextActive]}>
                        {group}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { color: colors.text, borderColor: isLight ? '#e2e8f0' : '#334155' }]}
                  placeholder="How to perform it, safety tips, etc."
                  placeholderTextColor={isLight ? '#94a3b8' : '#64748b'}
                  multiline
                  value={formData.description}
                  onChangeText={text => setFormData(prev => ({ ...prev, description: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Equipment (Optional)</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: isLight ? '#e2e8f0' : '#334155', borderBottomWidth: 1, paddingVertical: 12 }]}
                  placeholder="e.g. Barbell, Dumbbells"
                  placeholderTextColor={isLight ? '#94a3b8' : '#64748b'}
                  value={formData.equipment}
                  onChangeText={text => setFormData(prev => ({ ...prev, equipment: text }))}
                />
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting || !formData.name || !formData.description}
                style={[styles.submitButton, (submitting || !formData.name || !formData.description) && { opacity: 0.6 }]}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.submitText}>Submit for Review</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: width * 0.92,
    maxHeight: '85%',
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 12,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
  },
  chipScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 4,
  },
  warningText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    marginTop: 10,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
});

export default AddWorkoutModal;

