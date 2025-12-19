import { useState } from 'react';

export function useDashboardModals() {
  const [isWaterModalVisible, setIsWaterModalVisible] = useState(false);
  const [isMentalModalVisible, setIsMentalModalVisible] = useState(false);
  const [isWeightModalVisible, setIsWeightModalVisible] = useState(false);
  const [isHeightModalVisible, setIsHeightModalVisible] = useState(false);
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);
  const [isGoalWeightModalVisible, setIsGoalWeightModalVisible] = useState(false);
  const [isSleepModalVisible, setIsSleepModalVisible] = useState(false);
  const [openSheet, setOpenSheet] = useState<null | 'nutritions' | 'mind' | 'activity'>(null);

  return {
    isWaterModalVisible, setIsWaterModalVisible,
    isMentalModalVisible, setIsMentalModalVisible,
    isWeightModalVisible, setIsWeightModalVisible,
    isHeightModalVisible, setIsHeightModalVisible,
    isActivityModalVisible, setIsActivityModalVisible,
    isGoalWeightModalVisible, setIsGoalWeightModalVisible,
    isSleepModalVisible, setIsSleepModalVisible,
    openSheet, setOpenSheet
  };
} 