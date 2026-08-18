import { Group, Modal as MantineModal, Text } from '@mantine/core'

import { theme as tokens } from '../../../styles/theme'
import type { ModalProps } from './types'

/**
 * Trap de foco, fechar no Esc, restaurar foco anterior e travar o scroll do
 * body eram ~45 linhas de useEffect na mão — a Mantine já cobre tudo isso
 * por padrão (trapFocus/closeOnEscape/returnFocus/lockScroll).
 *
 * Usa os componentes compostos (Modal.Root/Content/Header/Body) em vez do
 * atalho <Modal> pra manter o rodapé fixo fora da área que rola, igual era
 * antes com <S.Rodape> fora de <S.Corpo>.
 */
export function Modal({
  aberto,
  onClose,
  titulo,
  descricao,
  children,
  rodape,
  largura,
  bloqueado = false,
}: ModalProps) {
  return (
    <MantineModal.Root
      opened={aberto}
      onClose={onClose}
      size={largura ?? '440px'}
      closeOnEscape={!bloqueado}
      closeOnClickOutside={!bloqueado}
      radius="md"
    >
      <MantineModal.Overlay backgroundOpacity={0.35} blur={4} />
      <MantineModal.Content>
        <MantineModal.Header>
          <div>
            <MantineModal.Title
              style={{
                fontSize: tokens.typography.sizes.md,
                fontWeight: tokens.typography.weights.semiBold,
                color: tokens.colors.textSecondary,
              }}
            >
              {titulo}
            </MantineModal.Title>
            {descricao && (
              <Text size="xs" c={tokens.colors.textSecondary}>
                {descricao}
              </Text>
            )}
          </div>
          <MantineModal.CloseButton aria-label="Fechar" disabled={bloqueado} />
        </MantineModal.Header>

        <MantineModal.Body>{children}</MantineModal.Body>

        {rodape && (
          <Group
            justify="flex-end"
            gap="md"
            style={{ padding: `0 ${tokens.spacing.xl} ${tokens.spacing.xl}` }}
          >
            {rodape}
          </Group>
        )}
      </MantineModal.Content>
    </MantineModal.Root>
  )
}
