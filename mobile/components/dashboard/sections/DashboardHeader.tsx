import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';

interface DashboardHeaderProps {
  userName: string;
  greetingEmoji: string;
  avatarSource: any;
  isDefaultAvatar: boolean;
  selectedDate: Date;
  showDatePicker: () => void;
  changeDay: (direction: 'prev' | 'next') => void;
  isDatePickerVisible: boolean;
  handleConfirm: (date: Date) => void;
  hideDatePicker: () => void;
  styles: { [key: string]: any };
  hideWelcome?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
  greetingEmoji,
  avatarSource,
  isDefaultAvatar,
  selectedDate,
  showDatePicker,
  changeDay,
  isDatePickerVisible,
  handleConfirm,
  hideDatePicker,
  styles,
  hideWelcome = false
}) => (
  <View style={styles.header}>
    {!hideWelcome && (
      <View style={styles.headerTopRow}>
        <Text style={styles.welcome}>
          Welcome, <Text style={styles.userName}>{userName.split(' ')[0]}</Text> {greetingEmoji}
        </Text>
        {(isDefaultAvatar || avatarSource === require('../../../assets/images/logo.png')) ? (
          // Branch A: Default Logo (Hardcoded White Circle + Contain)
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            backgroundColor: 'white', // Explicit White
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#eee',
            overflow: 'hidden'
          }}>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={{ width: '65%', height: '65%', resizeMode: 'contain' }}
            />
          </View>
        ) : (
          // Branch B: User Photo (Theme Styles + Cover)
          <View style={styles.avatar}>
            <Image
              source={avatarSource}
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
            />
          </View>
        )}
      </View>
    )}
    <View style={styles.dateBar}>
      <TouchableOpacity onPress={() => changeDay('prev')}>
        <Ionicons name="chevron-back" size={28} color={styles.dateText?.color || '#111'} />
      </TouchableOpacity>
      <TouchableOpacity onPress={showDatePicker}>
        <Text style={styles.dateText}>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => changeDay('next')}>
        <Ionicons name="chevron-forward" size={28} color={styles.dateText?.color || '#111'} />
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={selectedDate}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </View>
  </View>
);

export default DashboardHeader; 