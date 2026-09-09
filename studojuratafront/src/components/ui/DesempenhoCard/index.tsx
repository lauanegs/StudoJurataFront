import type { ReactNode } from 'react'
import styled from 'styled-components'

import { nivelDesempenho, type NivelDesempenho } from '../../../utils/desempenho'
import { comTamanho } from '../../../utils/redimensionarIcone'

const CORES_NIVEL: Record<NivelDesempenho, string> = {
  baixo: '#FF383C',
  medio: '#FFCC00',
  alto: '#34C759',
}

/* Vertical (cabeçalho em cima, barra embaixo) — usado na grade de 4 por
   linha do Dashboard. Horizontal (cabeçalho à esquerda, porcentagem à
   direita) — confirmado pelo usuário para a lista de "Desempenho por
   simulado", onde os cards ocupam a largura toda, um por linha. */
const Container = styled.article<{ $clicavel: boolean; $horizontal: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  /* Confirmado pelo usuário: numa grade (GradeDesempenho), todo card tem a
     mesma altura — height:100% reforça o stretch que o grid já aplica por
     padrão, garantindo que funcione mesmo fora de um grid (ex.: dentro de
     um flex). */
  width: 100%;
  height: 100%;
  padding: ${({ theme }) => theme.spacing.md};

  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};

  ${({ $horizontal }) =>
    $horizontal &&
    `
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    `}

  ${({ $clicavel, theme }) =>
    $clicavel &&
    `
      cursor: pointer;
      transition: box-shadow ${theme.transition.fast}, transform ${theme.transition.fast};

      &:hover {
        box-shadow: ${theme.shadow.base};
        transform: translateY(-1px);
      }

      &:focus-visible {
        outline: none;
        box-shadow: ${theme.shadow.focus};
      }
    `}
`

/* Selo do ícone (28px, degradê da marca) — mesmo tratamento do ícone de
   título do Card.tsx, só que identificando aqui do que se trata CADA card
   (um simulado) em vez de uma seção inteira. Alinhado ao topo porque o
   título pode quebrar em duas linhas. */
const Cabecalho = styled.div<{ $horizontal: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 0;

  ${({ $horizontal }) => $horizontal && `flex: 1;`}
`

/* Pedido do usuário: sem fundo, ícone em cinza claro — deixa de competir
   visualmente com a barra de porcentagem, que é o dado principal do card. */
const IconeSelo = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: 28px;
  height: 28px;

  color: ${({ theme }) => theme.colors.textTertiary};
`

const Conteudo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 0;
`

// Mesmo tamanho do título dos cards de cabeçalho com fundo transparente
// (ver Card.tsx, corpoComFundo) — hierarquia consistente entre os dois.
const Titulo = styled.strong`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textSecondary};
`

const Descricao = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textTertiary};
`

/* No layout vertical, barra cheia na base — a porcentagem é o dado
   principal do card, então ganha destaque e largura total, sem competir
   visualmente com o selo do cabeçalho. No horizontal, vira um bloco de
   largura fixa à direita (não pode encolher com o cabeçalho). */
const BarraPorcentagem = styled.div<{ $cor: string; $horizontal: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;

  padding: ${({ theme }) => theme.spacing.sm};

  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ $cor }) => $cor};

  /* Confirmado pelo usuário: a barra fica sempre na extrema inferior do
     card, mesmo quando a descrição de outro card na mesma linha ocupa mais
     linhas — margin-top:auto empurra a barra pro fim do container flex
     (coluna), independente da altura do cabeçalho acima dela. Só faz
     sentido no layout vertical: no horizontal a barra já é um bloco à
     direita, alinhado ao centro da linha. */
  ${({ $horizontal }) =>
    $horizontal
      ? `
      flex-shrink: 0;
      min-width: 96px;
    `
      : `
      margin-top: auto;
    `}
`

const Valor = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.white};
  font-variant-numeric: tabular-nums;
`

interface DesempenhoCardProps {
  titulo: string
  descricao?: ReactNode
  /** 0 a 100. */
  porcentagem: number
  /** Selo no cabeçalho, ao lado do título — identifica do que se trata o card (ex.: simulado). */
  icon?: ReactNode
  /** 'vertical' (padrão): cabeçalho em cima, barra embaixo — pra grades compactas. 'horizontal': cabeçalho à esquerda, porcentagem à direita — pra listas de largura total. */
  orientacao?: 'vertical' | 'horizontal'
  /** Quando informado, o card vira um botão — usado pra abrir o detalhamento do simulado. */
  onClick?: () => void
}

export function DesempenhoCard({
  titulo,
  descricao,
  porcentagem,
  icon,
  orientacao = 'vertical',
  onClick,
}: DesempenhoCardProps) {
  const valor = Math.min(100, Math.max(0, porcentagem))
  const cor = CORES_NIVEL[nivelDesempenho(valor)]
  const horizontal = orientacao === 'horizontal'

  return (
    <Container
      $clicavel={Boolean(onClick)}
      $horizontal={horizontal}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (evento) => {
              if (evento.key === 'Enter' || evento.key === ' ') {
                evento.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      <Cabecalho $horizontal={horizontal}>
        {icon && <IconeSelo aria-hidden="true">{comTamanho(icon, 16)}</IconeSelo>}

        <Conteudo>
          <Titulo>{titulo}</Titulo>
          {descricao && <Descricao>{descricao}</Descricao>}
        </Conteudo>
      </Cabecalho>

      <BarraPorcentagem
        $cor={cor}
        $horizontal={horizontal}
        role="progressbar"
        aria-valuenow={Math.round(valor)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Desempenho em ${titulo}`}
      >
        <Valor>{Math.round(valor)}%</Valor>
      </BarraPorcentagem>
    </Container>
  )
}
