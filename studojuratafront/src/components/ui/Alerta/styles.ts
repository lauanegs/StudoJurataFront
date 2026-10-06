import { theme as tokens } from '@/styles/theme'

export const estilosAlerta = {
  root: { backgroundColor: tokens.colors.infoBackground, border: `1px solid ${tokens.colors.info}` },
  title: { color: tokens.colors.infoText, fontWeight: tokens.typography.weights.semiBold },
  message: { color: tokens.colors.textSecondary, fontSize: tokens.typography.sizes.sm },
  icon: { color: tokens.colors.info },
}
