import { animacaoFlutuar } from '@/styles/animations'
import { theme } from '@/styles/theme'
import { corComOpacidade } from '@/utils/corComOpacidade'

import styled from 'styled-components'

/* Só o conteúdo abaixo do SimuladoHeader tem padding e largura limitada. */
/* Cinza esmaecido das molduras e das etiquetas neutras (mesmo tom dos cards). */
export const CINZA_ESMAECIDO = corComOpacidade(theme.colors.textTertiary, 0.15)

export const Tela = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  width: 100%;
  min-height: 100vh;
`

export const Conteudo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.md};
`

export const Alternativas = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
`

export const Rodape = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`

/* Mascote ao lado do card, que estica para acompanhar a altura da imagem. */
/* Moldura com o mesmo degradê do EnunciadoSimuladoCard. */
export const FrameResultado = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;

  width: 100%;
  padding: ${({ theme }) => theme.spacing.xl};

  background: ${theme.gradients.frame};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.floating};
`

export const Mascote = styled.img`
  width: 120px;
  height: 180px;
  flex-shrink: 0;
  object-fit: contain;
  ${animacaoFlutuar}
`

export const CardResultado = styled.div<{ $altura?: string }>`
  display: flex;
  flex: 1;
  align-self: ${({ $altura }) => ($altura ? 'auto' : 'stretch')};
  height: ${({ $altura }) => $altura ?? 'auto'};
  min-width: 280px;

  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${CINZA_ESMAECIDO};
  border-radius: ${({ theme }) => theme.radius.md};
`

export const ColunaResultado = styled.div<{ $centralizado?: boolean }>`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: ${({ $centralizado }) => ($centralizado ? 'center' : 'flex-start')};
  gap: ${({ theme }) => theme.spacing.md};
  min-width: 0;
`

export const TextoSecundario = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textTertiary};
`

export const Etiquetas = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
`

export const Etiqueta = styled.span<{ $fundo: string; $claro?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xxs};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ $fundo }) => $fundo};

  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ $claro, theme }) => ($claro ? theme.colors.textSecondary : theme.colors.white)};

  svg {
    width: 16px;
    height: 16px;
  }
`

export const ValorMoedas = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  width: 100%;
  padding: ${({ theme }) => theme.spacing.xs} 0;

  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const NomeParabens = styled.strong`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.xxs};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const DescricaoParabens = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const QuestaoCabecalho = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

export const QuestaoEnunciado = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

/* Sem herdar o preto padrão do texto do card — cinza, como o resto dos textos desta tela. */
export const QuestaoTitulo = styled.strong`
  color: ${({ theme }) => theme.colors.textSecondary};
`
