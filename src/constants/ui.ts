/**
 * Design Tokens - Brand colors, spacing, and reusable UI values
 * Used throughout the application for consistency
 * 
 * To use: import { COLORS, SPACING } from '@/constants/ui'
 */

export const COLORS = {
  // Primary brand color - Blue
  primary: '#2563eb',
  primaryDark: '#1e40af',
  
  // Accent colors from visual guide
  accent: {
    lightBlue: '#60a5fa',
    blue: '#2563eb',
    darkBlue: '#1e40af',
    teal: '#06b6d4',
  },
  
  // Neutral scale - text and backgrounds
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Semantic colors
  background: '#ffffff',
  text: '#111827',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  shadow: '#00000010',

  // Convenience aliases for accents
  accentBlue: '#2563eb',
  accentLightBlue: '#60a5fa',
  accentTeal: '#06b6d4',
} as const;

export const SPACING = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const;

export const TYPOGRAPHY = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"Fira Code", "Courier New", monospace',
  },
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
} as const;

export const TRANSITIONS = {
  fast: 'transition-all duration-150',
  base: 'transition-all duration-300',
  slow: 'transition-all duration-500',
} as const;

export const BORDER_RADIUS = {
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

export const Z_INDEX = {
  hide: '-1',
  base: '0',
  dropdown: '40',
  sticky: '50',
  header: '50',
  modal: '100',
  tooltip: '110',
  notification: '120',
} as const;
