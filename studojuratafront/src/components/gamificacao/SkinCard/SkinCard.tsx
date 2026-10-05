import { Check } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { MoedaIcone } from '@/components/gamificacao/MoedaIcone'

import { Container, Moldura, Nome, Preco } from './styles'
import type { SkinCardProps } from './types'

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
