const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#0f172a',
    textSecondary: '#64748b',
    background: '#f8fafc',
    tint: '#8b5cf6',
    tabIconDefault: '#94a3b8',
    tabIconSelected: '#8b5cf6',
    primary: '#8b5cf6',
    secondary: '#10b981',
    accent: '#f59e0b',
    card: '#ffffff',
    border: '#f1f5f9',
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
