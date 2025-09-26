
import { Mood, Theme } from './types';

export const THEMES: Record<Mood, Theme> = {
  [Mood.Calm]: {
    name: 'Calm & Focused',
    description: 'A cool, blue-green scheme that feels clean and trustworthy.',
    light: {
      bg: '#F0F4F8',
      text: '#102A43',
      accent: '#2C7A7B',
    },
    dark: {
      bg: '#102A43',
      text: '#F0F4F8',
      accent: '#95BCBD',
    },
    fonts: {
      heading: "'Poppins', sans-serif",
      body: "'Lato', sans-serif",
    },
  },
  [Mood.Focus]: {
    name: 'Sharp & Productive',
    description: 'A classic neutral base with a blue accent for focus.',
    light: {
      bg: '#FFFFFF',
      text: '#333333',
      accent: '#5A67D8',
    },
    dark: {
      bg: '#1A202C',
      text: '#E2E8F0',
      accent: '#ACB3EB',
    },
    fonts: {
      heading: "'Inter', sans-serif",
      body: "'Inter', sans-serif",
    },
  },
  [Mood.Relaxed]: {
    name: 'Relaxed & Creative',
    description: 'Earthy, subdued tones for a relaxed workspace feel.',
    light: {
      bg: '#FAF9F6',
      text: '#333333',
      accent: '#B5651D',
    },
    dark: {
      bg: '#202020',
      text: '#EAEAEA',
      accent: '#DAB28E',
    },
    fonts: {
      heading: "'Playfair Display', serif",
      body: "'Nunito Sans', sans-serif",
    },
  },
};
