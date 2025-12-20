import { useState } from 'react';

export function useMealModals() {
  const [isFoodDetailsModalVisible, setIsFoodDetailsModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<{ id: string; mealType: string } | null>(null);

  const openFoodDetailsModal = (food: any, editData?: { id: string; mealType: string }) => {
    setSelectedFood(food);
    setIsFoodDetailsModalVisible(true);
    setEditingItem(editData || null);
  };

  const closeFoodDetailsModal = () => {
    setIsFoodDetailsModalVisible(false);
    setSelectedFood(null);
    setEditingItem(null);
  };

  const handleAddToMeal = (food: any, quantity: number) => {
    // TODO: Implement adding food to meal logic
    console.log('Adding food to meal:', { food, quantity });
    closeFoodDetailsModal();
  };

  return {
    isFoodDetailsModalVisible,
    selectedFood,
    editingItem,
    openFoodDetailsModal,
    closeFoodDetailsModal,
    handleAddToMeal,
  };
} 