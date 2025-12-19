import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import workoutStyles from './workoutStyles';
import { Ionicons } from '@expo/vector-icons';

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
  const [numSets, setNumSets] = useState(0);
  const [sets, setSets] = useState<{ reps: string; weight: string }[]>([]);
  const [durationMinutes, setDurationMinutes] = useState<string>('');

  const isCardio = (workout?.category?.toLowerCase() === 'cardio') || (workout?.muscle_group?.toLowerCase() === 'cardio');

  // Initialize from workout prop
  React.useEffect(() => {
    if (visible && workout) {
      if (isCardio) {
        setDurationMinutes(workout.minutes ? workout.minutes.toString() : '');
      } else if (workout.sets && Array.isArray(workout.sets)) {
        const initialSets = workout.sets.map(s => ({
          reps: s.reps.toString(),
          weight: s.weight.toString()
        }));
        setSets(initialSets);
        setNumSets(initialSets.length);
      } else {
        // Default to 3 sets if none exist
        setNumSets(3);
        setSets([
          { reps: '10', weight: '0' },
          { reps: '10', weight: '0' },
          { reps: '10', weight: '0' }
        ]);
      }
    }
  }, [workout, visible, isCardio]);

  // Update sets array when numSets changes (user interaction)
  React.useEffect(() => {
    if (isCardio) return;
    setSets((prev) => {
      const newSets = [...prev];
      if (numSets > prev.length) {
        for (let i = prev.length; i < numSets; i++) {
          newSets.push({ reps: '', weight: '' });
        }
      } else if (numSets < prev.length) {
        newSets.length = numSets;
      }
      return newSets;
    });
  }, [numSets, isCardio]);

  const handleSetChange = (idx: number, field: 'reps' | 'weight', value: string) => {
    setSets((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleSave = () => {
    if (isCardio) {
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

  const canSave = isCardio ? (Number(durationMinutes) > 0) : (numSets > 0);

  if (!workout) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={workoutStyles.workoutModalOverlay}>
        <View style={[workoutStyles.workoutModalContent, { maxHeight: '90%' }]}>
          <Text style={workoutStyles.workoutModalTitle}>{workout.name}</Text>
          <Text style={workoutStyles.workoutModalSubtitle}>{workout.description}</Text>
          <Text style={{ color: '#8b5cf6', fontSize: 16, fontWeight: '600', marginBottom: 16 }}>Target: {workout.muscle_group}</Text>

          {isCardio ? (
            <View>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Duration (minutes) </Text>
              <TextInput
                style={[workoutStyles.workoutInput, { width: 120 }]}
                keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
                value={durationMinutes}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setDurationMinutes(cleaned);
                }}
                placeholder="e.g. 30"
                placeholderTextColor="#888"
                maxLength={4}
              />
            </View>
          ) : (
            <>
              <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginRight: 12 }}>Sets</Text>
                <TouchableOpacity
                  style={{ backgroundColor: '#232323', borderRadius: 16, padding: 6, marginRight: 8 }}
                  onPress={() => setNumSets(Math.max(0, numSets - 1))}
                  disabled={numSets === 0}
                >
                  <Ionicons name="remove" size={20} color={numSets === 0 ? '#444' : '#fff'} />
                </TouchableOpacity>
                <TextInput
                  style={[workoutStyles.workoutInput, { width: 60, textAlign: 'center', fontSize: 18, marginRight: 8 }]}
                  keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
                  value={numSets.toString()}
                  onChangeText={text => {
                    const n = Math.max(0, Math.min(10, Number(text.replace(/[^0-9]/g, '')) || 0));
                    setNumSets(n);
                  }}
                  placeholder="0"
                  placeholderTextColor="#888"
                  maxLength={2}
                />
                <TouchableOpacity
                  style={{ backgroundColor: '#232323', borderRadius: 16, padding: 6 }}
                  onPress={() => setNumSets(Math.min(10, numSets + 1))}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 220 }}>
                {sets.map((set, idx) => (
                  <View key={idx} style={{
                    backgroundColor: '#23272f',
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 12,
                    shadowColor: '#000',
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 2,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', marginRight: 8 }}>Set {idx + 1}</Text>
                      <View style={{ flex: 1, height: 1, backgroundColor: '#333', marginLeft: 4 }} />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#aaa', fontSize: 13, marginBottom: 4 }}>Reps</Text>
                        <TextInput
                          style={[workoutStyles.workoutInput, { minWidth: 60, textAlign: 'center', fontSize: 16 }]}
                          keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
                          value={set.reps}
                          onChangeText={text => handleSetChange(idx, 'reps', text.replace(/[^0-9]/g, ''))}
                          placeholder="Reps"
                          placeholderTextColor="#888"
                          maxLength={3}
                        />
                      </View>
                      <View style={{ width: 16 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#aaa', fontSize: 13, marginBottom: 4 }}>Weight (kg) </Text>
                        <TextInput
                          style={[workoutStyles.workoutInput, { minWidth: 60, textAlign: 'center', fontSize: 16 }]}
                          keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
                          value={set.weight}
                          onChangeText={text => {
                            const cleaned = text.replace(/[^0-9.]/g, '');
                            const parts = cleaned.split('.');
                            const formatted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
                            handleSetChange(idx, 'weight', formatted);
                          }}
                          placeholder="kg"
                          placeholderTextColor="#888"
                          maxLength={6}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
            <TouchableOpacity style={[workoutStyles.workoutModalButton, workoutStyles.workoutCancelButton]} onPress={onClose}>
              <Text style={workoutStyles.workoutCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[workoutStyles.workoutModalButton, workoutStyles.workoutConfirmButton]} onPress={handleSave} disabled={!canSave}>
              <Text style={[workoutStyles.workoutConfirmButtonText, { opacity: !canSave ? 0.5 : 1 }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default WorkoutDetailsModal;
