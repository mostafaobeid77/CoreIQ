const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    textSecondary: '#666',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    primary: '#2f95dc',
    secondary: '#00BCD4',
    accent: '#E91E63',
    card: '#f8f9fa',
    border: '#e5e7eb',
    error: '#ef4444',
  },
  dark: {
    text: '#fff',
    textSecondary: '#aaa',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    primary: '#7C4DFF', // Premium purple for dark mode
    secondary: '#03DAC6', // Teal for secondary actions
    accent: '#FF4081', // Pink for highlights
    card: '#1a1a1a',
    border: '#333',
    error: '#ff5252',
  },
};
