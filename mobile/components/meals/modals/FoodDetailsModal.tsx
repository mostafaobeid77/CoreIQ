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
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createMealsStyles } from '../mealsStyles';
import { useTheme } from '../../../context/themeContext';

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
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const mealsStyles = React.useMemo(() => createMealsStyles(isLight), [isLight]);

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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={mealsStyles.mealsModalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

          <View style={mealsStyles.mealsModalContent}>
            {/* 1. Sticky Header Container (Includes Title + Macros) */}
            <View style={mealsStyles.futureStickyHeader}>
              <View style={mealsStyles.futureHeader}>
                <Text style={mealsStyles.futureHeaderTitle}>{food.unit ? 'Edit Food' : 'Add Food'}</Text>
                <TouchableOpacity onPress={onClose} style={mealsStyles.futureCloseBtn}>
                  <Ionicons name="close" size={24} color={isLight ? '#0f172a' : '#fff'} />
                </TouchableOpacity>
              </View>

              {/* 2. HUD Macros (Sticky) */}
              <View style={mealsStyles.futureMacrosRow}>
                <View style={mealsStyles.futureMacroItem}>
                  <Text style={[mealsStyles.futureMacroValue, mealsStyles.macroColorCal]}>{currentCalories}</Text>
                  <Text style={mealsStyles.futureMacroLabel}>Calories</Text>
                </View>
                <View style={mealsStyles.futureMacroItem}>
                  <Text style={[mealsStyles.futureMacroValue, mealsStyles.macroColorPro]}>{currentProtein}g</Text>
                  <Text style={mealsStyles.futureMacroLabel}>Protein</Text>
                </View>
                <View style={mealsStyles.futureMacroItem}>
                  <Text style={[mealsStyles.futureMacroValue, mealsStyles.macroColorCarb]}>{currentCarbs}g</Text>
                  <Text style={mealsStyles.futureMacroLabel}>Carbs</Text>
                </View>
                <View style={mealsStyles.futureMacroItem}>
                  <Text style={[mealsStyles.futureMacroValue, mealsStyles.macroColorFat]}>{currentFats}g</Text>
                  <Text style={mealsStyles.futureMacroLabel}>Fat</Text>
                </View>
              </View>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 120 }}
              style={{ flex: 1 }}
            >

              {/* 3. Food Identity */}
              <View style={mealsStyles.futureFoodInfo}>
                <Text style={mealsStyles.futureFoodName}>{food.name}</Text>
                <Text style={mealsStyles.futureFoodBrand}>{food.brand || 'Generic Food'}</Text>
              </View>

              {/* 4. The Reactor (Quantity Core) */}
              <View style={mealsStyles.futureReactor}>
                <View style={mealsStyles.futureQuantityRow}>
                  {/* Left Button */}
                  <TouchableOpacity
                    style={mealsStyles.futureQtyBtn}
                    onPress={() => adjustQuantity(inputMode === 'grams' ? -10 : -1)}
                  >
                    <Ionicons name="remove" size={28} color="#fff" />
                  </TouchableOpacity>

                  {/* Core Input */}
                  <View style={mealsStyles.futureQtyInputWrapper}>
                    <TextInput
                      style={mealsStyles.futureQtyInput}
                      keyboardType="numeric"
                      value={quantity}
                      onChangeText={setQuantity}
                      selectTextOnFocus
                      selectionColor="#8b5cf6"
                    />
                    {inputMode === 'grams' && (
                      <Text style={mealsStyles.futureUnitSuffix}>{isDrink ? 'ml' : 'g'}</Text>
                    )}
                  </View>

                  {/* Right Button */}
                  <TouchableOpacity
                    style={mealsStyles.futureQtyBtn}
                    onPress={() => adjustQuantity(inputMode === 'grams' ? 10 : 1)}
                  >
                    <Ionicons name="add" size={28} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* 5. Servings Pills (Always Visible for Quick Access, Centered) */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={mealsStyles.futureServingRow}
              >
                {/* OPTION 1: GRAMS/ML (The Base Unit) */}
                <TouchableOpacity
                  style={[
                    mealsStyles.futureServingPill,
                    inputMode === 'grams' && mealsStyles.futureServingPillActive
                  ]}
                  onPress={() => {
                    setInputMode('grams');
                    setQuantity('100');
                  }}
                >
                  <Text style={[
                    mealsStyles.futureServingText,
                    inputMode === 'grams' && mealsStyles.futureServingTextActive
                  ]}>
                    {isDrink ? '100 ml' : '100 g'}
                  </Text>
                </TouchableOpacity>

                {/* OPTION 2+: ACTUAL SERVINGS */}
                {food.servings?.map((s, i) => {
                  const isActive = inputMode === 'servings' && selectedServingIndex === i;
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[
                        mealsStyles.futureServingPill,
                        isActive && mealsStyles.futureServingPillActive
                      ]}
                      onPress={() => {
                        setInputMode('servings');
                        setSelectedServingIndex(i);
                        setQuantity('1');
                      }}
                    >
                      <Text style={[
                        mealsStyles.futureServingText,
                        isActive && mealsStyles.futureServingTextActive
                      ]}>
                        {s.size}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* 6. Meal Target (Grid) */}
              <View style={mealsStyles.futureMealSection}>
                <Text style={mealsStyles.futureSectionLabel}>Select Meal</Text>
                <View style={mealsStyles.futureMealGrid}>
                  {mealSections.map((meal) => (
                    <TouchableOpacity
                      key={meal}
                      style={[
                        mealsStyles.futureMealBtn,
                        selectedMeal === meal && mealsStyles.futureMealBtnActive
                      ]}
                      onPress={() => setSelectedMeal(meal)}
                    >
                      <Text style={[
                        mealsStyles.futureMealText,
                        selectedMeal === meal && mealsStyles.futureMealTextActive
                      ]}>
                        {meal}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

            </ScrollView>

            {/* 7. Footer (Floating) */}
            <View style={mealsStyles.futureFooter}>
              <TouchableOpacity
                style={[
                  mealsStyles.futureSaveBtn,
                  (!selectedMeal || submitting) && { opacity: 0.5, shadowOpacity: 0.1 }
                ]}
                onPress={handleAddToMeal}
                disabled={!selectedMeal || submitting}
              >
                <Text style={mealsStyles.futureSaveText}>
                  {submitting ? 'SAVING...' : 'SAVE'}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default FoodDetailsModal;