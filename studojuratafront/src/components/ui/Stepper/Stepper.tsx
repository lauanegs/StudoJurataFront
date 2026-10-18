import { Stepper as MantineStepper } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'

import { theme as tokens } from '@/styles/theme'

import { Envelope } from './styles'
import type { StepperProps } from './types'

export function Stepper<V extends string = string>({
  options,
  value,
  onChange,
  rotuloAcessivel = 'Passos do formulário',
}: StepperProps<V>) {
  const mobile = useMediaQuery(`(max-width: ${tokens.breakpoints.mobile})`)
  const indiceAtivo = options.findIndex((option) => option.value === value)

  return (
    <Envelope>
      <MantineStepper
        active={indiceAtivo}
        onStepClick={onChange ? (indice) => onChange(options[indice].value) : undefined}
        allowNextStepsSelect={false}
        orientation={mobile ? 'vertical' : 'horizontal'}
        iconSize={mobile ? 32 : undefined}
        wrap={!mobile}
        aria-label={rotuloAcessivel}
      >
        {options.map((option) => (
          <MantineStepper.Step key={option.value} label={option.label} description={option.description} />
        ))}
      </MantineStepper>
    </Envelope>
  )
}
