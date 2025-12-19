import { useState } from 'react';

export function useMealModals() {
  const [isFoodDetailsModalVisible, setIsFoodDetailsModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any>(null);

  const openFoodDetailsModal = (food: any) => {
    setSelectedFood(food);
    setIsFoodDetailsModalVisible(true);
  };

  const closeFoodDetailsModal = () => {
    setIsFoodDetailsModalVisible(false);
    setSelectedFood(null);
  };

  const handleAddToMeal = (food: any, quantity: number) => {
    // TODO: Implement adding food to meal logic
    console.log('Adding food to meal:', { food, quantity });
    closeFoodDetailsModal();
  };

  return {
    isFoodDetailsModalVisible,
    selectedFood,
    openFoodDetailsModal,
    closeFoodDetailsModal,
    handleAddToMeal,
  };
} 