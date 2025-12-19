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
import mealsStyles from '../mealsStyles'; // Assuming this path is correct for your styles

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
    calories: number; // Calories per 100g or per default serving if only one
    protein: number; // Protein per 100g
    carbs: number;  // Carbs per 100g
    fats: number;   // Fats per 100g
    servings?: Serving[]; // Array of serving sizes
  } | null;
  onAddToMeal: (food: any, quantity: number, mealType: string, inputMode: 'grams' | 'servings') => Promise<void> | void;
  styles: { [key: string]: any }; // Re-added this prop to resolve parent component error
  mealSections: string[];
  defaultMealType?: string;
}

const FoodDetailsModal: React.FC<FoodDetailsModalProps> = ({
  visible,
  onClose,
  food,
  onAddToMeal,
  // styles, // No need to destructure or use this prop internally if it's only for type checking
  mealSections,
  defaultMealType
}) => {
  const [quantity, setQuantity] = useState('100');
  const [selectedMeal, setSelectedMeal] = useState<string>('');
  const [inputMode, setInputMode] = useState<'grams' | 'servings'>('grams');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Memoize resetModal to prevent unnecessary re-creations
  const resetModal = useCallback(() => {
    setQuantity('100');
    setSelectedMeal(defaultMealType || '');
    setInputMode('grams'); // Default to grams on reset
  }, [defaultMealType]);

  useEffect(() => {
    if (!visible) {
      resetModal();
      Keyboard.dismiss(); // Ensure keyboard is dismissed when modal closes
    } else {
      // Set initial input mode and quantity when modal becomes visible
      if (food?.servings && food.servings.length > 0) {
        setInputMode('servings');
        setQuantity('1'); // Default to 1 serving
      } else {
        setInputMode('grams');
        setQuantity('100'); // Default to 100g
      }
    }

    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [visible, food, resetModal]); // Re-run effect if visible, food, or resetModal changes

  // If food is null, render nothing
  if (!food) {
    return null;
  }

  const handleAddToMeal = async () => {
    if (!selectedMeal) {
      // In a real app, you might show a toast or alert here
      return;
    }

    let finalQuantity: number;
    if (inputMode === 'grams') {
      finalQuantity = parseFloat(quantity) || 0; // Use 0 if parsing fails
      if (finalQuantity <= 0) {
        // Provide user feedback for invalid quantity
        return;
      }
    } else {
      // Serving mode
      finalQuantity = parseFloat(quantity) || 0; // Use 0 if parsing fails
      if (finalQuantity <= 0 || !food.servings || food.servings.length === 0) {
        // Provide user feedback for invalid quantity or no servings
        return;
      }
    }

    console.log('🍽️ Modal adding to meal:', {
      foodName: food.name,
      inputMode,
      finalQuantity,
      selectedMeal,
      foodServings: food.servings,
      currentCalories: currentCalories,
      currentProtein: currentProtein,
      currentCarbs: currentCarbs,
      currentFats: currentFats
    });

    try {
      setSubmitting(true);
      await onAddToMeal(food, finalQuantity, selectedMeal, inputMode);
      onClose(); // Close the modal after adding to meal
    } catch (error: any) {
      Alert.alert('Unable to add meal', error?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
    // resetModal will be called by the useEffect when visible becomes false
  };

  /**
   * Calculates macros based on base value and quantity.
   * Handles both grams (per 100g) and serving (per serving) calculations.
   * Rounds to nearest integer, but keeps one decimal for values < 1.
   */
  const calculateMacros = (baseValue: number, inputQty: number, isServingMode: boolean): number => {
    if (isNaN(inputQty) || inputQty === 0) return 0; // Return 0 if quantity is invalid

    let calculatedValue: number;
    if (isServingMode && food.servings && food.servings.length > 0) {
      calculatedValue = baseValue * inputQty;
      console.log('📊 Serving calculation:', { baseValue, inputQty, calculatedValue });
    } else {
      calculatedValue = (baseValue * inputQty) / 100;
      console.log('📊 Gram calculation:', { baseValue, inputQty, calculatedValue });
    }

    // Rounding logic: round to 1 decimal if < 1 (and not zero), otherwise round to nearest integer
    const result = calculatedValue < 1 && calculatedValue !== 0
      ? Math.round(calculatedValue * 10) / 10
      : Math.round(calculatedValue);

    console.log('📊 Final calculated value:', { calculatedValue, result });
    return result;
  };

  // Calculate current macros based on selected input mode and quantity
  const currentQuantityNum = parseFloat(quantity) || 0; // Ensure currentQuantityNum is a valid number

  const currentCalories = calculateMacros(
    inputMode === 'servings' && food.servings && food.servings.length > 0 ? food.servings[0].calories : food.calories,
    currentQuantityNum,
    inputMode === 'servings'
  );
  const currentProtein = calculateMacros(
    inputMode === 'servings' && food.servings && food.servings.length > 0 ? food.servings[0].protein : food.protein,
    currentQuantityNum,
    inputMode === 'servings'
  );
  const currentCarbs = calculateMacros(
    inputMode === 'servings' && food.servings && food.servings.length > 0 ? food.servings[0].carbs : food.carbs,
    currentQuantityNum,
    inputMode === 'servings'
  );
  const currentFats = calculateMacros(
    inputMode === 'servings' && food.servings && food.servings.length > 0 ? food.servings[0].fat : food.fats,
    currentQuantityNum,
    inputMode === 'servings'
  );

  const handleGramsMode = () => {
    setInputMode('grams');
    setQuantity('100'); // Reset to 100 for grams
  };

  const handleServingMode = () => {
    setInputMode('servings');
    setQuantity('1'); // Reset to 1 for servings
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose} // Allows hardware back button to close on Android
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      // keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} // Adjust if content is still obscured
      >
        {/* Outer Pressable for the modal overlay. Tapping this closes the modal. */}
        <Pressable
          style={mealsStyles.mealsModalOverlay}
          onPress={onClose}
        >
          {/* Inner Pressable for the modal content.
              onPress={() => {}} is crucial: it prevents touches within the content
              from bubbling up to the overlay and accidentally closing the modal. */}
          <Pressable
            style={mealsStyles.mealsModalContent}
            onPress={() => { }} // This consumes the touch event
          >
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={mealsStyles.mealsModalTitle}>Add Food</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={28} color="#888" />
              </TouchableOpacity>
            </View>

            <ScrollView
              // Removed key prop to avoid unnecessary remounting and focus issues
              showsVerticalScrollIndicator={true}
              style={{ flex: 1 }} // Ensure ScrollView takes up available space
              contentContainerStyle={{ paddingBottom: 20 }} // Add padding to ensure content isn't cut off by keyboard or buttons
              nestedScrollEnabled={true} // Important for Android, especially with KeyboardAvoidingView
              keyboardShouldPersistTaps="handled" // Allows interaction with elements without dismissing keyboard unless tapping empty space
              keyboardDismissMode="interactive" // Swipe down to dismiss keyboard on iOS
              bounces={false} // Prevents overscrolling effect
              alwaysBounceVertical={false} // Prevents overscrolling effect
            >
              {/* Food Info Section */}
              <View style={mealsStyles.foodInfoSection}>
                <Text style={mealsStyles.foodName}>{food.name}</Text>
                <Text style={mealsStyles.foodBrand}>{food.brand}</Text>

                {/* Macros Grid - Using calculated current values */}
                <View style={mealsStyles.macrosGrid}>
                  <View style={mealsStyles.macroItem}>
                    <Text style={mealsStyles.macroValue}>{currentCalories}</Text>
                    <Text style={mealsStyles.macroLabel}>Calories</Text>
                  </View>
                  <View style={mealsStyles.macroItem}>
                    <Text style={mealsStyles.macroValue}>{currentProtein}g</Text>
                    <Text style={mealsStyles.macroLabel}>Protein</Text>
                  </View>
                  <View style={mealsStyles.macroItem}>
                    <Text style={mealsStyles.macroValue}>{currentCarbs}g</Text>
                    <Text style={mealsStyles.macroLabel}>Carbs</Text>
                  </View>
                  <View style={mealsStyles.macroItem}>
                    <Text style={mealsStyles.macroValue}>{currentFats}g</Text>
                    <Text style={mealsStyles.macroLabel}>Fat</Text>
                  </View>
                </View>
              </View>

              {/* Input Mode Selection */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
                  Select Input Method
                </Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    style={[
                      mealsStyles.mealButton,
                      inputMode === 'grams' && mealsStyles.mealButtonSelected
                    ]}
                    onPress={handleGramsMode}
                  >
                    <Text style={[
                      mealsStyles.mealButtonText,
                      inputMode === 'grams' && mealsStyles.mealButtonTextSelected
                    ]}>
                      Grams
                    </Text>
                  </TouchableOpacity>

                  {food.servings && food.servings.length > 0 && (
                    <TouchableOpacity
                      style={[
                        mealsStyles.mealButton,
                        inputMode === 'servings' && mealsStyles.mealButtonSelected
                      ]}
                      onPress={handleServingMode}
                    >
                      <Text style={[
                        mealsStyles.mealButtonText,
                        inputMode === 'servings' && mealsStyles.mealButtonTextSelected
                      ]}>
                        Servings {/* Changed this line: now only "Servings" */}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Quantity Input */}
              <View style={mealsStyles.quantitySection}>
                <Text style={mealsStyles.quantityLabel}>
                  {inputMode === 'grams' ? 'Quantity (grams)' : 'Quantity (servings)'}
                </Text>
                <TextInput
                  style={mealsStyles.quantityInput}
                  placeholder={inputMode === 'grams' ? "e.g., 150" : "e.g., 2"}
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                  returnKeyType="done"
                  autoFocus={visible} // autoFocus only when modal becomes visible
                // Consider adding onBlur={Keyboard.dismiss} if you want the keyboard to hide
                // when the TextInput loses focus (e.g., by tapping elsewhere in the modal)
                />

                {/* Quick quantity buttons */}
                <View style={mealsStyles.quantityButtons}>
                  {inputMode === 'grams' ? (
                    <>
                      <TouchableOpacity
                        style={mealsStyles.quantityButton}
                        onPress={() => setQuantity('50')}
                      >
                        <Text style={mealsStyles.quantityButtonText}>50g</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={mealsStyles.quantityButton}
                        onPress={() => setQuantity('100')}
                      >
                        <Text style={mealsStyles.quantityButtonText}>100g</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={mealsStyles.quantityButton}
                        onPress={() => setQuantity('150')}
                      >
                        <Text style={mealsStyles.quantityButtonText}>150g</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={mealsStyles.quantityButton}
                        onPress={() => setQuantity('200')}
                      >
                        <Text style={mealsStyles.quantityButtonText}>200g</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={mealsStyles.quantityButton}
                        onPress={() => setQuantity('1')}
                      >
                        <Text style={mealsStyles.quantityButtonText}>1</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={mealsStyles.quantityButton}
                        onPress={() => setQuantity('2')}
                      >
                        <Text style={mealsStyles.quantityButtonText}>2</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={mealsStyles.quantityButton}
                        onPress={() => setQuantity('3')}
                      >
                        <Text style={mealsStyles.quantityButtonText}>3</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={mealsStyles.quantityButton}
                        onPress={() => setQuantity('4')}
                      >
                        <Text style={mealsStyles.quantityButtonText}>4</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>

              {/* Macros Display - Using calculated current values */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
                  Nutritional Information
                  {inputMode === 'servings' && food.servings && food.servings.length > 0 && (
                    <Text style={{ color: '#8b5cf6', fontSize: 16 }}> - per {food.servings[0].size}</Text>
                  )}
                </Text>

                <View style={{ backgroundColor: '#2a2a2a', borderRadius: 16, padding: 20 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ color: '#888', fontSize: 16 }}>Calories</Text>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                      {currentCalories} kcal
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ color: '#888', fontSize: 16 }}>Protein</Text>
                    <Text style={{ color: '#60a5fa', fontSize: 16, fontWeight: '600' }}>
                      {currentProtein}g
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ color: '#888', fontSize: 16 }}>Carbohydrates</Text>
                    <Text style={{ color: '#fbbf24', fontSize: 16, fontWeight: '600' }}>
                      {currentCarbs}g
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#888', fontSize: 16 }}>Fat</Text>
                    <Text style={{ color: '#f87171', fontSize: 16, fontWeight: '600' }}>
                      {currentFats}g
                    </Text>
                  </View>
                </View>
              </View>

              {/* Meal Selection */}
              <View style={mealsStyles.mealSection}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
                  Add to Meal
                </Text>
                <View style={mealsStyles.mealGrid}>
                  {mealSections.map((meal) => (
                    <TouchableOpacity
                      key={meal}
                      style={[
                        mealsStyles.mealButton,
                        selectedMeal === meal && mealsStyles.mealButtonSelected
                      ]}
                      onPress={() => setSelectedMeal(meal)}
                    >
                      <Text style={[
                        mealsStyles.mealButtonText,
                        selectedMeal === meal && mealsStyles.mealButtonTextSelected
                      ]}>
                        {meal}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Per 100g info */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: '#888', fontSize: 14, textAlign: 'center', fontStyle: 'italic' }}>
                  * Values per 100g: {food.calories} kcal, {food.protein}g protein, {food.carbs}g carbs, {food.fats}g fat
                </Text>
              </View>
            </ScrollView>

            {/* Action Buttons (fixed at the bottom, outside ScrollView) */}
            <View style={mealsStyles.mealsModalButtons}>
              <TouchableOpacity
                style={[mealsStyles.mealsModalButton, mealsStyles.mealsCancelButton]}
                onPress={onClose}
              >
                <Text style={mealsStyles.mealsCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  mealsStyles.mealsModalButton,
                  mealsStyles.mealsConfirmButton,
                  { opacity: selectedMeal && !submitting ? 1 : 0.5 } // Dim if no meal is selected
                ]}
                onPress={handleAddToMeal}
                disabled={!selectedMeal || submitting} // Disable button if no meal is selected
              >
                <Text style={mealsStyles.mealsConfirmButtonText}>
                  {submitting
                    ? 'Adding...'
                    : selectedMeal
                      ? `Add to ${selectedMeal}`
                      : 'Select Meal'}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default FoodDetailsModal;