import { useState } from 'react';

export function useDatePicker() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const showDatePicker = () => setDatePickerVisible(true);
  const hideDatePicker = () => setDatePickerVisible(false);

  const handleConfirm = (date: Date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const changeDay = (direction: 'prev' | 'next') => {
    setSelectedDate(prev =>
      new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + (direction === 'next' ? 1 : -1))
    );
  };

  return {
    selectedDate,
    isDatePickerVisible,
    showDatePicker,
    hideDatePicker,
    handleConfirm,
    changeDay,
    setSelectedDate
  };
} 