import React from 'react';
import { Modal, TouchableOpacity, View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActivityModalProps {
  visible: boolean;
  onClose: () => void;
  stats: any;
  handleActivityLevelSave: (level: string) => void;
  styles: { [key: string]: any };
}

const activityOptions = [
  { label: 'Sedentary', description: 'Little or no exercise', icon: 'bed' },
  { label: 'Light', description: 'Light exercise 1-3 days/week', icon: 'walk' },
  { label: 'Moderate', description: 'Moderate exercise 3-5 days/week', icon: 'fitness' },
  { label: 'Active', description: 'Hard exercise 6-7 days/week', icon: 'barbell' },
  { label: 'Very Active', description: 'Very hard exercise, physical job', icon: 'flash' },
];

const ActivityModal: React.FC<ActivityModalProps> = ({
  visible,
  onClose,
  stats,
  handleActivityLevelSave,
  styles
}) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="slide"
    onRequestClose={onClose}
  >
    <TouchableOpacity 
      style={styles.modalOverlay} 
      activeOpacity={1} 
      onPress={onClose}
    >
      <TouchableOpacity 
        style={styles.modalContent} 
        activeOpacity={1} 
        onPress={() => {}} // Prevent closing when tapping inside modal
      >
        <Text style={styles.modalTitle}>Select Activity Level</Text>
        <Text style={styles.modalSubtitle}>How active are you on a daily basis?</Text>
        <ScrollView style={styles.mentalOptionsContainer}>
          {activityOptions.map((option) => (
            <TouchableOpacity
              key={option.label}
              style={[
                styles.mentalOption,
                stats.activityLevel === option.label && styles.selectedMentalOption
              ]}
              onPress={() => handleActivityLevelSave(option.label)}
            >
              <Ionicons name={option.icon as any} size={24} color="#60a5fa" />
              <View style={styles.activityOptionText}>
                <Text style={[
                  styles.mentalOptionText,
                  stats.activityLevel === option.label && styles.selectedMentalOptionText
                ]}>
                  {option.label}
                </Text>
                <Text style={[
                  styles.activityOptionDescription,
                  stats.activityLevel === option.label && styles.selectedMentalOptionText
                ]}>
                  {option.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
);

export default ActivityModal; 