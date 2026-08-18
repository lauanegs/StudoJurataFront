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
   Sem quebra de linha entre si (nowrap): botões e campos de filtro/busca
   ficam sempre numa linha só, nunca um empilhado acima do outro — se não
   couber, rola horizontal em vez de quebrar. */
export const LinhaAcoes = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: nowrap;

  width: 100%;
  max-width: 100%;
  overflow-x: auto;
`

export const Acoes = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  flex-wrap: nowrap;
  flex-shrink: 0;
`

/* O <Field> de cada campo (Input/Select) pede width:100% do pai — pensado
   pra preencher uma célula de grid de formulário — e este era, até então,
   um container sem largura própria, então o campo esticava a linha toda do
   cartão (bug real: busca devia ficar compacta, alinhada à direita).
   O max-width dá um teto concreto pra essa cadeia de 100% resolver contra,
   sem depender de nenhum filho específico (funciona tanto pra uma busca
   sozinha quanto para grids de filtro com mais de um campo, como em Notas).
   display:flex + justify-content:flex-end garante que, quando o conteúdo é
   mais estreito que o teto (ex.: um grupo de campos com width:fit-content),
   ele continua encostado na borda direita, em vez de sobrar espaço depois
   dele — sem isso, o conteúdo ficava "flutuando" à esquerda do teto. */
export const Filtros = styled.div`
  display: flex;
  justify-content: flex-end;
  width: fit-content;
  max-width: 600px;
`
