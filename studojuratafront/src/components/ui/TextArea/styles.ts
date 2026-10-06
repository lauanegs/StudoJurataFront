import { theme as tokens } from '@/styles/theme'
import { corComOpacidade } from '@/utils/corComOpacidade'

export const estilosCampo = (temErro: boolean, emFoco: boolean) => ({
  input: {
    minHeight: '96px',
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    borderWidth: '2px',
    borderColor: corComOpacidade(temErro ? tokens.colors.error : tokens.colors.buttonPurple, emFoco ? 1 : 0.45),
    boxShadow: tokens.shadow.base,
    transition: `border-color ${tokens.transition.base}`,
  },
})
