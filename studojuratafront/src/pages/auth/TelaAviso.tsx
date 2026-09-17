import type { ReactNode } from 'react'
import styled from 'styled-components'

const Tela = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};

  width: 100%;
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.lg};

  text-align: center;
`

const Icone = styled.div<{ $fundo: string; $cor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 88px;
  height: 88px;

  border-radius: ${({ theme }) => theme.radius.circle};
  background: ${({ $fundo }) => $fundo};
  color: ${({ $cor }) => $cor};

  svg {
    width: 40px;
    height: 40px;
  }
`

const Titulo = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.textStrong};
`

const Descricao = styled.p<{ $larguraMaxima: string }>`
  max-width: ${({ $larguraMaxima }) => $larguraMaxima};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

interface TelaAvisoProps {
  icone: ReactNode
  corIcone: string
  fundoIcone: string
  titulo: string
  descricao: string
  larguraDescricao: string
  acao: ReactNode
}

/** Tela cheia de aviso de navegação (acesso negado, página inexistente). */
export function TelaAviso({ icone, corIcone, fundoIcone, titulo, descricao, larguraDescricao, acao }: TelaAvisoProps) {
  return (
    <Tela>
      <Icone aria-hidden="true" $fundo={fundoIcone} $cor={corIcone}>
        {icone}
      </Icone>
      <Titulo>{titulo}</Titulo>
      <Descricao $larguraMaxima={larguraDescricao}>{descricao}</Descricao>
      {acao}
    </Tela>
  )
}
