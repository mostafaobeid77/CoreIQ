import React, { useState, useMemo } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Pressable, Keyboard } from 'react-native';
import { createWorkoutStyles } from './workoutStyles';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/themeContext';
import { usePreferences } from '../../context/PreferencesContext';

interface WorkoutDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  workout: {
    name: string;
    description: string;
    muscle_group: string;
    category?: string;
    sets?: { reps: number; weight: number }[];
    minutes?: number;
  } | null;
  onSave?: (payload: { type: 'sets'; sets: { reps: number; weight: number }[] } | { type: 'duration'; minutes: number }) => void;
}

const WorkoutDetailsModal: React.FC<WorkoutDetailsModalProps> = ({ visible, onClose, workout, onSave }) => {
  const { theme } = useTheme();
  const { preferences } = usePreferences();
  const styles = useMemo(() => createWorkoutStyles(theme === 'light'), [theme]);

  const [numSets, setNumSets] = useState(0);
  const [sets, setSets] = useState<{ reps: string; weight: string }[]>([]);
  const [durationMinutes, setDurationMinutes] = useState<string>('');

  // Check if this is a hold exercise (Plank, Wall Sit, etc.) or cardio
  const holdExercises = ['plank', 'wall sit', 'dead hang', 'hollow hold', 'boat hold', 'static hold'];
  const isHoldExercise = holdExercises.some(hold => workout?.name?.toLowerCase().includes(hold));
  const isCardio = (workout?.category?.toLowerCase() === 'cardio') || (workout?.muscle_group?.toLowerCase() === 'cardio');
  const showDuration = isCardio || isHoldExercise;

  // Get user's weight unit preference (default to kg)
  const weightUnit = preferences?.weightUnit || 'kg';

  // Initialize from workout prop
  React.useEffect(() => {
    if (visible && workout) {
      if (showDuration) {
        setDurationMinutes(workout.minutes ? workout.minutes.toString() : '');
      } else if (workout.sets && Array.isArray(workout.sets) && workout.sets.length > 0) {
        const initialSets = workout.sets.map(s => ({
          reps: s.reps.toString(),
          weight: s.weight.toString()
        }));
        setSets(initialSets);
        setNumSets(initialSets.length);
      } else {
        // Default to 4 sets if none exist (more premium default)
        setNumSets(4);
        setSets([
          { reps: '10', weight: '0' },
          { reps: '10', weight: '0' },
          { reps: '10', weight: '0' },
          { reps: '10', weight: '0' }
        ]);
      }
    }
  }, [workout, visible, isCardio]);

  // Update sets array when numSets changes (user interaction)
  React.useEffect(() => {
    if (showDuration) return;
    setSets((prev) => {
      const newSets = [...prev];
      if (numSets > prev.length) {
        for (let i = prev.length; i < numSets; i++) {
          const lastSet = prev.length > 0 ? prev[prev.length - 1] : { reps: '10', weight: '0' };
          newSets.push({ ...lastSet });
        }
      } else if (numSets < prev.length) {
        newSets.length = numSets;
      }
      return newSets;
    });
  }, [numSets, showDuration]);

  const handleSetChange = (idx: number, field: 'reps' | 'weight', value: string) => {
    setSets((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleSave = () => {
    if (showDuration) {
      const minutes = Number(durationMinutes);
      if (!minutes || minutes <= 0) return;
      onSave && onSave({ type: 'duration', minutes });
      onClose();
      return;
    }
    const normalized = sets.map(s => ({ reps: Number(s.reps) || 0, weight: Number(s.weight) || 0 }));
    onSave && onSave({ type: 'sets', sets: normalized });
    onClose();
  };

  if (!workout) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Pressable style={styles.workoutModalOverlay} onPress={onClose}>
          <Pressable style={styles.workoutModalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />

            <Text style={styles.workoutModalTitle}>{workout.name}</Text>
            <Text style={styles.workoutModalSubtitle} numberOfLines={2}>{workout.description}</Text>

            <View style={styles.targetBadge}>
              <Ionicons name="fitness" size={14} color="#8b5cf6" />
              <Text style={styles.targetBadgeText}>{workout.muscle_group || 'Target Area'}</Text>
            </View>

            {showDuration ? (
              <View style={styles.cardioContainer}>
                <Text style={styles.inputLabel}>Session Duration</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    style={styles.cardioInput}
                    keyboardType="number-pad"
                    value={durationMinutes}
                    onChangeText={(text) => setDurationMinutes(text.replace(/[^0-9]/g, ''))}
                    placeholder="00"
                    placeholderTextColor="#64748b"
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                  <Text style={styles.cardioUnit}>min</Text>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.setCounterContainer}>
                  <Text style={styles.setCounterLabel}>Number of Sets</Text>
                  <View style={styles.counterControls}>
                    <TouchableOpacity
                      style={styles.counterButton}
                      onPress={() => setNumSets(Math.max(1, numSets - 1))}
                    >
                      <Ionicons name="remove" size={24} color={theme === 'light' ? '#64748b' : '#94a3b8'} />
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{numSets}</Text>
                    <TouchableOpacity
                      style={styles.counterButton}
                      onPress={() => setNumSets(Math.min(10, numSets + 1))}
                    >
                      <Ionicons name="add" size={24} color={theme === 'light' ? '#64748b' : '#94a3b8'} />
                    </TouchableOpacity>
                  </View>
                </View>

                <ScrollView
                  style={styles.setsList}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  {sets.map((set, idx) => (
                    <View key={idx} style={styles.setRow}>
                      <View style={styles.setIndexCircle}>
                        <Text style={styles.setIndexText}>{idx + 1}</Text>
                      </View>

                      <View style={styles.inputsContainer}>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Reps</Text>
                          <TextInput
                            style={styles.inputField}
                            keyboardType="number-pad"
                            value={set.reps}
                            onChangeText={text => handleSetChange(idx, 'reps', text.replace(/[^0-9]/g, ''))}
                            placeholder="10"
                            placeholderTextColor="#64748b"
                            returnKeyType="done"
                            onSubmitEditing={Keyboard.dismiss}
                          />
                        </View>

                        <Text style={styles.inputDivider}>×</Text>

                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Weight ({weightUnit})</Text>
                          <TextInput
                            style={styles.inputField}
                            keyboardType="decimal-pad"
                            value={set.weight}
                            onChangeText={text => handleSetChange(idx, 'weight', text.replace(/[^0-9.]/g, ''))}
                            placeholder="0.0"
                            placeholderTextColor="#64748b"
                            returnKeyType="done"
                            onSubmitEditing={Keyboard.dismiss}
                          />
                        </View>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                <Text style={styles.saveText}>Save Progress</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default WorkoutDetailsModal;
