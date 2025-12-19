import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  // Workout-specific modal styles
  workoutModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    width: '95%',
    maxHeight: '95%',
    minHeight: 500,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  workoutModalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  workoutModalSubtitle: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  workoutInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  workoutClearButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
  },
  workoutQuickButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 8,
  },
  workoutQuickButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
  },
  workoutQuickButtonText: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '600',
  },
  workoutModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 16,
  },
  workoutModalButton: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    minHeight: 56,
  },
  workoutCancelButton: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#444',
  },
  workoutConfirmButton: {
    backgroundColor: '#2563eb',
    borderWidth: 1,
    borderColor: '#1d4ed8',
  },
  workoutCancelButtonText: {
    color: '#aaa',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
  },
  workoutConfirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
  },
  // Duration input styles
  durationSection: {
    marginBottom: 20,
  },
  durationLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  durationInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  durationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  durationButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
    minWidth: 80,
    alignItems: 'center',
  },
  durationButtonText: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '600',
  },
  // Workout info styles
  workoutInfoSection: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  workoutName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  workoutType: {
    color: '#888',
    fontSize: 16,
    marginBottom: 16,
  },
  // Stats display
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  // Intensity selection
  intensitySection: {
    marginBottom: 20,
  },
  intensityGrid: {
    gap: 8,
  },
  intensityButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
  },
  intensityButtonSelected: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  intensityButtonText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '500',
  },
  intensityButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  intensityDescription: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  intensityDescriptionSelected: {
    color: '#ccc',
  },
  // Category selection
  categorySection: {
    marginBottom: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
  },
  categoryButtonSelected: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  categoryButtonText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '500',
  },
  categoryButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default styles;
