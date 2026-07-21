import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { GlobalStyle } from '../../styles/global'
import { ShieldAlert } from 'lucide-react'

const Wrapper = styled.div`
  width: 100%;
  min-height: 100vh;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;

  background: #E6EAF2;
  text-align: center;
  padding: 24px;
`

const Titulo = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: #374151;
`

const Descricao = styled.p`
  font-size: 15px;
  color: #6b7280;
  max-width: 420px;
`

const VoltarButton = styled.button`
  padding: 12px 32px;
  border: none;
  border-radius: 999px;

  background: #049DBF;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;

  cursor: pointer;

  &:hover {
    background: #037e99;
  }
`

export default function Unauthorized() {
  const navigate = useNavigate()

  return (
    <>
      <GlobalStyle />

      <Wrapper>
        <ShieldAlert size={64} color="#e0525c" />
        <Titulo>Acesso não autorizado</Titulo>
        <Descricao>
          Você não tem permissão para acessar esta página. Faça login novamente com um usuário
          que tenha o perfil adequado.
        </Descricao>
        <VoltarButton onClick={() => navigate('/')}>Voltar para o login</VoltarButton>
      </Wrapper>
    </>
  )
}
