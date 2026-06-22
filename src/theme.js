import { createTheme } from '@mantine/core';

// Soft pastel-green ramp; the deep shade (index 8) is used for filled buttons.
const green = [
  '#f0f7f2',
  '#dde9e1',
  '#bcd6c6',
  '#98c2a9',
  '#7bb393',
  '#69aa86',
  '#5fa57e',
  '#4d8e6b',
  '#43805f',
  '#356b4e',
];

export const theme = createTheme({
  primaryColor: 'green',
  primaryShade: { light: 8 },
  colors: { green },
  fontFamily: 'Inter, sans-serif',
  headings: { fontFamily: 'Inter, sans-serif', fontWeight: '700' },
  defaultRadius: 'lg',
});
