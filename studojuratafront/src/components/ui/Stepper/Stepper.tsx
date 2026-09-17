import { Paper, Stepper as MantineStepper } from '@mantine/core'

import { theme as tokens } from '../../../styles/theme'
import type { StepperProps } from './types'

/**
 * Sequência com ordem, diferente do Tab: só é possível voltar a um passo já
 * visitado, nunca pular para frente. O conteúdo de cada passo fica na página.
 */
export function Stepper<V extends string = string>({
  options,
  value,
  onChange,
  rotuloAcessivel = 'Passos do formulário',
}: StepperProps<V>) {
  const indiceAtivo = options.findIndex((option) => option.value === value)

  return (
    <Paper radius="md" shadow="md" style={{ width: '100%', padding: tokens.spacing.xl }}>
      <MantineStepper
        active={indiceAtivo}
        onStepClick={onChange ? (indice) => onChange(options[indice].value) : undefined}
        allowNextStepsSelect={false}
        aria-label={rotuloAcessivel}
      >
        {options.map((option) => (
          <MantineStepper.Step key={option.value} label={option.label} description={option.description} />
        ))}
      </MantineStepper>
    </Paper>
  )
}
