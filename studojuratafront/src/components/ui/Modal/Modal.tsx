import { Group, Modal as MantineModal, Text } from '@mantine/core'

import { theme as tokens } from '@/styles/theme'
import { estiloRodape, estiloTitulo } from './styles'
import type { ModalProps } from './types'

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
            <MantineModal.Title style={estiloTitulo}>{titulo}</MantineModal.Title>
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
          <Group justify="flex-end" gap="md" style={estiloRodape}>
            {rodape}
          </Group>
        )}
      </MantineModal.Content>
    </MantineModal.Root>
  )
}
