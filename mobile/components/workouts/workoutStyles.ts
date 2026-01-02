import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const createWorkoutStyles = (isLight: boolean) => StyleSheet.create({
  // Workout-specific modal styles
  workoutModalOverlay: {
    flex: 1,
    backgroundColor: isLight ? '#ffffff' : '#09090b', // Zinc 950 Full Screen
  },
  workoutModalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50, // Slightly reduced
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 24,
    display: 'none', // Hide handle for full screen
  },
  workoutModalTitle: {
    color: isLight ? '#0f172a' : '#ffffff',
    fontSize: 28, // Larger title for full screen
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 4, // Tight
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  workoutModalSubtitle: {
    color: isLight ? '#64748b' : '#a1a1aa',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 12, // Reduced from 32
    lineHeight: 22,
    paddingHorizontal: 20,
    letterSpacing: 0.2,
  },
  targetBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)', // Violet tint
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    marginBottom: 24, // Reduced from 40
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  targetBadgeText: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Set counter UI
  setCounterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: isLight ? '#f8fafc' : '#18181b',
    padding: 16,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.05)',
  },
  setCounterLabel: {
    color: isLight ? '#334155' : '#e2e8f0',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  counterButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: isLight ? '#ffffff' : '#27272a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)',
  },
  counterValue: {
    color: isLight ? '#0f172a' : '#fff',
    fontSize: 24,
    fontWeight: '900',
    minWidth: 32,
    textAlign: 'center',
  },

  // Sets List
  setsList: {
    flex: 1, // Take remaining space
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isLight ? '#ffffff' : '#18181b', // Future Card
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.05)',
  },
  setIndexCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: isLight ? '#f1f5f9' : '#27272a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  setIndexText: {
    color: isLight ? '#64748b' : '#a1a1aa',
    fontSize: 14,
    fontWeight: '800',
  },
  inputsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputField: {
    backgroundColor: isLight ? '#f8fafc' : '#09090b', // Deep inset
    borderRadius: 16,
    padding: 14,
    color: isLight ? '#0f172a' : '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '700',
    borderWidth: 1,
    borderColor: isLight ? '#e2e8f0' : '#27272a',
  },
  inputLabel: {
    color: isLight ? '#94a3b8' : '#71717a',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputDivider: {
    fontSize: 20,
    color: isLight ? '#cbd5e1' : '#52525b',
    marginTop: 20,
    fontWeight: '700',
  },

  // Smart Fill Button
  smartFillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingVertical: 10, // Larger hit area
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 24, // Space below it
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  smartFillText: {
    color: '#8b5cf6',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 8,
    textTransform: 'uppercase',
  },

  // Cardio specific
  cardioContainer: {
    padding: 32,
    backgroundColor: isLight ? '#f8fafc' : '#18181b', // Future Card
    borderRadius: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.05)',
  },
  cardioInput: {
    fontSize: 64,
    fontWeight: '900',
    color: '#8b5cf6',
    textAlign: 'center',
    width: 240,
    marginVertical: 16,
    textShadowColor: 'rgba(139, 92, 246, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  cardioUnit: {
    color: isLight ? '#64748b' : '#a1a1aa',
    fontSize: 20,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16, // Use container padding
    marginBottom: 20, // Bottom safety
  },
  button: {
    flex: 1,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cancelButton: {
    backgroundColor: isLight ? '#f1f5f9' : '#18181b',
    borderWidth: 1,
    borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.05)',
  },
  cancelText: {
    color: isLight ? '#64748b' : '#a1a1aa',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  saveButton: {
    backgroundColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  saveText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginRight: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default createWorkoutStyles;
