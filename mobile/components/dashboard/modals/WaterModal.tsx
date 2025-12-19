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
        <Text style={styles.modalTitle}>Water Consumption</Text>
        <Text style={styles.modalSubtitle}>How much water did you drink? (ml)</Text>
        
        <TextInput
          style={styles.waterInput}
          placeholder="Enter amount in ml"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={waterInput}
          onChangeText={setWaterInput}
          autoFocus={true}
        />
        {error ? (
          <Text style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>{error}</Text>
        ) : null}
        {waterInput.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setWaterInput('')}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
        <View style={styles.quickButtons}>
          <TouchableOpacity 
            style={styles.quickButton}
            onPress={() => setWaterInput('250')}
          >
            <Text style={styles.quickButtonText}>250ml</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickButton}
            onPress={() => setWaterInput('500')}
          >
            <Text style={styles.quickButtonText}>500ml</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickButton}
            onPress={() => setWaterInput('1000')}
          >
            <Text style={styles.quickButtonText}>1L</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.modalButtons}>
          {waterInput.length > 0 && stats.water > 0 && (
            <TouchableOpacity 
              style={[styles.modalButton, styles.subtractButton]}
              onPress={handleWaterSubtract}
              disabled={!!error}
            >
              <Text style={styles.subtractButtonText}>Subtract</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.modalButton, styles.confirmButton]}
            onPress={handleWaterAdd}
            disabled={!!error || waterInput.length === 0}
          >
            <Text style={styles.confirmButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
);

export default WaterModal; 