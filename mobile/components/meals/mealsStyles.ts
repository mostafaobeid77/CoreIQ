import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  // Meals-specific modal styles
  mealsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealsModalContent: {
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
  mealsModalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  mealsModalSubtitle: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  mealsWaterInput: {
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
  mealsClearButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
  },
  mealsQuickButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 8,
  },
  mealsQuickButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
  },
  mealsQuickButtonText: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '600',
  },
  mealsModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 16,
  },
  mealsModalButton: {
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
  mealsCancelButton: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#444',
  },
  mealsConfirmButton: {
    backgroundColor: '#2563eb',
    borderWidth: 1,
    borderColor: '#1d4ed8',
  },
  mealsCancelButtonText: {
    color: '#aaa',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
  },
  mealsConfirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
  },
  // Quantity input styles
  quantitySection: {
    marginBottom: 20,
  },
  quantityLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  quantityInput: {
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
  quantityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  quantityButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
    minWidth: 80,
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '600',
  },
  // Food info styles
  foodInfoSection: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  foodName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  foodBrand: {
    color: '#888',
    fontSize: 16,
    marginBottom: 16,
  },
  // Macros display
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  macroLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  // Serving selection
  servingSection: {
    marginBottom: 20,
  },
  servingGrid: {
    gap: 8,
  },
  servingButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
  },
  servingButtonSelected: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  servingButtonText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '500',
  },
  servingButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  servingCalories: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  servingCaloriesSelected: {
    color: '#ccc',
  },
  // Meal selection
  mealSection: {
    marginBottom: 20,
  },
  mealGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
  },
  mealButtonSelected: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  mealButtonText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '500',
  },
  mealButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default styles; 