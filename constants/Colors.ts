const tintColorLight = '#5E35B1';
const tintColorDark = '#7C4DFF';

export default {
  primary: '#5E35B1', // Deep purple
  secondary: '#4527A0',
  accent: '#FFD700', // Gold
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
  },
  text: {
    primary: '#212121',
    secondary: '#757575',
    tertiary: '#9E9E9E',
  },
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};