import styled from 'styled-components'

export const Container = styled.header`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  width: 100%;
`

/* Título, ações e busca ficam no mesmo cartão branco da listagem. */
export const Cartao = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.xl};

  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.base};
`

/* Voltar + título; o subtítulo fica abaixo, recuado para alinhar com o título. */
export const LinhaTitulo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`

/* spacing.xxl bate com a caixa visual do título em 32px. */
export const Voltar = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: ${({ theme }) => theme.spacing.xxl};
  height: ${({ theme }) => theme.spacing.xxl};
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;

  transition: filter ${({ theme }) => theme.transition.base};

  &:hover {
    filter: brightness(0.96);
  }
`

export const Titulos = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  min-width: 0;
`

export const Titulo = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: ${({ theme }) => theme.typography.sizes.xl};
  }
`

/* Um item por linha; com botão de voltar, recua para alinhar com o texto do título. */
export const Subtitulo = styled.div<{ $recuada: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.xs};

  margin-left: ${({ theme, $recuada }) => ($recuada ? `calc(${theme.spacing.xxl} + ${theme.spacing.md})` : 0)};

  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const ItemSubtitulo = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
`

export const IconeSubtitulo = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: 26px;
  height: 26px;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textSecondary};
`

/* Ações e busca ficam numa segunda linha, à direita, nunca ao lado do título.
   flex-wrap em vez de scroll horizontal, para não esconder conteúdo. */
export const LinhaAcoes = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;

  width: 100%;
`

export const Acoes = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  flex-wrap: wrap;
`

/* max-content: o <Field> dos campos ocupa 100% do pai. fit-content quebrava
   cedo quando o filho tinha flex-wrap, e 100% forçava a quebra ao dividir a
   linha com `actions`. max-width garante a quebra quando não cabe. */
export const Filtros = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  width: max-content;
  max-width: 100%;
`

/* Layout de "N campos + botão Buscar" no slot de filtros do Header. */
export const CamposFiltro = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`

/* Largura fixa, informada por tela: dentro de um pai que se ajusta ao
   conteúdo, flex: 1 colapsa o campo. */
export const CampoFiltro = styled.div<{ $largura: string; $encolher?: boolean }>`
  width: ${({ $largura }) => $largura};
  ${({ $encolher }) => ($encolher ? 'flex-shrink: 0;' : '')}
`

export const BotaoFiltro = styled.div`
  width: 150px;
  flex-shrink: 0;

  button {
    width: 100%;
  }
`
