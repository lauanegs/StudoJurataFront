import styled from 'styled-components'

/**
 * "Seção" de conteúdo vinculado: título + botão "Vincular conteúdo"
 * alinhados numa linha, chips/dica embaixo — separada do resto do
 * formulário por uma borda superior, mesmo tratamento visual usado em
 * outras seções internas de card (ex.: navegação entre questões do
 * QuestaoEditor). Compartilhada entre VinculoConteudoQuestao e
 * VinculoConteudoAula: mesma relação (Questao/Aula vinculada a
 * ConteudoPlano), mesma UI.
 */
export const SecaoConteudo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};

  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`

export const CabecalhoConteudo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`

export const TituloConteudo = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const DicaConteudo = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textTertiary};
`

export const ChipsConteudo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`

export const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`
