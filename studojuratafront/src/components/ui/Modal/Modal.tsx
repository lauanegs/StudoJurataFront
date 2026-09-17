import { Group, Modal as MantineModal, Text } from '@mantine/core'

import { theme as tokens } from '../../../styles/theme'
import type { ModalProps } from './types'

/** Componentes compostos em vez de <Modal> para o rodapé ficar fora da área que rola. */
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
          // Mesmo padding lateral do Header/Body da Mantine.
          <Group
            justify="flex-end"
            gap="md"
            style={{ padding: `0 var(--mantine-spacing-md) ${tokens.spacing.xl}` }}
          >
            {rodape}
          </Group>
        )}
      </MantineModal.Content>
    </MantineModal.Root>
  )
}
