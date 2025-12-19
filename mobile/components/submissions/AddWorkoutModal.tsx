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
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { submissionService, WorkoutSubmissionData } from '../../services/submissionService';
import { api } from '../../services/api';
import { useTheme } from '../../context/themeContext';
import { Colors } from '../../constants/theme';

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

  const [formData, setFormData] = useState<WorkoutSubmissionData>({
    name: '',
    description: '',
    category: '',
    muscle_group: '',
    equipment: '',
  });

  useEffect(() => {
    if (visible) {
      fetchMetadata();
      resetForm();
    }
  }, [visible]);

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
      // Fallback values
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
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (!formData.muscle_group) {
      Alert.alert('Error', 'Please select a muscle group');
      return;
    }

    try {
      setSubmitting(true);
      await submissionService.submitWorkout(formData);
      Alert.alert(
        'Submission Sent',
        'Your workout has been submitted for admin approval. You will be notified once it is reviewed.',
        [
          {
            text: 'OK',
            onPress: () => {
              resetForm();
              onClose();
              onSuccess?.();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Submission Failed', error?.message || 'Failed to submit workout');
    } finally {
      setSubmitting(false);
    }
  };

  const dynamicStyles = {
    overlay: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
    modalContent: { 
      backgroundColor: colors.background,
      width: '92%',
      maxWidth: 500,
    },
    header: { borderBottomColor: isLight ? '#e2e8f0' : '#334155' },
    title: { color: colors.text },
    closeButton: {
      position: 'absolute',
      right: 16,
      top: 16,
      zIndex: 10,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isLight ? '#f1f5f9' : '#334155',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButtonIcon: { color: colors.text },
    infoBox: { backgroundColor: isLight ? '#eff6ff' : '#1e3a5f' },
    infoText: { color: isLight ? '#1e40af' : '#93c5fd' },
    label: { color: colors.text },
    input: { 
      borderColor: isLight ? '#cbd5e1' : '#475569',
      color: colors.text,
      backgroundColor: isLight ? '#fff' : '#1e293b',
    },
    categoryChip: { backgroundColor: isLight ? '#f1f5f9' : '#334155' },
    categoryChipActive: { backgroundColor: '#2563eb' },
    categoryChipText: { color: isLight ? '#64748b' : '#94a3b8' },
    categoryChipTextActive: { color: '#fff' },
    cancelButton: { backgroundColor: isLight ? '#f1f5f9' : '#334155' },
    cancelButtonText: { color: colors.text },
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity 
          style={[styles.overlay, dynamicStyles.overlay]} 
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity 
            style={[styles.modalContent, dynamicStyles.modalContent]} 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <TouchableOpacity 
              onPress={onClose} 
              style={dynamicStyles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color={dynamicStyles.closeButtonIcon.color} />
            </TouchableOpacity>
            
            <View style={[styles.header, dynamicStyles.header]}>
              <Text style={[styles.title, dynamicStyles.title]}>Add New Workout</Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={[styles.infoBox, dynamicStyles.infoBox]}>
                <Ionicons name="information-circle" size={20} color="#2563eb" />
                <Text style={[styles.infoText, dynamicStyles.infoText]}>
                  Your submission will be reviewed by an admin before being added to the database.
                </Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, dynamicStyles.label]}>Workout Name *</Text>
                <TextInput
                  style={[styles.input, dynamicStyles.input]}
                  placeholder="e.g., Barbell Bench Press"
                  placeholderTextColor={colors.icon}
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, dynamicStyles.label]}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea, dynamicStyles.input]}
                  placeholder="Brief description of the workout, including proper form and benefits"
                  placeholderTextColor={colors.icon}
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, dynamicStyles.label]}>Category *</Text>
                {loading ? (
                  <ActivityIndicator size="small" color="#2563eb" />
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryChip,
                          dynamicStyles.categoryChip,
                          formData.category === cat && dynamicStyles.categoryChipActive,
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, category: cat }))}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            dynamicStyles.categoryChipText,
                            formData.category === cat && dynamicStyles.categoryChipTextActive,
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, dynamicStyles.label]}>Muscle Group *</Text>
                {loading ? (
                  <ActivityIndicator size="small" color="#2563eb" />
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                    {muscleGroups.map((group) => (
                      <TouchableOpacity
                        key={group}
                        style={[
                          styles.categoryChip,
                          dynamicStyles.categoryChip,
                          formData.muscle_group === group && dynamicStyles.categoryChipActive,
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, muscle_group: group }))}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            dynamicStyles.categoryChipText,
                            formData.muscle_group === group && dynamicStyles.categoryChipTextActive,
                          ]}
                        >
                          {group}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, dynamicStyles.label]}>Equipment (Optional)</Text>
                <TextInput
                  style={[styles.input, dynamicStyles.input]}
                  placeholder="e.g., Barbell, Dumbbells, Bodyweight"
                  placeholderTextColor={colors.icon}
                  value={formData.equipment}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, equipment: text }))}
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, dynamicStyles.cancelButton]}
                  onPress={onClose}
                  disabled={submitting}
                >
                  <Text style={[styles.cancelButtonText, dynamicStyles.cancelButtonText]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton, submitting && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit for Review</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 20,
    maxHeight: '88%',
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    // Padding handled by modalContent
  },
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    lineHeight: 18,
  },
  formGroup: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginTop: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#2563eb',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 8,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    // Dynamic color applied in component
  },
  cancelButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#2563eb',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AddWorkoutModal;

