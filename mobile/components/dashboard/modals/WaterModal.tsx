import React from 'react';
import { Modal, TouchableOpacity, View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WaterModalProps {
  visible: boolean;
  onClose: () => void;
  waterInput: string;
  setWaterInput: (val: string) => void;
  stats: any;
  handleWaterAdd: () => void;
  handleWaterSubtract: () => void;
  setIsEditingWater: (val: boolean) => void;
  styles: { [key: string]: any };
  error?: string;
}

const WaterModal: React.FC<WaterModalProps> = ({
  visible,
  onClose,
  waterInput,
  setWaterInput,
  stats,
  handleWaterAdd,
  handleWaterSubtract,
  setIsEditingWater,
  styles,
  error
}) => {
  const currentAmount = stats.water || 0;
  const inputAmount = parseInt(waterInput) || 0;

  const adjustAmount = (delta: number) => {
    const newVal = Math.max(0, inputAmount + delta);
    setWaterInput(newVal.toString());
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
              <Ionicons name="water" size={32} color="#8b5cf6" />
            </View>
            <Text style={[styles.modalTitle, { marginBottom: 4 }]}>Water Intake</Text>
            <Text style={styles.modalSubtitle}>Stay hydrated for peak performance</Text>
          </View>

          {/* Today's Intake Display */}
          <View style={styles.currentWaterDisplay}>
            <Text style={styles.currentWaterValue}>{currentAmount} ml</Text>
            <Text style={styles.currentWaterGoal}>TODAY'S TOTAL</Text>
          </View>

          {/* Amount Selector */}
          <View style={styles.waterAmountSelector}>
            <TouchableOpacity
              style={styles.waterCircleButton}
              onPress={() => adjustAmount(-50)}
            >
              <Ionicons name="remove" size={24} color={styles.colors.text} />
            </TouchableOpacity>

            <View style={{ alignItems: 'center' }}>
              <Text style={styles.waterAmountText}>{inputAmount} ml</Text>
            </View>

            <TouchableOpacity
              style={styles.waterCircleButton}
              onPress={() => adjustAmount(50)}
            >
              <Ionicons name="add" size={24} color={styles.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Presets */}
          <View style={styles.waterPresetsContainer}>
            {[
              { label: 'Glass', amount: '250' },
              { label: 'Bottle', amount: '500' },
              { label: 'Large', amount: '1000' }
            ].map((preset) => (
              <TouchableOpacity
                key={preset.amount}
                style={[
                  styles.waterPresetChip,
                  waterInput === preset.amount && { borderColor: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.05)' }
                ]}
                onPress={() => setWaterInput(preset.amount)}
              >
                <Text style={[styles.waterPresetText, waterInput === preset.amount && { color: '#8b5cf6' }]}>
                  {preset.label}
                </Text>
                <Text style={styles.waterPresetAmount}>{preset.amount}ml</Text>
              </TouchableOpacity>
            ))}
          </View>

          {error ? (
            <Text style={{ color: '#ef4444', textAlign: 'center', marginBottom: 16, fontWeight: '600' }}>{error}</Text>
          ) : null}

          <View style={styles.waterActionButtons}>
            {currentAmount > 0 && (
              <TouchableOpacity
                style={[styles.waterActionButton, styles.waterSubtractButton]}
                onPress={handleWaterSubtract}
                disabled={inputAmount <= 0}
              >
                <Ionicons name="remove-circle-outline" size={20} color="#ef4444" style={{ marginRight: 8 }} />
                <Text style={styles.waterSubtractButtonText}>Remove</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.waterActionButton, styles.waterAddButton]}
              onPress={handleWaterAdd}
              disabled={inputAmount <= 0}
            >
              <Ionicons name="add-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.waterAddButtonText}>Add Water</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default WaterModal;