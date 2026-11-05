export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceHover: string;
  surfacePressed: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  borderSubtle: string;
  borderControl: string;
  primary: string;
  primaryHover: string;
  primaryPressed: string;
  primaryForeground: string;
  link: string;
  linkHover: string;
  selectedBackground: string;
  selectedHover: string;
  selectedForeground: string;
  selectedBorder: string;
  brand: string;
  brandPressed: string;
  brandForeground: string;
  brandMutedForeground: string;
  shadow: string;
  focus: string;
  focusOffset: string;
  disabledBackground: string;
  disabledForeground: string;
  disabledBorder: string;
  inputBackground: string;
  inputForeground: string;
  inputPlaceholder: string;
  inputBorder: string;
  inputBorderHover: string;
  inputBorderFocus: string;
  inputBorderError: string;
  success: string;
  successBackground: string;
  successForeground: string;
  successBorder: string;
  successSolid: string;
  successSolidHover: string;
  successSolidPressed: string;
  successSolidForeground: string;
  warning: string;
  warningBackground: string;
  warningForeground: string;
  warningBorder: string;
  warningSolid: string;
  warningSolidHover: string;
  warningSolidPressed: string;
  warningSolidForeground: string;
  danger: string;
  dangerBackground: string;
  dangerForeground: string;
  dangerBorder: string;
  dangerSolid: string;
  dangerSolidHover: string;
  dangerSolidPressed: string;
  dangerSolidForeground: string;
  info: string;
  infoBackground: string;
  infoForeground: string;
  infoBorder: string;
  infoSolid: string;
  infoSolidHover: string;
  infoSolidPressed: string;
  infoSolidForeground: string;
  scrim: string;
  googleButtonBackground: string;
  googleButtonPressed: string;
  googleButtonBorder: string;
  googleButtonForeground: string;
  progress: string;
  progressBackground: string;
  progressForeground: string;
  progressBorder: string;
  categoryOrganic: string;
  categoryPlastic: string;
  categoryPaper: string;
  categoryUnknown: string;
  accent: string;
}

export const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceHover: '#E4E4E7',
  surfacePressed: '#D4D4D8',
  foreground: '#11181C',
  muted: '#F4F4F5',
  mutedForeground: '#52525B',
  borderSubtle: '#E4E4E7',
  borderControl: '#71717A',
  primary: '#0F766E',
  primaryHover: '#115E59',
  primaryPressed: '#134E4A',
  primaryForeground: '#FFFFFF',
  link: '#0F766E',
  linkHover: '#115E59',
  selectedBackground: '#F0FDFA',
  selectedHover: '#CCFBF1',
  selectedForeground: '#0F766E',
  selectedBorder: '#0D9488',
  brand: '#0B4F5C',
  brandPressed: '#083F49',
  brandForeground: '#FFFFFF',
  brandMutedForeground: '#D3DFE2',
  shadow: '#000000',
  focus: '#0D9488',
  focusOffset: '#FFFFFF',
  disabledBackground: '#F4F4F5',
  disabledForeground: '#71717A',
  disabledBorder: '#D4D4D8',
  inputBackground: '#FFFFFF',
  inputForeground: '#11181C',
  inputPlaceholder: '#71717A',
  inputBorder: '#71717A',
  inputBorderHover: '#3F3F46',
  inputBorderFocus: '#0D9488',
  inputBorderError: '#B91C1C',
  success: '#15803D',
  successBackground: '#F0FDF4',
  successForeground: '#166534',
  successBorder: '#15803D',
  successSolid: '#15803D',
  successSolidHover: '#166534',
  successSolidPressed: '#14532D',
  successSolidForeground: '#FFFFFF',
  warning: '#B45309',
  warningBackground: '#FFFBEB',
  warningForeground: '#92400E',
  warningBorder: '#B45309',
  warningSolid: '#B45309',
  warningSolidHover: '#92400E',
  warningSolidPressed: '#78350F',
  warningSolidForeground: '#FFFFFF',
  danger: '#B91C1C',
  dangerBackground: '#FEF2F2',
  dangerForeground: '#991B1B',
  dangerBorder: '#B91C1C',
  dangerSolid: '#B91C1C',
  dangerSolidHover: '#991B1B',
  dangerSolidPressed: '#7F1D1D',
  dangerSolidForeground: '#FFFFFF',
  info: '#0F766E',
  infoBackground: '#F0FDFA',
  infoForeground: '#0F766E',
  infoBorder: '#0D9488',
  infoSolid: '#0F766E',
  infoSolidHover: '#115E59',
  infoSolidPressed: '#134E4A',
  infoSolidForeground: '#FFFFFF',
  googleButtonBackground: '#FFFFFF',
  googleButtonPressed: '#F2F2F2',
  googleButtonBorder: '#747775',
  googleButtonForeground: '#1F1F1F',
  scrim: 'rgba(9, 9, 11, 0.55)',
  progress: '#1D4ED8',
  progressBackground: '#EFF6FF',
  progressForeground: '#1E40AF',
  progressBorder: '#3B82F6',
  categoryOrganic: '#15803D',
  categoryPlastic: '#A16207',
  categoryPaper: '#1D4ED8',
  categoryUnknown: '#52525B',
  accent: '#F3AA28',
};

