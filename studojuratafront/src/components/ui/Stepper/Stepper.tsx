import { Paper, Stepper as MantineStepper } from '@mantine/core'

import { theme as tokens } from '../../../styles/theme'
import type { StepperProps } from './types'

/**
 * Fluxo passo a passo (ex.: matricular aluno) — diferente do Tab (seções
 * independentes da mesma tela), o Stepper expressa uma sequência com ordem:
 * só é possível clicar de volta num passo já concluído, nunca pular pra
 * frente (onStepClick só chama onChange quando o passo de destino já foi
 * visitado — controlado pela própria página via `value`/`onChange`).
 * O conteúdo de cada passo continua fora daqui, no <Card> da página — o
 * componente só é a barra de progresso no topo.
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
