import React, { useMemo, useState } from 'react';
import { Modal, TouchableOpacity, View, Text, TextInput } from 'react-native';
import { usePreferences } from '../../../context/PreferencesContext';

interface HeightModalProps {
  visible: boolean;
  onClose: () => void;
  heightInput: string;
  setHeightInput: (val: string) => void;
  stats: any;
  handleHeightSave: (value: string) => void;
  styles: { [key: string]: any };
  error?: string;
}

const HeightModal: React.FC<HeightModalProps> = ({
  visible,
  onClose,
  heightInput,
  setHeightInput,
  stats,
  handleHeightSave,
  styles,
  error
}) => {
  const { units, formatHeight } = usePreferences();
  const unitLabel = units === 'imperial' ? 'ft/in' : 'cm';

  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [localError, setLocalError] = useState('');

  // When modal opens or units/stats.height changes, update fields
  React.useEffect(() => {
    if (visible) {
      if (units === 'imperial') {
        // Always use stats.height (in cm) to populate ft/in fields
        const cm = stats.height > 0 ? stats.height : 0;
        if (cm > 0) {
          const totalInches = Math.round(cm / 2.54);
          const ft = Math.floor(totalInches / 12);
          const inch = totalInches % 12;
          setFeet(ft > 0 ? String(ft) : '');
          setInches(String(inch)); // Always show inches, even if 0
        } else {
          setFeet('');
          setInches('');
        }
        setHeightInput(''); // clear cm input
      } else {
        // Always use stats.height (in cm) to populate cm field
        if (stats.height > 0) {
          setHeightInput(String(stats.height));
        } else {
          setHeightInput('');
        }
        setFeet('');
        setInches('');
      }
    }
    // eslint-disable-next-line
  }, [visible, units, stats.height]);

  const showImperialInputs = units === 'imperial';

  // Always display the current height in the correct format
  const currentDisplay = useMemo(() => {
    if (units === 'imperial') {
      const cm = stats.height > 0 ? stats.height : (parseFloat(heightInput) || 0);
      const totalInches = Math.round(cm / 2.54);
      const ft = Math.floor(totalInches / 12);
      const inch = totalInches % 12;
      return ft > 0 ? `${ft}'${inch}"` : `${inch} in`;
    } else {
      const cm = stats.height > 0 ? stats.height : (parseFloat(heightInput) || 0);
      return cm > 0 ? `${cm} cm` : 'Not set';
    }
  }, [units, stats.height, heightInput]);

  // Validation for imperial
  const validateImperial = () => {
    const ft = parseInt(feet) || 0;
    const inch = parseInt(inches) || 0;
    if (feet === '' && inches === '') {
      setLocalError('Please enter your height in feet and inches.');
      return false;
    }
    if (ft < 1 || ft > 8) {
      setLocalError('Feet must be between 1 and 8.');
      return false;
    }
    if (inch < 0 || inch > 11) {
      setLocalError('Inches must be between 0 and 11.');
      return false;
    }
    const totalInches = ft * 12 + inch;
    if (totalInches < 20 || totalInches > 98) {
      setLocalError("Please enter a valid height (e.g. 1'8\" to 8'2\")");
      return false;
    }
    setLocalError('');
    return true;
  };

  // Validation for metric
  const validateMetric = () => {
    const cm = parseFloat(heightInput) || 0;
    if (heightInput === '') {
      setLocalError('Please enter your height in cm.');
      return false;
    }
    if (cm < 50 || cm > 250) {
      setLocalError('Please enter a valid height (50–250 cm)');
      return false;
    }
    setLocalError('');
    return true;
  };

  const handleImperialSave = () => {
    if (!validateImperial()) return;
    const ft = parseInt(feet) || 0;
    const inch = parseInt(inches) || 0;
    const totalInches = ft * 12 + inch;
    const cm = totalInches * 2.54;
    handleHeightSave(String(cm)); // always save in cm
  };

  const handleMetricSave = () => {
    if (!validateMetric()) return;
    handleHeightSave(heightInput);
  };

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
          <Text style={styles.modalTitle}>Update Height</Text>
          <Text style={styles.modalSubtitle}>Enter your current height ({unitLabel})</Text>
          {showImperialInputs ? (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                style={[styles.waterInput, { flex: 1 }]}
                placeholder="ft"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={feet}
                onChangeText={setFeet}
                autoFocus={true}
              />
              <TextInput
                style={[styles.waterInput, { flex: 1 }]}
                placeholder="in"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={inches}
                onChangeText={setInches}
              />
            </View>
          ) : (
            <TextInput
              style={styles.waterInput}
              placeholder={`Enter height in ${unitLabel}`}
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={heightInput}
              onChangeText={setHeightInput}
              autoFocus={true}
            />
          )}
          {showImperialInputs ? (
            localError ? (
              <Text style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>{localError}</Text>
            ) : null
          ) : (
            (localError || error) ? (
              <Text style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>{localError || error}</Text>
            ) : null
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileInfoText}>
              Current: {currentDisplay}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.modalButton, styles.fullWidthButton, styles.confirmButton]}
            onPress={() => {
              if (showImperialInputs) {
                handleImperialSave();
              } else {
                handleMetricSave();
              }
            }}
            disabled={!!localError}
          >
            <Text style={styles.confirmButtonText}>Save</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export default HeightModal; 