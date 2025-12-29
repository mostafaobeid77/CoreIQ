import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import mealsStyles from '../mealsStyles';

interface Serving {
  size: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface FoodDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  food: {
    id: string;
    name: string;
    brand: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    servings?: Serving[];
    nutrients?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fats?: number;
    };
    // Edit mode fields
    unit?: string;
    quantity?: number;
    servingIndex?: number;
    mealType?: string;
    category?: string; // Added category
  } | null;
  onAddToMeal: (food: any, quantity: number, mealType: string, inputMode: 'grams' | 'servings', servingIndex?: number) => Promise<void> | void;
  mealSections: string[];
  defaultMealType?: string;
}

const FoodDetailsModal: React.FC<FoodDetailsModalProps> = ({
  visible,
  onClose,
  food,
  onAddToMeal,
  mealSections,
  defaultMealType
}) => {
  const [quantity, setQuantity] = useState('100');
  const [selectedMeal, setSelectedMeal] = useState<string>('');
  const [inputMode, setInputMode] = useState<'grams' | 'servings'>('grams');
  const [selectedServingIndex, setSelectedServingIndex] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isDrink = food?.category?.toLowerCase() === 'drinks';

  const resetModal = useCallback(() => {
    setQuantity('100');
    setSelectedMeal(defaultMealType || '');
    setInputMode('grams');
    setSelectedServingIndex(0);
  }, [defaultMealType]);

  useEffect(() => {
    if (!visible) {
      resetModal();
      Keyboard.dismiss();
    } else if (food) {
      // Restore saved state if editing
      if (food.unit && food.quantity !== undefined) {
        const isGrams = food.unit === 'grams' || food.unit === 'ml' || food.unit === 'g';
        const isServings = !isGrams; // Assume servings if not explicit grams/ml

        setInputMode(isServings ? 'servings' : 'grams');
        setQuantity(food.quantity.toString());
        setSelectedMeal(food.mealType || defaultMealType || '');

        // Try to match specific serving index
        let initialIndex = food.servingIndex !== undefined ? food.servingIndex : 0;
        if (isServings && food.servings) {
          const matchIndex = food.servings.findIndex(s => s.size === food.unit);
          if (matchIndex !== -1) initialIndex = matchIndex;
        }
        setSelectedServingIndex(initialIndex);
      } else {
        // New item defaults
        // Allow servings for ALL items if available, but prioritize for drinks
        if (food.servings && food.servings.length > 0) {
          setInputMode('servings');
          setQuantity('1');
          setSelectedServingIndex(0);
        } else {
          setInputMode('grams');
          setQuantity('100');
        }
        setSelectedMeal(defaultMealType || '');
      }
    }

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [visible, food, resetModal, defaultMealType]);

  if (!food) return null;

  const calculateMacros = (baseValue: number, inputQty: number, isServingMode: boolean): number => {
    if (isNaN(inputQty) || inputQty === 0) return 0;
    let calculatedValue = isServingMode ? baseValue * inputQty : (baseValue * inputQty) / 100;
    return calculatedValue < 1 && calculatedValue !== 0 ? Math.round(calculatedValue * 10) / 10 : Math.round(calculatedValue);
  };

  const currentQuantityNum = parseFloat(quantity) || 0;
  const baseCal = food.nutrients?.calories || food.calories || 0;
  const basePro = food.nutrients?.protein || food.protein || 0;
  const baseCarbs = food.nutrients?.carbs || food.carbs || 0;
  const baseFats = food.nutrients?.fat || food.nutrients?.fats || food.fats || 0;

  const currentCalories = calculateMacros(
    inputMode === 'servings' && food.servings && food.servings.length > 0 ? food.servings[selectedServingIndex].calories : baseCal,
    currentQuantityNum,
    inputMode === 'servings'
  );
  const currentProtein = calculateMacros(
    inputMode === 'servings' && food.servings && food.servings.length > 0 ? food.servings[selectedServingIndex].protein : basePro,
    currentQuantityNum,
    inputMode === 'servings'
  );
  const currentCarbs = calculateMacros(
    inputMode === 'servings' && food.servings && food.servings.length > 0 ? food.servings[selectedServingIndex].carbs : baseCarbs,
    currentQuantityNum,
    inputMode === 'servings'
  );
  const currentFats = calculateMacros(
    inputMode === 'servings' && food.servings && food.servings.length > 0 ? food.servings[selectedServingIndex].fat : baseFats,
    currentQuantityNum,
    inputMode === 'servings'
  );

  const adjustQuantity = (amount: number) => {
    const current = parseFloat(quantity) || 0;
    const next = Math.max(0, current + amount);
    setQuantity(next.toString());
  };

  const handleAddToMeal = async () => {
    if (!selectedMeal || currentQuantityNum <= 0) return;
    try {
      setSubmitting(true);
      await onAddToMeal(food, currentQuantityNum, selectedMeal, inputMode, selectedServingIndex);
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Pressable style={mealsStyles.mealsModalOverlay} onPress={onClose}>
          <Pressable style={mealsStyles.premiumModalContent} onPress={() => { }}>
            {/* Header with Background Accent */}
            <View style={mealsStyles.premiumModalHeader}>
              <View>
                <Text style={mealsStyles.premiumModalTitle}>{food.unit ? 'Edit Entry' : 'Add to Day'}</Text>
              </View>
              <TouchableOpacity style={mealsStyles.closeButtonCircle} onPress={onClose}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 30 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* Streamlined Identity & Macros */}
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <Text style={{ fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4, textAlign: 'center' }}>{food.name}</Text>
                <Text style={{ fontSize: 14, color: '#94a3b8', marginBottom: 12 }}>{food.brand || 'Generic Food'}</Text>

                {/* Prominent Macro Grid */}
                <View style={mealsStyles.premiumMacroGrid}>
                  <View style={mealsStyles.premiumMacroCard}>
                    <Ionicons name="flame" size={14} color="#f59e42" style={mealsStyles.premiumMacroIcon} />
                    <Text style={mealsStyles.premiumMacroValue}>{currentCalories}</Text>
                    <Text style={mealsStyles.premiumMacroLabel}>CAL</Text>
                  </View>

                  <View style={mealsStyles.premiumMacroCard}>
                    <Ionicons name="fitness" size={14} color="#38bdf8" style={mealsStyles.premiumMacroIcon} />
                    <Text style={mealsStyles.premiumMacroValue}>{currentProtein}g</Text>
                    <Text style={mealsStyles.premiumMacroLabel}>PRO</Text>
                  </View>

                  <View style={mealsStyles.premiumMacroCard}>
                    <Ionicons name="leaf" size={14} color="#fbbf24" style={mealsStyles.premiumMacroIcon} />
                    <Text style={mealsStyles.premiumMacroValue}>{currentCarbs}g</Text>
                    <Text style={mealsStyles.premiumMacroLabel}>CARB</Text>
                  </View>

                  <View style={mealsStyles.premiumMacroCard}>
                    <Ionicons name="water" size={14} color="#f472b6" style={mealsStyles.premiumMacroIcon} />
                    <Text style={mealsStyles.premiumMacroValue}>{currentFats}g</Text>
                    <Text style={mealsStyles.premiumMacroLabel}>FAT</Text>
                  </View>
                </View>
              </View>

              <View style={mealsStyles.premiumSectionDivider} />

              {/* Dynamic Quantity Selector */}
              <View style={mealsStyles.premiumSection}>
                <Text style={mealsStyles.premiumSectionLabel}>HOW MUCH?</Text>

                {/* Mode Selector */}
                {/* Simplified Mode Selector */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  <TouchableOpacity
                    style={[
                      { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1 },
                      inputMode === 'grams' ? { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' } : { backgroundColor: 'transparent', borderColor: '#333' }
                    ]}
                    onPress={() => { setInputMode('grams'); setQuantity('100'); }}
                  >
                    <Text style={{ color: inputMode === 'grams' ? '#fff' : '#888', fontWeight: '600', fontSize: 13 }}>Grams / ML</Text>
                  </TouchableOpacity>

                  {food.servings?.map((serving, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1 },
                        (inputMode === 'servings' && selectedServingIndex === index) ? { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' } : { backgroundColor: 'transparent', borderColor: '#333' }
                      ]}
                      onPress={() => { setInputMode('servings'); setSelectedServingIndex(index); setQuantity('1'); }}
                    >
                      <Text style={{ color: (inputMode === 'servings' && selectedServingIndex === index) ? '#fff' : '#888', fontWeight: '600', fontSize: 13 }}>
                        {serving.size || `Serving ${index + 1}`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Interactive Adjuster */}
                <View style={mealsStyles.quantityAdjusterContainer}>
                  <TouchableOpacity
                    style={mealsStyles.adjustButton}
                    onPress={() => adjustQuantity(inputMode === 'grams' ? -10 : -1)}
                  >
                    <Ionicons name="remove" size={24} color="#fff" />
                  </TouchableOpacity>

                  <View style={mealsStyles.quantityInputWrapper}>
                    <TextInput
                      style={mealsStyles.premiumQuantityInput}
                      keyboardType="numeric"
                      value={quantity}
                      onChangeText={setQuantity}
                      selectTextOnFocus
                    />
                    <Text style={mealsStyles.unitSubtext}>
                      {inputMode === 'grams' ? (isDrink ? 'ml' : 'grams') : 'units'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={mealsStyles.adjustButton}
                    onPress={() => adjustQuantity(inputMode === 'grams' ? 10 : 1)}
                  >
                    <Ionicons name="add" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={mealsStyles.premiumSectionDivider} />

              {/* Meal Placement */}
              <View style={mealsStyles.premiumSection}>
                <Text style={mealsStyles.premiumSectionLabel}>FOR WHICH MEAL?</Text>
                <View style={mealsStyles.premiumMealGrid}>
                  {mealSections.map((meal) => (
                    <TouchableOpacity
                      key={meal}
                      style={[mealsStyles.premiumMealBtn, selectedMeal === meal && mealsStyles.premiumMealBtnActive]}
                      onPress={() => setSelectedMeal(meal)}
                    >
                      <Text style={[mealsStyles.premiumMealBtnText, selectedMeal === meal && mealsStyles.premiumMealBtnTextActive]}>{meal}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Action Footer */}
            <View style={mealsStyles.premiumFooter}>
              <TouchableOpacity
                style={[mealsStyles.actionBtn, mealsStyles.secondaryActionBtn]}
                onPress={onClose}
              >
                <Text style={mealsStyles.secondaryActionText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  mealsStyles.actionBtn,
                  mealsStyles.primaryActionBtn,
                  (!selectedMeal || submitting) && { opacity: 0.5 }
                ]}
                onPress={handleAddToMeal}
                disabled={!selectedMeal || submitting}
              >
                {submitting ? (
                  <Text style={mealsStyles.primaryActionText}>Saving...</Text>
                ) : (
                  <>
                    <Ionicons name={food.unit ? "save-outline" : "add-circle-outline"} size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={mealsStyles.primaryActionText}>{food.unit ? 'Update' : 'Confirm Add'}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default FoodDetailsModal;