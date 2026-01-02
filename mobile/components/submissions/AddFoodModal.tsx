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
import { submissionService, FoodSubmissionData } from '../../services/submissionService';
import { api } from '../../services/api';
import { useTheme } from '../../context/themeContext';
import { Colors } from '../../constants/theme';

interface AddFoodModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddFoodModal: React.FC<AddFoodModalProps> = ({ visible, onClose, onSuccess }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const colors = Colors[theme];

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const [formData, setFormData] = useState<FoodSubmissionData>({
    name: '',
    description: '',
    category: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    servings: [],
  });

  const [servingSize, setServingSize] = useState('');
  const [servingCalories, setServingCalories] = useState('');
  const [servingProtein, setServingProtein] = useState('');
  const [servingCarbs, setServingCarbs] = useState('');
  const [servingFat, setServingFat] = useState('');
  const [servingGrams, setServingGrams] = useState('');

  useEffect(() => {
    if (visible) {
      fetchCategories();
      resetForm();
    }
  }, [visible]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await api.get<string[]>('/foods/categories');
      setCategories(data);
      if (data.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: data[0] }));
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Fallback categories
      setCategories(['fruits', 'vegetables', 'grains_carbs', 'proteins', 'salads', 'fastfoods', 'drinks']);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: categories[0] || '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      servings: [],
    });
    setServingSize('');
    setServingCalories('');
    setServingProtein('');
    setServingCarbs('');
    setServingFat('');
    setServingGrams('');
  };

  const addServing = () => {
    if (!servingSize.trim()) {
      Alert.alert('Error', 'Please enter a serving size');
      return;
    }

    const serving = {
      size: servingSize.trim(),
      calories: Number(servingCalories) || 0,
      protein: Number(servingProtein) || 0,
      carbs: Number(servingCarbs) || 0,
      fat: Number(servingFat) || 0,
      grams: servingGrams ? Number(servingGrams) : undefined,
    };

    setFormData(prev => ({
      ...prev,
      servings: [...(prev.servings || []), serving],
    }));

    // Clear serving inputs
    setServingSize('');
    setServingCalories('');
    setServingProtein('');
    setServingCarbs('');
    setServingFat('');
    setServingGrams('');
  };

  const removeServing = (index: number) => {
    setFormData(prev => ({
      ...prev,
      servings: prev.servings?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a food name');
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
    if (formData.calories <= 0 && formData.protein <= 0 && formData.carbs <= 0 && formData.fat <= 0) {
      Alert.alert('Error', 'Please enter at least one nutrient value');
      return;
    }

    try {
      setSubmitting(true);
      await submissionService.submitFood(formData);
      Alert.alert(
        'Submission Sent',
        'Your food item has been submitted for admin approval. You will be notified once it is reviewed.',
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
      Alert.alert('Submission Failed', error?.message || 'Failed to submit food item');
    } finally {
      setSubmitting(false);
    }
  };

  const dynamicStyles = {
    overlay: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
    modalContent: {
      backgroundColor: colors.background,
      width: '92%' as const,
      maxWidth: 500,
    },
    header: { borderBottomColor: isLight ? '#e2e8f0' : '#334155' },
    title: { color: colors.text },
    closeButton: {
      position: 'absolute' as const,
      right: 16,
      top: 16,
      zIndex: 10,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isLight ? '#f1f5f9' : '#334155',
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    closeButtonIcon: { color: colors.text },
    infoBox: { backgroundColor: isLight ? '#f5f3ff' : 'rgba(139, 92, 246, 0.1)' },
    infoText: { color: isLight ? '#8b5cf6' : '#a78bfa' },
    label: { color: colors.text },
    input: {
      borderColor: isLight ? '#cbd5e1' : '#475569',
      color: colors.text,
      backgroundColor: isLight ? '#fff' : '#1e293b',
    },
    categoryChip: { backgroundColor: isLight ? '#f1f5f9' : '#334155' },
    categoryChipActive: { backgroundColor: '#8b5cf6' },
    categoryChipText: { color: isLight ? '#64748b' : '#94a3b8' },
    categoryChipTextActive: { color: '#fff' },
    sectionTitle: { color: colors.text },
    nutrientLabel: { color: colors.icon },
    nutrientField: {
      borderColor: isLight ? '#cbd5e1' : '#475569',
      color: colors.text,
      backgroundColor: isLight ? '#fff' : '#1e293b',
    },
    addServingButton: { backgroundColor: isLight ? '#f5f3ff' : 'rgba(139, 92, 246, 0.1)' },
    addServingText: { color: '#8b5cf6' },
    servingItem: { backgroundColor: isLight ? '#F9FAFB' : '#1e293b' },
    servingItemText: { color: colors.text },
    servingItemNutrients: { color: colors.icon },
    cancelButton: { backgroundColor: isLight ? '#f3f4f6' : '#334155' },
    cancelButtonText: { color: colors.text },
    helperText: { color: colors.icon, fontSize: 13 },
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
              <Text style={[styles.title, dynamicStyles.title]}>Add New Food</Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={[styles.infoBox, dynamicStyles.infoBox]}>
                <Ionicons name="information-circle" size={20} color="#8b5cf6" />
                <Text style={[styles.infoText, dynamicStyles.infoText]}>
                  Your submission will be reviewed by an admin before being added to the database.
                </Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, dynamicStyles.label]}>Food Name *</Text>
                <Text style={[styles.helperText, dynamicStyles.helperText]}>
                  Enter the name of the food item
                </Text>
                <TextInput
                  style={[styles.input, dynamicStyles.input]}
                  placeholder="e.g., Grilled Chicken Breast, Apple, Brown Rice"
                  placeholderTextColor={colors.icon}
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, dynamicStyles.label]}>Description *</Text>
                <Text style={[styles.helperText, dynamicStyles.helperText]}>
                  A brief description of the food (e.g., "Lean protein source, high in protein")
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea, dynamicStyles.input]}
                  placeholder="e.g., Lean protein source, high in protein and low in fat"
                  placeholderTextColor={colors.icon}
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, dynamicStyles.label]}>Category *</Text>
                <Text style={[styles.helperText, dynamicStyles.helperText]}>
                  Select the food category that best matches this item
                </Text>
                {loading ? (
                  <ActivityIndicator size="small" color="#8b5cf6" />
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
                          {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Nutrition Information *</Text>
                <View style={[styles.infoBox, dynamicStyles.infoBox, { marginTop: 8, marginBottom: 12 }]}>
                  <Ionicons name="help-circle" size={16} color="#8b5cf6" />
                  <Text style={[styles.helperText, dynamicStyles.helperText, { marginLeft: 6, flex: 1 }]}>
                    Enter the nutrition values for 100 grams of this food. You can find this on the food label or nutrition database.
                  </Text>
                </View>
                <View style={styles.nutrientsGrid}>
                  <View style={styles.nutrientInput}>
                    <Text style={[styles.nutrientLabel, dynamicStyles.nutrientLabel]}>Calories</Text>
                    <TextInput
                      style={[styles.nutrientField, dynamicStyles.nutrientField]}
                      placeholder="e.g., 165"
                      placeholderTextColor={colors.icon}
                      keyboardType="numeric"
                      value={formData.calories > 0 ? formData.calories.toString() : ''}
                      onChangeText={(text) =>
                        setFormData(prev => ({ ...prev, calories: Number(text) || 0 }))
                      }
                    />
                  </View>
                  <View style={styles.nutrientInput}>
                    <Text style={[styles.nutrientLabel, dynamicStyles.nutrientLabel]}>Protein (g)</Text>
                    <TextInput
                      style={[styles.nutrientField, dynamicStyles.nutrientField]}
                      placeholder="e.g., 31"
                      placeholderTextColor={colors.icon}
                      keyboardType="numeric"
                      value={formData.protein > 0 ? formData.protein.toString() : ''}
                      onChangeText={(text) =>
                        setFormData(prev => ({ ...prev, protein: Number(text) || 0 }))
                      }
                    />
                  </View>
                  <View style={styles.nutrientInput}>
                    <Text style={[styles.nutrientLabel, dynamicStyles.nutrientLabel]}>Carbs (g)</Text>
                    <TextInput
                      style={[styles.nutrientField, dynamicStyles.nutrientField]}
                      placeholder="e.g., 0"
                      placeholderTextColor={colors.icon}
                      keyboardType="numeric"
                      value={formData.carbs > 0 ? formData.carbs.toString() : ''}
                      onChangeText={(text) =>
                        setFormData(prev => ({ ...prev, carbs: Number(text) || 0 }))
                      }
                    />
                  </View>
                  <View style={styles.nutrientInput}>
                    <Text style={[styles.nutrientLabel, dynamicStyles.nutrientLabel]}>Fat (g)</Text>
                    <TextInput
                      style={[styles.nutrientField, dynamicStyles.nutrientField]}
                      placeholder="e.g., 3.6"
                      placeholderTextColor={colors.icon}
                      keyboardType="numeric"
                      value={formData.fat > 0 ? formData.fat.toString() : ''}
                      onChangeText={(text) =>
                        setFormData(prev => ({ ...prev, fat: Number(text) || 0 }))
                      }
                    />
                  </View>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Serving Sizes (Optional)</Text>
                <Text style={[styles.helperText, dynamicStyles.helperText]}>
                  Add common serving sizes like "1 cup", "1 piece", etc. This helps users track portions easily.
                </Text>
                <View style={styles.servingForm}>
                  <View style={styles.servingRow}>
                    <View style={{ flex: 2 }}>
                      <Text style={[styles.helperText, dynamicStyles.helperText, { marginBottom: 4, fontSize: 12 }]}>Serving name</Text>
                      <TextInput
                        style={[styles.input, dynamicStyles.input]}
                        placeholder="e.g., 1 cup, 1 piece"
                        placeholderTextColor={colors.icon}
                        value={servingSize}
                        onChangeText={setServingSize}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={[styles.helperText, dynamicStyles.helperText, { marginBottom: 4, fontSize: 12 }]}>Grams</Text>
                      <TextInput
                        style={[styles.input, dynamicStyles.input]}
                        placeholder="e.g., 240"
                        placeholderTextColor={colors.icon}
                        keyboardType="numeric"
                        value={servingGrams}
                        onChangeText={setServingGrams}
                      />
                    </View>
                  </View>
                  <Text style={[styles.helperText, dynamicStyles.helperText, { marginTop: 8, marginBottom: 8, fontSize: 12 }]}>
                    Nutrition for this serving:
                  </Text>
                  <View style={styles.nutrientsGrid}>
                    <View style={styles.nutrientInput}>
                      <Text style={[styles.nutrientLabel, dynamicStyles.nutrientLabel]}>Cal</Text>
                      <TextInput
                        style={[styles.nutrientField, dynamicStyles.nutrientField]}
                        placeholder="0"
                        placeholderTextColor={colors.icon}
                        keyboardType="numeric"
                        value={servingCalories}
                        onChangeText={setServingCalories}
                      />
                    </View>
                    <View style={styles.nutrientInput}>
                      <Text style={[styles.nutrientLabel, dynamicStyles.nutrientLabel]}>Protein</Text>
                      <TextInput
                        style={[styles.nutrientField, dynamicStyles.nutrientField]}
                        placeholder="0"
                        placeholderTextColor={colors.icon}
                        keyboardType="numeric"
                        value={servingProtein}
                        onChangeText={setServingProtein}
                      />
                    </View>
                    <View style={styles.nutrientInput}>
                      <Text style={[styles.nutrientLabel, dynamicStyles.nutrientLabel]}>Carbs</Text>
                      <TextInput
                        style={[styles.nutrientField, dynamicStyles.nutrientField]}
                        placeholder="0"
                        placeholderTextColor={colors.icon}
                        keyboardType="numeric"
                        value={servingCarbs}
                        onChangeText={setServingCarbs}
                      />
                    </View>
                    <View style={styles.nutrientInput}>
                      <Text style={[styles.nutrientLabel, dynamicStyles.nutrientLabel]}>Fat</Text>
                      <TextInput
                        style={[styles.nutrientField, dynamicStyles.nutrientField]}
                        placeholder="0"
                        placeholderTextColor={colors.icon}
                        keyboardType="numeric"
                        value={servingFat}
                        onChangeText={setServingFat}
                      />
                    </View>
                  </View>
                  <TouchableOpacity style={[styles.addServingButton, dynamicStyles.addServingButton]} onPress={addServing}>
                    <Ionicons name="add-circle-outline" size={20} color="#8b5cf6" />
                    <Text style={[styles.addServingText, dynamicStyles.addServingText]}>Add This Serving Size</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {formData.servings && formData.servings.length > 0 && (
                <View style={styles.servingsList}>
                  {formData.servings.map((serving, index) => (
                    <View key={index} style={[styles.servingItem, dynamicStyles.servingItem]}>
                      <View style={styles.servingItemContent}>
                        <Text style={[styles.servingItemText, dynamicStyles.servingItemText]}>{serving.size}</Text>
                        <Text style={[styles.servingItemNutrients, dynamicStyles.servingItemNutrients]}>
                          {serving.calories} cal • {serving.protein}g P • {serving.carbs}g C • {serving.fat}g F
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => removeServing(index)}>
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

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
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  helperText: {
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
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
    backgroundColor: '#8b5cf6',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
  nutrientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nutrientInput: {
    flex: 1,
    minWidth: '45%',
  },
  nutrientLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  nutrientField: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  servingForm: {
    marginTop: 8,
  },
  servingRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  addServingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  addServingText: {
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 14,
  },
  servingsList: {
    marginTop: 16,
  },
  servingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  servingItemContent: {
    flex: 1,
  },
  servingItemText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  servingItemNutrients: {
    fontSize: 12,
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
    backgroundColor: '#8b5cf6',
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

export default AddFoodModal;

