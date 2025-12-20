import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/themeContext';

interface WorkoutSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onAddPress: () => void;
}

const WorkoutSearchBar: React.FC<WorkoutSearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  onAddPress
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 12, marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isLight ? '#f8fafc' : '#222', borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: isLight ? '#e5e7eb' : '#333' }}>
        <Ionicons name="search" size={20} color={isLight ? '#667085' : '#888'} style={{ marginRight: 8 }} />
        <TextInput
          style={{ flex: 1, color: isLight ? '#111' : '#fff', height: 40 }}
          placeholder="Search for workouts..."
          placeholderTextColor={isLight ? '#98a2b3' : '#888'}
          value={value}
          onChangeText={onChangeText}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear} style={{ marginLeft: 8 }}>
            <Ionicons name="close-circle" size={20} color={isLight ? '#98a2b3' : '#888'} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        onPress={onAddPress}
        style={{
          marginLeft: 0,
          marginTop: 8,
          alignSelf: 'flex-end',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4
        }}
      >
        <Text style={{ color: '#8b5cf6', fontWeight: '600', fontSize: 13 }}>Can't find it?</Text>
        <Text style={{ color: '#8b5cf6', fontWeight: '700', fontSize: 13 }}>Create New</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WorkoutSearchBar;
