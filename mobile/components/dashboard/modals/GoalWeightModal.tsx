import React from 'react';
import { Modal, TouchableOpacity, View, Text, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GoalWeightModalProps {
  visible: boolean;
  onClose: () => void;
  stats: any;
  selectedWeightGoal: string;
  setSelectedWeightGoal: (val: string) => void;
  goalWeightInput: string;
  setGoalWeightInput: (val: string) => void;
  handleWeightGoalSelect: (goal: string, targetWeight: number) => void;
  handleWeightGoalSave: () => void;
  styles: { [key: string]: any };
  error?: string;
}

const goalOptions = [
  { label: 'Maintain Weight', description: 'Keep your current weight', icon: 'scale' },
  { label: 'Lose Weight', description: 'Reduce your body weight', icon: 'trending-down' },
  { label: 'Gain Weight', description: 'Increase your body weight', icon: 'trending-up' },
];

const GoalWeightModal: React.FC<GoalWeightModalProps> = ({
  visible,
  onClose,
  stats,
  selectedWeightGoal,
  setSelectedWeightGoal,
  goalWeightInput,
  setGoalWeightInput,
  handleWeightGoalSelect,
  handleWeightGoalSave,
  styles,
  error
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
        onPress={() => { }} // Prevent closing when tapping inside modal
      >
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Set Weight Goal</Text>
            <Text style={styles.modalSubtitle}>Choose your fitness objective</Text>
          </View>
          <View style={styles.currentWeightSection}>
            <Ionicons name="scale" size={20} color="#60a5fa" />
            <Text style={styles.currentWeightText}>
              Current Weight: {stats.weight > 0 ? `${stats.weight}kg` : 'Not set'}
            </Text>
          </View>
          <View style={styles.optionsSection}>
            <Text style={styles.sectionLabel}>Select Goal Type</Text>
            {goalOptions.map((option) => (
              <TouchableOpacity
                key={option.label}
                style={[
                  styles.goalOption,
                  selectedWeightGoal === option.label && styles.selectedGoalOption
                ]}
                onPress={() => setSelectedWeightGoal(option.label)}
              >
                <View style={styles.goalOptionIcon}>
                  <Ionicons name={option.icon as any} size={24} color={selectedWeightGoal === option.label ? "#8b5cf6" : "#94a3b8"} />
                </View>
                <View style={styles.goalOptionContent}>
                  <Text style={[
                    styles.goalOptionTitle,
                    selectedWeightGoal === option.label && styles.selectedGoalOptionText
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={[
                    styles.goalOptionDescription,
                    selectedWeightGoal === option.label && styles.selectedGoalOptionText
                  ]}>
                    {option.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          {(selectedWeightGoal === 'Lose Weight' || selectedWeightGoal === 'Gain Weight') && (
            <View style={styles.targetSection}>
              <Text style={styles.sectionLabel}>Set Target Weight</Text>
              <TextInput
                style={styles.targetInput}
                placeholder={
                  selectedWeightGoal === 'Lose Weight'
                    ? `Enter weight less than ${stats.weight}kg`
                    : `Enter weight greater than ${stats.weight}kg`
                }
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={goalWeightInput}
                onChangeText={setGoalWeightInput}
                autoFocus={true}
              />
              {error ? (
                <Text style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>{error}</Text>
              ) : null}
            </View>
          )}
          {(selectedWeightGoal === 'Lose Weight' || selectedWeightGoal === 'Gain Weight') && (
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton, { marginTop: 20, marginBottom: 20 }]}
              onPress={() => handleWeightGoalSelect(selectedWeightGoal, parseFloat(goalWeightInput) || 0)}
              disabled={!!error}
            >
              <Text style={styles.confirmButtonText}>Save Goal</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
);

export default GoalWeightModal; 