export const darkColors: ThemeColors = {
  background: '#000000',
  surface: '#18181B',
  surfaceHover: '#3F3F46',
  surfacePressed: '#52525B',
  foreground: '#ECEDEE',
  muted: '#27272A',
  mutedForeground: '#D4D4D8',
  borderSubtle: '#3F3F46',
  borderControl: '#A1A1AA',
  primary: '#0F766E',
  primaryHover: '#115E59',
  primaryPressed: '#134E4A',
  primaryForeground: '#FFFFFF',
  link: '#5EEAD4',
  linkHover: '#99F6E4',
  selectedBackground: '#134E4A',
  selectedHover: '#115E59',
  selectedForeground: '#99F6E4',
  selectedBorder: '#2DD4BF',
  brand: '#0B4F5C',
  brandPressed: '#083F49',
  brandForeground: '#FFFFFF',
  brandMutedForeground: '#D3DFE2',
  shadow: '#000000',
  focus: '#5EEAD4',
  focusOffset: '#18181B',
  disabledBackground: '#27272A',
  disabledForeground: '#A1A1AA',
  disabledBorder: '#52525B',
  inputBackground: '#18181B',
  inputForeground: '#ECEDEE',
  inputPlaceholder: '#A1A1AA',
  inputBorder: '#A1A1AA',
  inputBorderHover: '#D4D4D8',
  inputBorderFocus: '#5EEAD4',
  inputBorderError: '#F87171',
  success: '#4ADE80',
  successBackground: '#14532D',
  successForeground: '#DCFCE7',
  successBorder: '#4ADE80',
  successSolid: '#15803D',
  successSolidHover: '#166534',
  successSolidPressed: '#14532D',
  successSolidForeground: '#FFFFFF',
  warning: '#FBBF24',
  warningBackground: '#451A03',
  warningForeground: '#FDE68A',
  warningBorder: '#FBBF24',
  warningSolid: '#B45309',
  warningSolidHover: '#92400E',
  warningSolidPressed: '#78350F',
  warningSolidForeground: '#FFFFFF',
  danger: '#FCA5A5',
  dangerBackground: '#450A0A',
  dangerForeground: '#FECACA',
  dangerBorder: '#F87171',
  dangerSolid: '#B91C1C',
  dangerSolidHover: '#991B1B',
  dangerSolidPressed: '#7F1D1D',
  dangerSolidForeground: '#FFFFFF',
  info: '#5EEAD4',
  infoBackground: '#134E4A',
  infoForeground: '#99F6E4',
  infoBorder: '#2DD4BF',
  infoSolid: '#0F766E',
  infoSolidHover: '#115E59',
  infoSolidPressed: '#134E4A',
  infoSolidForeground: '#FFFFFF',
  googleButtonBackground: '#131314',
  googleButtonPressed: '#2A2A2C',
  googleButtonBorder: '#8E918F',
  googleButtonForeground: '#E3E3E3',
  scrim: 'rgba(0, 0, 0, 0.72)',
  progress: '#60A5FA',
  progressBackground: '#172554',
  progressForeground: '#BFDBFE',
  progressBorder: '#60A5FA',
  categoryOrganic: '#4ADE80',
  categoryPlastic: '#FACC15',
  categoryPaper: '#93C5FD',
  categoryUnknown: '#D4D4D8',
  accent: '#F3AA28',
};

export const palette = {
  light: lightColors,
  dark: darkColors,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: '600' as const },
  pageTitle: { fontSize: 28, lineHeight: 35, fontWeight: '600' as const },
  sectionTitle: { fontSize: 20, lineHeight: 26, fontWeight: '600' as const },
  cardTitle: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  button: { fontSize: 15, lineHeight: 20, fontWeight: '600' as const },
  caption: { fontSize: 12, lineHeight: 17, fontWeight: '400' as const },
  metadata: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
} as const;

export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
} as const;
