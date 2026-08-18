import styled, { css } from 'styled-components'
import { Check } from 'lucide-react'

import { Button } from '../Button'
import { MoedaIcone } from '../MoedaIcone'
import { animacaoFlutuar } from '../../../styles/animations'

const Container = styled.article<{ $ativa: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  width: 100%;
  min-width: 170px;
  padding: ${({ theme }) => theme.spacing.md};

  background: ${({ theme }) => theme.colors.white};
  border: 2px solid
    ${({ theme, $ativa }) => ($ativa ? theme.colors.success : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radius.md};

  transition: border-color ${({ theme }) => theme.transition.base};
`

const Moldura = styled.div<{ $bloqueada: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 120px;
  height: 120px;

  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.background};
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    ${animacaoFlutuar}

    ${({ $bloqueada }) =>
      $bloqueada &&
      css`
        filter: grayscale(1) brightness(0.9);
        opacity: 0.65;
      `}
  }
`

const Nome = styled.strong`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textStrong};
  text-align: center;
`

const Preco = styled.span<{ $insuficiente: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};

  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme, $insuficiente }) =>
    $insuficiente ? theme.colors.errorText : theme.colors.warningText};
`

export type SkinState = 'equipped' | 'owned' | 'locked'

interface SkinCardProps {
  nome: string
  imagem?: string | null
  custoMoedas: number
  state: SkinState
  /** Saldo do aluno — define se o botão de compra fica habilitado. */
  moedasDisponiveis?: number
  processando?: boolean
  onBuy?: () => void
  onEquip?: () => void
}

/**
 * Card de skin da gamificação.
 *
 * Os três estados vêm da combinação Skin + SkinAluno do back:
 * sem SkinAluno → bloqueada; com SkinAluno.ativa=false → adquirida;
 * com SkinAluno.ativa=true → equipada.
 */
export function SkinCard({
  nome,
  imagem,
  custoMoedas,
  state,
  moedasDisponiveis = 0,
  processando = false,
  onBuy,
  onEquip,
}: SkinCardProps) {
  const locked = state === 'locked'
  const semSaldo = locked && moedasDisponiveis < custoMoedas

  return (
    <Container $ativa={state === 'equipped'}>
      <Moldura $bloqueada={locked}>
        <img src={imagem ?? '/images/skin1.png'} alt={nome} />
      </Moldura>

      <Nome>{nome}</Nome>

      {locked && (
        <Preco $insuficiente={semSaldo}>
          <MoedaIcone size={14} aria-hidden="true" />
          {custoMoedas}
          {semSaldo && ' · saldo insuficiente'}
        </Preco>
      )}

      {state === 'equipped' && (
        <Button variant="success" size="small" icon={<Check />} fullWidth disabled>
          Equipada
        </Button>
      )}

      {state === 'owned' && (
        <Button
          variant="secondary"
          size="small"
          fullWidth
          loading={processando}
          onClick={onEquip}
        >
          Equipar
        </Button>
      )}

      {locked && (
        <Button
          size="small"
          fullWidth
          icon={<MoedaIcone />}
          disabled={semSaldo}
          loading={processando}
          onClick={onBuy}
        >
          Comprar
        </Button>
      )}
    </Container>
  )
}
