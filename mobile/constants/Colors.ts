const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#1e1b4b', // Deep Indigo: Much richer than slate grey "dead" text
    textSecondary: '#4c1d95', // Rich Purple-Grey
    background: '#f5f3ff', // "Lively" Violet Tint (instead of flat grey)
    tint: '#7c3aed', // Vibrant Violet
    tabIconDefault: '#a78bfa',
    tabIconSelected: '#7c3aed',
    primary: '#7c3aed', // Vibrant Purple
    secondary: '#10b981',
    accent: '#f59e0b',
    card: '#ffffff', // Pure white pop
    border: '#ddd6fe', // Light Violet Border
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
