import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MentalHealthOption {
  label: string;
  icon: string;
  color: string;
}

interface MentalModalProps {
  visible: boolean;
  onClose: () => void;
  stats: any;
  mentalHealthOptions: MentalHealthOption[];
  handleMentalSelect: (label: string) => void;
  styles: { [key: string]: any };
}

const MentalModal: React.FC<MentalModalProps> = ({
  visible,
  onClose,
  stats,
  mentalHealthOptions,
  handleMentalSelect,
  styles
}) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="slide"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>How are you feeling today?</Text>
        <ScrollView style={styles.mentalOptionsContainer}>
          {mentalHealthOptions.map((option) => (
            <TouchableOpacity
              key={option.label}
              style={[
                styles.mentalOption,
                stats.mental === option.label && styles.selectedMentalOption
              ]}
              onPress={() => {
                handleMentalSelect(option.label);
                onClose();
              }}
            >
              <Ionicons name={option.icon as any} size={24} color={option.color} />
              <Text style={[
                styles.mentalOptionText,
                stats.mental === option.label && styles.selectedMentalOptionText
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

export default MentalModal; 