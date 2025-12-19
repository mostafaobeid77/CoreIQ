import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { usePreferences } from '../../../context/PreferencesContext';
import { Ionicons } from '@expo/vector-icons';

interface PhysicalStatsSectionProps {
  stats: any;
  setWeightInput: (val: string) => void;
  setIsWeightModalVisible: (val: boolean) => void;
  setHeightInput: (val: string) => void;
  setIsHeightModalVisible: (val: boolean) => void;
  styles: { [key: string]: any };
}

const PhysicalStatsSection: React.FC<PhysicalStatsSectionProps> = ({
  stats,
  setWeightInput,
  setIsWeightModalVisible,
  setHeightInput,
  setIsHeightModalVisible,
  styles
}) => {
  const { formatWeight, formatHeight } = usePreferences();
  return (
    <View style={styles.profileSection}>
      <Text style={styles.sectionHeader}>Physical Stats</Text>
      <View style={styles.physicalStatsGrid}>
        <TouchableOpacity 
          style={styles.physicalStatCard}
          onPress={() => {
            setWeightInput(stats.weight > 0 ? stats.weight.toString() : '');
            setIsWeightModalVisible(true);
          }}
        >
          <View style={styles.physicalStatContent}>
            <Ionicons name="scale" size={24} color="#f59e0b" />
            <View style={styles.physicalStatText}>
              <Text style={styles.physicalStatTitle}>Weight</Text>
              <Text style={styles.physicalStatValue}>
                {stats.weight > 0 ? formatWeight(stats.weight) : 'Not set'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.physicalStatCard}
          onPress={() => {
            setHeightInput(stats.height > 0 ? stats.height.toString() : '');
            setIsHeightModalVisible(true);
          }}
        >
          <View style={styles.physicalStatContent}>
            <Ionicons name="resize" size={24} color="#34d399" />
            <View style={styles.physicalStatText}>
              <Text style={styles.physicalStatTitle}>Height</Text>
              <Text style={styles.physicalStatValue}>
                {stats.height > 0 ? formatHeight(stats.height) : 'Not set'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PhysicalStatsSection;
