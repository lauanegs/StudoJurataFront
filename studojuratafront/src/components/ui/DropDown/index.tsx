import { useId, useState, type ReactNode } from 'react'
import styled from 'styled-components'
import { ChevronDown } from 'lucide-react'

const Container = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  overflow: hidden;
`

const Gatilho = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};

  text-align: left;
  transition: background ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadow.focus};
  }
`

const Titulo = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textStrong};
`

const Direita = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const Resumo = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.purple};
  font-variant-numeric: tabular-nums;
`

const Chevron = styled.span<{ $aberto: boolean }>`
  display: inline-flex;
  color: ${({ theme }) => theme.colors.textTertiary};
  transition: transform ${({ theme }) => theme.transition.base};
  transform: rotate(${({ $aberto }) => ($aberto ? '180deg' : '0deg')});

  svg {
    width: 18px;
    height: 18px;
  }
`

const Corpo = styled.div`
  padding: 0 ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`

const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};

  padding: ${({ theme }) => theme.spacing.xs} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};

  &:last-child {
    border-bottom: none;
  }
`

const Vazio = styled.p`
  padding: ${({ theme }) => theme.spacing.sm} 0;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textTertiary};
`

export interface ItemDropDown {
  label: string
  value: ReactNode
}

interface DropDownProps {
  titulo: string
  resumo?: string
  itens?: ItemDropDown[]
  children?: ReactNode
  abertoInicialmente?: boolean
  emptyText?: string
}

export function DropDown({
  titulo,
  resumo,
  itens = [],
  children,
  abertoInicialmente = false,
  emptyText = 'Nenhum lançamento neste período.',
}: DropDownProps) {
  const idCorpo = useId()
  const [aberto, setAberto] = useState(abertoInicialmente)

  return (
    <Container>
      <Gatilho
        type="button"
        aria-expanded={aberto}
        aria-controls={idCorpo}
        onClick={() => setAberto((atual) => !atual)}
      >
        <Titulo>{titulo}</Titulo>

        <Direita>
          {resumo && <Resumo>{resumo}</Resumo>}
          <Chevron $aberto={aberto} aria-hidden="true">
            <ChevronDown />
          </Chevron>
        </Direita>
      </Gatilho>

      {aberto && (
        <Corpo id={idCorpo}>
          {children}

          {!children && itens.length === 0 && <Vazio>{emptyText}</Vazio>}

          {!children &&
            itens.map((item, indice) => (
              <Item key={`${item.label}-${indice}`}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </Item>
            ))}
        </Corpo>
      )}
    </Container>
  )
}
