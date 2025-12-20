import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const createWorkoutStyles = (isLight: boolean) => StyleSheet.create({
  // Workout-specific modal styles
  workoutModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  workoutModalContent: {
    backgroundColor: isLight ? '#ffffff' : '#121212',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
    width: '100%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: isLight ? '#e2e8f0' : '#2d2d2d',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  workoutModalTitle: {
    color: isLight ? '#0f172a' : '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  workoutModalSubtitle: {
    color: isLight ? '#64748b' : '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  targetBadge: {
    backgroundColor: isLight ? '#f5f3ff' : '#272036',
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isLight ? '#ddd6fe' : '#3c305c',
  },
  targetBadgeText: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },

  // Set counter UI
  setCounterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: isLight ? '#f8fafc' : '#1a1a1a',
    padding: 12,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: isLight ? '#f1f5f9' : '#262626',
  },
  setCounterLabel: {
    color: isLight ? '#334155' : '#e2e8f0',
    fontSize: 15,
    fontWeight: '700',
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: isLight ? '#ffffff' : '#262626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isLight ? '#e2e8f0' : '#333',
  },
  counterValue: {
    color: isLight ? '#0f172a' : '#fff',
    fontSize: 18,
    fontWeight: '800',
    minWidth: 24,
    textAlign: 'center',
  },

  // Sets List
  setsList: {
    maxHeight: 280,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isLight ? '#ffffff' : '#1e1e1e',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: isLight ? '#f1f5f9' : '#262626',
  },
  setIndexCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: isLight ? '#f1f5f9' : '#2d2d2d',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  setIndexText: {
    color: isLight ? '#64748b' : '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  inputsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputField: {
    backgroundColor: isLight ? '#f8fafc' : '#1a1a1a',
    borderRadius: 12,
    padding: 10,
    color: isLight ? '#0f172a' : '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    borderWidth: 1,
    borderColor: isLight ? '#e2e8f0' : '#2d2d2d',
  },
  inputLabel: {
    color: isLight ? '#94a3b8' : '#64748b',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  inputDivider: {
    fontSize: 20,
    color: isLight ? '#cbd5e1' : '#475569',
    marginTop: 18,
  },

  // Cardio specific
  cardioContainer: {
    padding: 24,
    backgroundColor: isLight ? '#f8fafc' : '#1a1a1a',
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isLight ? '#f1f5f9' : '#262626',
  },
  cardioInput: {
    fontSize: 48,
    fontWeight: '800',
    color: '#8b5cf6',
    textAlign: 'center',
    width: 200,
    marginVertical: 12,
  },
  cardioUnit: {
    color: isLight ? '#64748b' : '#94a3b8',
    fontSize: 18,
    fontWeight: '600',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cancelButton: {
    backgroundColor: isLight ? '#f1f5f9' : '#262626',
  },
  cancelText: {
    color: isLight ? '#64748b' : '#94a3b8',
    fontSize: 15,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#8b5cf6',
  },
  saveText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginRight: 6,
  },
});

export default createWorkoutStyles;
