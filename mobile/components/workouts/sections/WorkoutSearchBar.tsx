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
    <View style={{ paddingHorizontal: 16, marginTop: 16, marginBottom: 12 }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isLight ? '#ffffff' : '#18181b', // Zinc 900
        borderRadius: 20, // Future Squircle
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: isLight ? '#e2e8f0' : 'rgba(139, 92, 246, 0.3)', // Subtle violet border
        // Future Glow
        shadowColor: '#8b5cf6',
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
      }}>
        <Ionicons name="search" size={20} color={isLight ? '#64748b' : '#8b5cf6'} style={{ marginRight: 12 }} />
        <TextInput
          style={{ flex: 1, color: isLight ? '#0f172a' : '#fff', fontSize: 16, fontWeight: '600' }}
          placeholder="Search for workouts..."
          placeholderTextColor={isLight ? '#94a3b8' : '#71717a'}
          value={value}
          onChangeText={onChangeText}
          selectionColor="#8b5cf6"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear} style={{ marginLeft: 8 }}>
            <Ionicons name="close" size={20} color={isLight ? '#94a3b8' : '#71717a'} />
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
