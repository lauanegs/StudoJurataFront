import styled from 'styled-components'

/**
 * "Seção" de vínculo: título + botão de ação alinhados numa linha,
 * chips/dica embaixo — separada do resto do formulário por uma borda
 * superior. Nasceu do vínculo questão/aula↔conteúdo (VinculoConteudoQuestao/
 * VinculoConteudoAula), mas o padrão é genérico o bastante pra qualquer
 * "escolher um ou mais itens existentes" (ex.: alunos de um simulado em
 * SimuladoFormulario) — confirmado pelo usuário: mesma seção em todo botão
 * de vincular, não só conteúdo.
 */
export const SecaoVinculo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};

  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`

export const CabecalhoVinculo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`

export const TituloVinculo = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const DicaVinculo = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textTertiary};
`

export const ChipsVinculo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`

export const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`
