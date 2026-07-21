import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { GlobalStyle } from '../../styles/global'
import { useAuth } from '../../hooks/useAuth'
import type { TipoUsuario } from '../../types'

const Wrapper = styled.div`
  width: 100%;
  min-height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(180deg, #049DBF 0%, #037e99 100%);
`

const Card = styled.div`
  width: 100%;
  max-width: 420px;

  display: flex;
  flex-direction: column;
  align-items: center;

  background: #ffffff;
  border-radius: 24px;
  padding: 40px 40px 32px;

  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
`

const Logo = styled.img`
  width: 96px;
  height: 96px;
  margin-bottom: 8px;
`

const Titulo = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: #374151;
`

const Subtitulo = styled.p`
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 24px;
`

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Field = styled.input`
  width: 100%;
  padding: 14px 18px;

  border: 2px solid #d1d5db;
  border-radius: 999px;

  font-size: 15px;
  color: #374151;
  outline: none;

  &:focus {
    border-color: #049DBF;
  }
`

const EntrarButton = styled.button`
  width: 100%;
  padding: 14px;
  margin-top: 8px;

  border: none;
  border-radius: 999px;

  background: #049DBF;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;

  cursor: pointer;

  &:hover {
    background: #037e99;
  }
`

const PerfilRow = styled.div`
  width: 100%;
  display: flex;
  gap: 8px;
  margin-top: 20px;
`

const PerfilButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 8px;
  border-radius: 999px;
  border: 1px solid #d1d5db;

  background: ${({ $active }) => ($active ? '#049DBF' : '#ffffff')};
  color: ${({ $active }) => ($active ? '#ffffff' : '#6b7280')};
  font-size: 12px;
  font-weight: 600;

  cursor: pointer;
`

const Erro = styled.span`
  font-size: 13px;
  color: #e0525c;
`

const PERFIS: { label: string; tipo: TipoUsuario; path: string }[] = [
  { label: 'Administrador', tipo: 'ADMINISTRADOR', path: '/adm' },
  { label: 'Professor', tipo: 'PROFESSOR', path: '/professor' },
  { label: 'Aluno', tipo: 'ALUNO', path: '/aluno' },
]

export default function Login() {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [perfil, setPerfil] = useState<TipoUsuario>('ADMINISTRADOR')
  const [erro, setErro] = useState('')

  const navigate = useNavigate()
  const { login } = useAuth()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!usuario || !senha) {
      setErro('Preencha usuário e senha para entrar.')
      return
    }

    setErro('')
    login(usuario, perfil)

    const destino = PERFIS.find((p) => p.tipo === perfil)?.path ?? '/'
    navigate(destino)
  }

  return (
    <>
      <GlobalStyle />

      <Wrapper>
        <Card>
          <Logo src="/images/logo.png" alt="Studo Jurata" />
          <Titulo>Studo Jurata</Titulo>
          <Subtitulo>Seja Bem-vindo!</Subtitulo>

          <Form onSubmit={handleSubmit}>
            <Field
              placeholder="usuário"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
            <Field
              type="password"
              placeholder="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />

            {erro && <Erro>{erro}</Erro>}

            <EntrarButton type="submit">Entrar</EntrarButton>
          </Form>

          <PerfilRow>
            {PERFIS.map((p) => (
              <PerfilButton
                key={p.tipo}
                type="button"
                $active={perfil === p.tipo}
                onClick={() => setPerfil(p.tipo)}
              >
                {p.label}
              </PerfilButton>
            ))}
          </PerfilRow>
        </Card>
      </Wrapper>
    </>
  )
}
