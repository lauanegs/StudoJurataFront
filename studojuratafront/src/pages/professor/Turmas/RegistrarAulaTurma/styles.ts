import styled from 'styled-components'
/* Disciplina + aula do plano de aula + Salvar ficam juntos dentro do próprio
   cartão do Header. flex-wrap (não overflow-x: auto): quando o espaço aperta
   os campos quebram pra uma segunda linha, sempre abaixo do título — nunca
   viram uma faixa com scroll horizontal escondendo conteúdo. */
export const CamposCabecalho = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
`

/* Largura concreta: o <Field> ocupa 100% do pai, e só max-width deixava o pai encolher demais. */
export const CampoLargura = styled.div<{ $largura: string }>`
  width: ${({ $largura }) => $largura};
  max-width: 100%;
`

/* Botões "flutuantes" acima da tabela — soltos no fundo cinza da página,
   fora do cartão branco da tabela, não dentro do header dela. */
export const BotoesFlutuantes = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.xs};
`

/* O Salvar não pode encolher junto com o resto da linha (Disciplina + Aula)
   quando o espaço aperta — senão o texto do botão corta. */
export const BotaoSalvar = styled.div`
  flex-shrink: 0;
`

/* Só aparece quando a grade define a carga horária total da disciplina. */
export const ColunaCargaHoraria = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  min-width: 130px;
`

export const TrilhaCargaHoraria = styled.div`
  height: 6px;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.background};
  overflow: hidden;
`

export const PreenchimentoCargaHoraria = styled.div<{ $percentual: number }>`
  height: 100%;
  width: ${({ $percentual }) => Math.min(100, $percentual)}%;
  background: ${({ theme }) => theme.colors.purple};
  border-radius: inherit;
`
