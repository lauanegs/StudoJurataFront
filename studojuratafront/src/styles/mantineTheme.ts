import { createTheme, type MantineColorsTuple } from '@mantine/core'

import { theme as tokens } from './theme'

const brandPurple: MantineColorsTuple = [
  '#f7f4fa',
  '#dfd2ec',
  '#c7a8e5',
  '#af82da',
  '#975ccf',
  '#7f39c1',
  '#662e9b',
  '#502479',
  '#391a57',
  '#231035',
]

const brandTeal: MantineColorsTuple = [
  '#f2fbfd',
  '#c7edf6',
  '#8ee9fd',
  '#5ddffc',
  '#2cd5fb',
  '#05c5f0',
  '#049dbf',
  '#037994',
  '#025668',
  '#01323d',
]

const brandDanger: MantineColorsTuple = [
  '#fdf2f2',
  '#f9d7d8',
  '#ffb2b4',
  '#ff9496',
  '#ff7578',
  '#ff575a',
  '#ff383c',
  '#ff0c11',
  '#df0004',
  '#b20004',
]

const brandSuccess: MantineColorsTuple = [
  '#f4fbf6',
  '#d7efdd',
  '#b2ebc1',
  '#92e3a6',
  '#72da8c',
  '#52d272',
  '#34c759',
  '#2ba449',
  '#22813a',
  '#195e2a',
]

const brandNeutral: MantineColorsTuple = [
  '#fafbfc',
  '#eef1f6',
  '#e6eaf2',
  '#d5dce8',
  '#b8c0d1',
  '#9aa3b5',
  '#656565',
  '#525252',
  '#3a3a3a',
  '#202020',
]

export const mantineTheme = createTheme({
  primaryColor: 'brandPurple',
  primaryShade: { light: 6, dark: 4 },
  fontFamily: tokens.typography.family,
  defaultRadius: 'md',

  colors: {
    brandPurple,
    brandTeal,
    brandDanger,
    brandSuccess,
    brandNeutral,
  },

  radius: {
    xs: tokens.radius.sm,
    sm: tokens.radius.sm,
    md: tokens.radius.md,
    lg: tokens.radius.lg,
    xl: tokens.radius.lg,
  },

  spacing: {
    xs: tokens.spacing.xs,
    sm: tokens.spacing.sm,
    md: tokens.spacing.md,
    lg: tokens.spacing.lg,
    xl: tokens.spacing.xl,
  },

  shadows: {
    xs: tokens.shadow.light,
    sm: tokens.shadow.floating,
    md: tokens.shadow.base,
    lg: tokens.shadow.card,
    xl: tokens.shadow.modal,
  },

  fontSizes: {
    xs: tokens.typography.sizes.xs,
    sm: tokens.typography.sizes.sm,
    md: tokens.typography.sizes.md,
    lg: tokens.typography.sizes.lg,
    xl: tokens.typography.sizes.xl,
  },

  breakpoints: {
    xs: tokens.breakpoints.mobile,
    sm: tokens.breakpoints.mobile,
    md: tokens.breakpoints.tablet,
    lg: tokens.breakpoints.desktop,
    xl: tokens.breakpoints.desktop,
  },
})
