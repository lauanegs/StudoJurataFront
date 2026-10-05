import styled from 'styled-components'

export const Alternativas = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  margin-top: ${({ theme }) => theme.spacing.sm};
`

export const QuestaoCabecalho = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

/* Sem herdar o preto padrão do texto do card — mesmo cinza usado no título
   da revisão do lado aluno (Simulado.tsx). */
export const QuestaoTitulo = styled.strong`
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const Enunciado = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`
