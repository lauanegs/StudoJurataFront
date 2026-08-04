import styled from 'styled-components'
import { CalendarClock, RefreshCcw } from 'lucide-react'

import { Button } from '../Button'
import { Tag } from '../Tag'
import { formatarData } from '../../../utils/format'
import { ROTULO_NIVEL_DOMINIO, NIVEL_DOMINIO_VARIANT } from '../../../utils/labels'
import type { NivelDominio } from '../../../types'

const Container = styled.article<{ $atrasada: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};

  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 4px solid
    ${({ theme, $atrasada }) => ($atrasada ? theme.colors.error : theme.colors.blue)};
  border-radius: ${({ theme }) => theme.radius.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: stretch;
  }
`

const Conteudo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  min-width: 0;
`

const Titulo = styled.strong`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textStrong};
`

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  flex-wrap: wrap;

  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};

  svg {
    width: 12px;
    height: 12px;
  }
`

interface RevisaoConteudoCardProps {
  titulo: string
  dataProximoReforco?: string
  quantidadeReforcos?: number
  nivelDominio?: NivelDominio
  processando?: boolean
  onGenerateReforco?: () => void
}

/**
 * Item da fila de repetição espaçada (/ia/revisao-conteudo).
 * Fica destacado em vermelho quando a data de revisão já passou.
 */
export function RevisaoConteudoCard({
  titulo,
  dataProximoReforco,
  quantidadeReforcos,
  nivelDominio,
  processando = false,
  onGenerateReforco,
}: RevisaoConteudoCardProps) {
  /* eslint-disable react-hooks/purity -- o destaque de "atrasada" compara a
     data agendada com o dia de hoje; ler o relógio no render é intencional. */
  const atrasada = Boolean(
    dataProximoReforco && new Date(`${dataProximoReforco}T00:00:00`).getTime() < Date.now(),
  )
  /* eslint-enable react-hooks/purity */

  return (
    <Container $atrasada={atrasada}>
      <Conteudo>
        <Titulo>{titulo}</Titulo>

        <Meta>
          <CalendarClock aria-hidden="true" />
          {atrasada ? 'Revisão atrasada desde' : 'Próxima revisão em'}{' '}
          {formatarData(dataProximoReforco)}

          {typeof quantidadeReforcos === 'number' && <span>· {quantidadeReforcos} reforço(s)</span>}

          {nivelDominio && (
            <Tag variant={NIVEL_DOMINIO_VARIANT[nivelDominio]} size="small">
              {ROTULO_NIVEL_DOMINIO[nivelDominio]}
            </Tag>
          )}
        </Meta>
      </Conteudo>

      {onGenerateReforco && (
        <Button
          variant="secondary"
          size="small"
          icon={<RefreshCcw />}
          loading={processando}
          onClick={onGenerateReforco}
        >
          Gerar reforço
        </Button>
      )}
    </Container>
  )
}
