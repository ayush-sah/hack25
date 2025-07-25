/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#00B6F0'; // FinWorld blue
const tintColorDark = '#00B6F0';

export const Colors = {
  light: {
    text: '#003B5C', // Deep blue for text
    background: '#F2FAFD', // Very light blue background
    tint: tintColorLight,
    icon: '#00B6F0',
    tabIconDefault: '#7AD8F7',
    tabIconSelected: tintColorLight,
    card: '#E6F6FB', // Card backgrounds
    border: '#B3E6FA',
    error: '#FF4D4F',
    success: '#00C48C',
  },
  dark: {
    text: '#E6F6FB', // Light blue for text
    background: '#001F2E', // Deep blue background
    tint: tintColorDark,
    icon: '#00B6F0',
    tabIconDefault: '#3A8DBA',
    tabIconSelected: tintColorDark,
    card: '#003B5C',
    border: '#005B8A',
    error: '#FF4D4F',
    success: '#00C48C',
  },
};
