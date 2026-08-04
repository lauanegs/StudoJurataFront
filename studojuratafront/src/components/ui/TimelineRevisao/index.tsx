import styled from 'styled-components'

import { formatarData } from '../../../utils/format'

const Lista = styled.ol`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  padding-left: ${({ theme }) => theme.spacing.sm};
`

const Item = styled.li<{ $estado: 'concluido' | 'atual' | 'futuro' }>`
  position: relative;
  padding-left: ${({ theme }) => theme.spacing.lg};

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 4px;

    width: 12px;
    height: 12px;

    border-radius: ${({ theme }) => theme.radius.circle};
    background: ${({ theme, $estado }) =>
      $estado === 'concluido'
        ? theme.colors.success
        : $estado === 'atual'
          ? theme.colors.purple
          : theme.colors.borderStrong};
  }

  /* Linha que conecta os pontos, exceto no último item. */
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 5px;
    top: 20px;
    bottom: -${({ theme }) => theme.spacing.md};

    width: 2px;
    background: ${({ theme }) => theme.colors.border};
  }
`

const Titulo = styled.strong`
  display: block;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textStrong};
`

const Data = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export interface EtapaRevisao {
  titulo: string
  data?: string
  estado: 'concluido' | 'atual' | 'futuro'
  detalhe?: string
}

interface TimelineRevisaoProps {
  etapas: EtapaRevisao[]
}

export function TimelineRevisao({ etapas }: TimelineRevisaoProps) {
  return (
    <Lista>
      {etapas.map((etapa, indice) => (
        <Item key={`${etapa.titulo}-${indice}`} $estado={etapa.estado}>
          <Titulo>{etapa.titulo}</Titulo>
          <Data>
            {etapa.data ? formatarData(etapa.data) : 'Sem data'}
            {etapa.detalhe ? ` · ${etapa.detalhe}` : ''}
          </Data>
        </Item>
      ))}
    </Lista>
  )
}
