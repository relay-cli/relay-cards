export const theme = {
  background: '#080B0F',
  surface: '#111820',
  surfaceRaised: '#202A34',
  rule: '#34414D',
  text: '#E8EDF2',
  muted: '#84909C',
  blue: '#48A8FF',
  orange: '#FF8A3D',
  red: '#FF5C6C',
  yellow: '#F4C95D',
  green: '#5DD39E',
} as const;

export type ThemeColor = (typeof theme)[keyof typeof theme];
