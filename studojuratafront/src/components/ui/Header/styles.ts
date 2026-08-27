import styled from 'styled-components'

export const Container = styled.header`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  width: 100%;
`

/* Confirmado no Figma: título + ações (e a busca, quando existe) ficam
   dentro do mesmo cartão branco da listagem, não soltos no fundo cinza. */
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

export const Voltar = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  align-self: flex-start;

  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.textSecondary};

  transition: color ${({ theme }) => theme.transition.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.purple};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`

export const Titulos = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  min-width: 0;
`

export const Titulo = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes.title};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: ${({ theme }) => theme.typography.sizes.xxl};
  }
`

export const Subtitulo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;

  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

/* Confirmado no Figma (turma detalhada, lista de Planos de Ensino, formulário
   "Novo conteúdo" — mesmo padrão nos três): o título nunca divide linha com
   ações. Ações e busca ficam juntas, numa segunda linha, alinhadas à direita
   do cartão — nunca uma ação "grudada" ao lado do título.
   flex-wrap (não nowrap + overflow-x: auto): quando o conjunto de
   botões/campos não cabe numa linha só, ele quebra pra uma linha extra
   abaixo — nunca vira uma faixa com scroll horizontal escondendo conteúdo. */
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

/* O <Field> de cada campo (Input/Select) pede width:100% do pai — pensado
   pra preencher uma célula de grid de formulário — e este era, até então,
   um container sem largura própria, então o campo esticava a linha toda do
   cartão (bug real: busca devia ficar compacta, alinhada à direita).
   `width: fit-content` quebrava quando o conteúdo interno também tinha
   flex-wrap (o cálculo de shrink-to-fit considerava a versão já quebrada em
   duas linhas do filho, deixando o container mais estreito do que o
   necessário — forçava um wrap prematuro mesmo sobrando espaço).
   `width: 100%` corrigia esse caso, mas quebrava o outro: quando o Header
   tem `actions` E `filtros` juntos (ex.: "Adicionar turma" + busca), o
   Filtros a 100% da LinhaAcoes somado à largura das actions estourava a
   linha e forçava os dois a quebrarem — mesmo cabendo os dois lado a lado.
   `width: max-content` resolve os dois: diferente de fit-content, o
   max-content ignora oportunidades de quebra do conteúdo interno (sempre
   calcula a largura "linha única"), então não sofre o bug de shrink-to-fit;
   e como não é 100%, não força a quebra com as actions ao lado. max-width
   continua garantindo a quebra de verdade quando realmente não cabe. */
export const Filtros = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  width: max-content;
  max-width: 100%;
`
