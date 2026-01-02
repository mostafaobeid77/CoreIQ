import { StyleSheet } from 'react-native';

export const createMealsStyles = (isLight: boolean) => StyleSheet.create({
  // --- FUTURE MODAL STYLES (Zero-Box, Glowing, Spacious) ---

  // 1. The Canvas
  mealsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Darker overlay for focus
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  mealsModalContent: {
    backgroundColor: isLight ? '#ffffff' : '#09090b', // Deepest dark
    width: '96%',
    height: '90%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 0, // We control padding internally
    overflow: 'hidden',
    elevation: 50,
    shadowColor: '#8b5cf6', // Violet shadow glow
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: isLight ? 0.2 : 0.4,
    shadowRadius: 40,
  },

  // 2. The Header (Minimal)
  futureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 10,
    zIndex: 10,
  },
  futureHeaderTitle: {
    color: isLight ? '#0f172a' : '#fff',
    fontSize: 16, // Smaller, understated
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  futureCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isLight ? '#f1f5f9' : '#18181b', // Subtle
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 3. HUD Macros (Head-Up Display - Top)
  futureStickyHeader: {
    backgroundColor: isLight ? '#ffffff' : '#09090b', // Match modal background
    zIndex: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  futureMacrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16, // Slightly reduced to save space
    borderBottomWidth: 1,
    borderBottomColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
  },
  futureMacroItem: {
    alignItems: 'center',
  },
  futureMacroValue: {
    fontSize: 20, // Slightly smaller to fit "Calories" text
    fontWeight: '900',
    color: isLight ? '#0f172a' : '#fff',
    letterSpacing: -0.5,
  },
  futureMacroLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: isLight ? '#94a3b8' : '#71717a',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  // Color accents for macros
  macroColorCal: { color: '#f59e0b' },
  macroColorPro: { color: '#3b82f6' },
  macroColorCarb: { color: '#10b981' },
  macroColorFat: { color: '#8b5cf6' },

  // 4. Food Identity (Floating in space)
  futureFoodInfo: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
    marginTop: 24, // Add space since macros are sticky
  },
  futureFoodName: {
    fontSize: 24, // Balanced size
    fontWeight: '800',
    color: isLight ? '#0f172a' : '#fff',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  futureFoodBrand: {
    fontSize: 14,
    fontWeight: '600',
    color: isLight ? '#64748b' : '#52525b',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // 5. The Reactor (Quantity Core)
  futureReactor: {
    alignItems: 'center',
    marginBottom: 40,
  },
  futureQuantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16, // Reduced from 32 to "hug" the number
    width: '100%', // ensure standard width
  },
  futureQtyBtn: {
    width: 56, // Slightly smaller
    height: 56,
    borderRadius: 20, // Squircle
    backgroundColor: '#8b5cf6', // Brand
    alignItems: 'center',
    justifyContent: 'center',
    // The "Glow"
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 }, // Subtler offset
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  futureQtyInputWrapper: {
    minWidth: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  futureQtyInput: {
    fontSize: 56, // Balanced size
    fontWeight: '900', // Black weight
    color: isLight ? '#0f172a' : '#fff',
    textAlign: 'right', // Align numbers to the right near the unit
    includeFontPadding: false,
    padding: 0,
    height: 70,
    minWidth: 40, // Ensure it has width to tap
  },
  futureUnitSuffix: {
    fontSize: 24, // Smaller than numbers
    fontWeight: '700',
    color: isLight ? '#64748b' : '#52525b',
    marginLeft: 4,
    marginBottom: 8, // slight alignment with baseline
  },
  futureUnitToggle: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10, // Taller touch target
    borderRadius: 20, // Pill Shape
    backgroundColor: isLight ? '#f1f5f9' : '#27272a', // Obvious button bg
    borderWidth: 1, // Subtle border
    borderColor: isLight ? '#e2e8f0' : '#3f3f46',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    elevation: 2, // Slight lift
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  futureUnitText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: isLight ? '#475569' : '#e2e8f0', // High contrast text
    textTransform: 'uppercase',
  },

  // 6. Serving Grid (Pills)
  futureServingRow: {
    flexGrow: 1, // Allow it to fill width
    justifyContent: 'center', // Center content
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 32,
  },
  futureServingPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100, // Pill shape
    backgroundColor: isLight ? '#f8fafc' : '#18181b',
    borderWidth: 1,
    borderColor: isLight ? '#e2e8f0' : '#27272a',
  },
  futureServingPillActive: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  futureServingText: {
    fontSize: 13,
    fontWeight: '700',
    color: isLight ? '#64748b' : '#71717a',
  },
  futureServingTextActive: {
    color: '#fff',
  },

  // 7. Meal Select (Clean Grid)
  futureMealSection: {
    paddingHorizontal: 24,
    marginBottom: 100, // Space for scrolling
  },
  futureSectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    color: isLight ? '#94a3b8' : '#52525b', // Very subtle
    marginBottom: 20,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  futureMealGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  futureMealBtn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: isLight ? '#f8fafc' : '#18181b',
    borderWidth: 1,
    borderColor: isLight ? '#e2e8f0' : '#27272a',
    minWidth: '40%',
    alignItems: 'center',
  },
  futureMealBtnActive: {
    backgroundColor: isLight ? '#fff' : '#000', // Contrast active
    borderColor: '#8b5cf6',
    shadowColor: '#8b5cf6', // Glow active choice
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  futureMealText: {
    fontSize: 14,
    fontWeight: '700',
    color: isLight ? '#64748b' : '#71717a',
  },
  futureMealTextActive: {
    color: '#8b5cf6',
  },

  // 8. Action Footer (Floating)
  futureFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    // Gradient fade effect simulated by solid bg for now
    backgroundColor: isLight ? 'rgba(255,255,255,0.95)' : 'rgba(9,9,11,0.95)',
    borderTopWidth: 1,
    borderTopColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
  },
  futureSaveBtn: {
    height: 64,
    borderRadius: 20,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  futureSaveText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
