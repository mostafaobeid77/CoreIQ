import React from 'react';
import { Modal, TouchableOpacity, View, Text, TextInput } from 'react-native';

interface SleepModalProps {
  visible: boolean;
  onClose: () => void;
  sleepInput: string;
  setSleepInput: (val: string) => void;
  stats: any;
  handleSleepAdd: () => void;
  handleSleepSubtract: () => void;
  styles: { [key: string]: any };
  error?: string;
}

const SleepModal: React.FC<SleepModalProps> = ({
  visible,
  onClose,
  sleepInput,
  setSleepInput,
  stats,
  handleSleepAdd,
  handleSleepSubtract,
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
        <Text style={styles.modalTitle}>Set Sleep Hours</Text>
        <Text style={styles.modalSubtitle}>How many hours to add/subtract?</Text>
        <TextInput
          style={styles.waterInput}
          placeholder="Enter hours to add/subtract"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={sleepInput}
          onChangeText={setSleepInput}
          autoFocus={true}
        />
        {error ? (
          <Text style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>{error}</Text>
        ) : null}
        <View style={styles.quickButtons}>
          <TouchableOpacity 
            style={styles.quickButton}
            onPress={() => setSleepInput('1')}
          >
            <Text style={styles.quickButtonText}>1h</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickButton}
            onPress={() => setSleepInput('2')}
          >
            <Text style={styles.quickButtonText}>2h</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickButton}
            onPress={() => setSleepInput('4')}
          >
            <Text style={styles.quickButtonText}>4h</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileInfoText}>
            Current: {stats.sleep > 0 ? `${stats.sleep}h` : 'Not set'}
          </Text>
        </View>
        <View style={styles.modalButtons}>
          {sleepInput.length > 0 && stats.sleep > 0 && (
            <TouchableOpacity 
              style={[styles.modalButton, styles.subtractButton]}
              onPress={handleSleepSubtract}
              disabled={!!error}
            >
              <Text style={styles.subtractButtonText}>Subtract</Text>
            </TouchableOpacity>
          )}
          {sleepInput.length > 0 && (
            <TouchableOpacity 
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleSleepAdd}
              disabled={!!error}
            >
              <Text style={styles.confirmButtonText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
);

export default SleepModal; 