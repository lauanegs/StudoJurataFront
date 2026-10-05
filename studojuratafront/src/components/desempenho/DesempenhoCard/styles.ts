import styled from 'styled-components'

/* Vertical: grade compacta. Horizontal: lista de largura total, um card por linha. */
export const Container = styled.article<{ $clicavel: boolean; $horizontal: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  /* Mesma altura entre cards também fora de um grid (ex.: dentro de flex). */
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
export const Cabecalho = styled.div<{ $horizontal: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 0;

  ${({ $horizontal }) => $horizontal && `flex: 1;`}
`

/* Sem fundo e em cinza claro para não competir com a barra de porcentagem. */
export const IconeSelo = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: 28px;
  height: 28px;

  color: ${({ theme }) => theme.colors.textTertiary};
`

export const Conteudo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 0;
`

// Mesmo tamanho do título dos cards de cabeçalho com fundo transparente
// (ver Card.tsx, corpoComFundo) — hierarquia consistente entre os dois.
export const Titulo = styled.strong`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const Descricao = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textTertiary};
`

/* No layout vertical, barra cheia na base — a porcentagem é o dado
   principal do card, então ganha destaque e largura total, sem competir
   visualmente com o selo do cabeçalho. No horizontal, vira um bloco de
   largura fixa à direita (não pode encolher com o cabeçalho). */
export const BarraPorcentagem = styled.div<{ $cor: string; $horizontal: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;

  padding: ${({ theme }) => theme.spacing.sm};

  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ $cor }) => $cor};

  /* margin-top:auto mantém a barra na base mesmo quando o cabeçalho de outro
     card da linha é mais alto. */
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

export const Valor = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.white};
  font-variant-numeric: tabular-nums;
`
