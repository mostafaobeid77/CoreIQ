import React, { useEffect } from 'react';
import { Modal, TouchableOpacity, View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SleepModalProps {
  visible: boolean;
  onClose: () => void;
  sleepInput: string;
  setSleepInput: (val: string) => void;
  stats: any;
  handleSleepSave: (val: string) => void;
  styles: { [key: string]: any };
  error?: string;
}

const SleepModal: React.FC<SleepModalProps> = ({
  visible,
  onClose,
  sleepInput,
  setSleepInput,
  stats,
  handleSleepSave,
  styles,
  error
}) => {
  const currentTotal = stats.sleep || 0;

  // Initialize input with current value when modal opens
  useEffect(() => {
    if (visible) {
      setSleepInput(currentTotal.toString());
    }
  }, [visible, currentTotal]);

  const adjustAmount = (delta: number) => {
    const inputAmount = parseFloat(sleepInput) || 0;
    const newVal = Math.max(0, inputAmount + delta);
    setSleepInput((Math.round(newVal * 10) / 10).toString());
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={[styles.modalContent, { padding: 24, borderRadius: 32 }]}
          activeOpacity={1}
          onPress={() => { }}
        >
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', padding: 12, borderRadius: 16, marginBottom: 12 }}>
              <Ionicons name="moon" size={32} color="#8b5cf6" />
            </View>
            <Text style={[styles.modalTitle, { marginBottom: 4 }]}>Sleep Tracker</Text>
            <Text style={styles.modalSubtitle}>How many hours did you sleep today?</Text>
          </View>

          {/* Amount Selector - Represents TOTAL HOURS */}
          <View style={[styles.currentWaterDisplay, { borderColor: '#8b5cf620', marginBottom: 32 }]}>
            <View style={styles.waterAmountSelector}>
              <TouchableOpacity
                style={styles.waterCircleButton}
                onPress={() => adjustAmount(-0.5)}
              >
                <Ionicons name="remove" size={24} color={styles.colors.text} />
              </TouchableOpacity>

              <View style={{ alignItems: 'baseline', flexDirection: 'row' }}>
                <TextInput
                  style={[styles.waterAmountText, { padding: 0, minWidth: 60 }]}
                  value={sleepInput}
                  onChangeText={setSleepInput}
                  keyboardType="numeric"
                  selectTextOnFocus={true}
                />
                <Text style={[styles.waterAmountText, { fontSize: 16, marginLeft: 4, opacity: 0.6 }]}>hrs</Text>
              </View>

              <TouchableOpacity
                style={styles.waterCircleButton}
                onPress={() => adjustAmount(0.5)}
              >
                <Ionicons name="add" size={24} color={styles.colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Presets - Setting the total directly */}
          <View style={styles.waterPresetsContainer}>
            {[
              { label: 'Short', amount: '6' },
              { label: 'Ideal', amount: '8' },
              { label: 'Long', amount: '10' }
            ].map((preset) => (
              <TouchableOpacity
                key={preset.amount}
                style={[
                  styles.waterPresetChip,
                  sleepInput === preset.amount && { borderColor: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.05)' }
                ]}
                onPress={() => setSleepInput(preset.amount)}
              >
                <Text style={[styles.waterPresetText, sleepInput === preset.amount && { color: '#8b5cf6' }]}>
                  {preset.label}
                </Text>
                <Text style={styles.waterPresetAmount}>{preset.amount}h</Text>
              </TouchableOpacity>
            ))}
          </View>

          {error ? (
            <Text style={{ color: '#ef4444', textAlign: 'center', marginBottom: 16, fontWeight: '600' }}>{error}</Text>
          ) : null}

          <View style={styles.waterActionButtons}>
            <TouchableOpacity
              style={[styles.waterActionButton, styles.waterAddButton, { width: '100%' }]}
              onPress={() => handleSleepSave(sleepInput)}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.waterAddButtonText}>Update Sleep</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default SleepModal;
