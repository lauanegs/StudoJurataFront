import type { InputHTMLAttributes, ReactNode } from 'react'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  required?: boolean
  hint?: string
  error?: string
  icon?: ReactNode
  iconRight?: ReactNode
  onClear?: () => void
  mask?: (value: string) => string
  maxWidth?: string
  /** Cor de destaque da borda/foco. Sobrescreve o roxo padrão — usado na tela de login (azul). */
  corDestaque?: string
  /** Altura mínima do campo. @default '56px' */
  altura?: string
  /**
   * Mantém a borda sempre em opacidade total, mesmo sem foco — confirmado no
   * Figma pra tela de login. Nos demais formulários a borda fica esmaecida
   * em repouso e só fica sólida no foco (comportamento padrão).
   */
  bordaSolida?: boolean
  /**
   * Só tem efeito com `type="password"`: troca a implementação por baixo
   * para o `PasswordInput` da Mantine, com botão de olho para mostrar/
   * esconder a senha. Fica fora por padrão — sem essa prop, `type="password"`
   * continua sendo só um campo mascarado (como já era em `UsuarioFormulario`,
   * por exemplo), sem mudar a aparência de nenhuma tela existente.
   */
  alternarVisibilidade?: boolean
  /**
   * Exibe o contador "x/maxLength" abaixo do campo quando `maxLength` está
   * definido. `maxLength` continua limitando a digitação mesmo com o
   * contador escondido — só a exibição do número muda.
   * @default true
   */
  mostrarContador?: boolean
}
