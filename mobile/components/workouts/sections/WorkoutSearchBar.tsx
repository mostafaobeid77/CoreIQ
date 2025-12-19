import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/themeContext';

interface WorkoutSearchBarProps {
  search: string;
  onSearchChange: (text: string) => void;
  onClearSearch: () => void;
}

const WorkoutSearchBar: React.FC<WorkoutSearchBarProps> = ({
  search,
  onSearchChange,
  onClearSearch
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
          value={search}
          onChangeText={onSearchChange}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={onClearSearch} style={{ marginLeft: 8 }}>
            <Ionicons name="close-circle" size={20} color={isLight ? '#98a2b3' : '#888'} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default WorkoutSearchBar;
