import React, { useMemo } from 'react';
import { Modal, TouchableOpacity, View, Text, TextInput } from 'react-native';
import { usePreferences } from '../../../context/PreferencesContext';

interface WeightModalProps {
  visible: boolean;
  onClose: () => void;
  weightInput: string;
  setWeightInput: (val: string) => void;
  stats: any;
  handleWeightSave: () => void;
  styles: { [key: string]: any };
  error?: string;
}

const WeightModal: React.FC<WeightModalProps> = ({
  visible,
  onClose,
  weightInput,
  setWeightInput,
  stats,
  handleWeightSave,
  styles,
  error
}) => {
  const { units, formatWeight } = usePreferences();
  const unitLabel = units === 'imperial' ? 'lb' : 'kg';
  const currentDisplay = useMemo(() => formatWeight(stats.weight), [stats.weight, formatWeight]);
  return (
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
        <Text style={styles.modalTitle}>Update Weight</Text>
        <Text style={styles.modalSubtitle}>Enter your current weight ({unitLabel})</Text>
        <TextInput
          style={styles.waterInput}
          placeholder={`Enter weight in ${unitLabel}`}
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={weightInput}
          onChangeText={setWeightInput}
          autoFocus={true}
        />
        {error ? (
          <Text style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>{error}</Text>
        ) : null}
        <View style={styles.profileInfo}>
          <Text style={styles.profileInfoText}>
            Current: {stats.weight > 0 ? currentDisplay : 'Not set'}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.modalButton, styles.fullWidthButton, styles.confirmButton]}
          onPress={handleWeightSave}
          disabled={!!error}
        >
          <Text style={styles.confirmButtonText}>Save</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
);
}

export default WeightModal; 