import React from 'react';
import DashboardHeader from '../../dashboard/sections/DashboardHeader';

interface MealsHeaderProps {
  selectedDate: Date;
  showDatePicker: () => void;
  changeDay: (direction: 'prev' | 'next') => void;
  isDatePickerVisible: boolean;
  handleConfirm: (date: Date) => void;
  hideDatePicker: () => void;
  styles: { [key: string]: any };
}

const MealsHeader: React.FC<MealsHeaderProps> = ({
  selectedDate,
  showDatePicker,
  changeDay,
  isDatePickerVisible,
  handleConfirm,
  hideDatePicker,
  styles
}) => (
  <DashboardHeader
    userName={''}
    greetingEmoji={''}
    avatarSource={null}
    selectedDate={selectedDate}
    showDatePicker={showDatePicker}
    changeDay={changeDay}
    isDatePickerVisible={isDatePickerVisible}
    handleConfirm={handleConfirm}
    hideDatePicker={hideDatePicker}
    styles={styles}
    hideWelcome={true}
  />
);

export default MealsHeader; 