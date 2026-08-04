import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Eye, EyeOff, KeyRound, LogIn, User } from 'lucide-react'

import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ROTA_INICIAL_POR_PERFIL } from '../../contexts/authContexto'
import { useAuth } from '../../hooks/useAuth'
import { ApiError } from '../../services/api'

const Tela = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.lg};

  background: ${({ theme }) => theme.colors.background};
`

/** Faixa colorida superior — 368px de altura no Figma (doc §4.1). */
const Faixa = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 368px;

  background: ${({ theme }) => theme.gradients.banner};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    height: 260px;
  }
`

const Cartao = styled.form`
  position: relative;
  z-index: 1;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  width: 100%;
  max-width: 380px;
  padding: ${({ theme }) => theme.spacing.xl};

  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.modal};
`

const Logo = styled.img`
  width: 120px;
  height: 120px;
  object-fit: contain;
`

const Titulo = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.purple};
`

const Subtitulo = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: -${({ theme }) => theme.spacing.sm};
`

const Campos = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
`

const Alerta = styled.p`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};

  background: ${({ theme }) => theme.colors.errorBackground};
  border-radius: ${({ theme }) => theme.radius.md};

  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.errorText};
  text-align: center;
`

export default function Login() {
  const navegar = useNavigate()
  const localizacao = useLocation()
  const { entrar, usuario, loading } = useAuth()

  const [username, setUsername] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erroCampo, setErroCampo] = useState<{ username?: string; senha?: string }>({})
  const [erroGeral, setErroGeral] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Quem já está logado não precisa ver o login de novo.
  useEffect(() => {
    if (!loading && usuario) {
      navegar(ROTA_INICIAL_POR_PERFIL[usuario.tipoUsuario], { replace: true })
    }
  }, [usuario, loading, navegar])

  function validar() {
    const erros: typeof erroCampo = {}

    if (!username.trim()) erros.username = 'Informe seu usuário'
    if (!senha) erros.senha = 'Informe sua senha'

    setErroCampo(erros)
    return Object.keys(erros).length === 0
  }

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault()
    setErroGeral('')

    if (!validar()) return

    setEnviando(true)

    try {
      const logado = await entrar(username.trim(), senha)

      // O destino é decidido pelo tipoUsuario que o back devolveu — nunca por
      // uma escolha do usuário na tela (como acontecia antes).
      const destino =
        (localizacao.state as { de?: string } | null)?.de ??
        ROTA_INICIAL_POR_PERFIL[logado.tipoUsuario]

      navegar(destino, { replace: true })
    } catch (erro) {
      setErroGeral(
        erro instanceof ApiError && erro.status === 401
          ? 'Usuário ou senha incorretos.'
          : erro instanceof ApiError
            ? erro.message
            : 'Não foi possível entrar. Tente novamente.',
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Tela>
      <Faixa aria-hidden="true" />

      <Cartao onSubmit={aoEnviar} noValidate>
        <Logo src="/images/logo.png" alt="Studo Jurata" />

        <Titulo>Studo Jurata</Titulo>
        <Subtitulo>Seja bem-vindo!</Subtitulo>

        <Campos>
          <Input
            label="Usuário"
            icon={<User />}
            placeholder="Digite seu usuário"
            autoComplete="username"
            autoFocus
            value={username}
            error={erroCampo.username}
            onChange={(evento) => setUsername(evento.target.value)}
          />

          <Input
            label="Senha"
            type={mostrarSenha ? 'text' : 'password'}
            icon={<KeyRound />}
            iconRight={
              <span
                role="button"
                tabIndex={0}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                style={{ cursor: 'pointer', display: 'inline-flex' }}
                onClick={() => setMostrarSenha((atual) => !atual)}
                onKeyDown={(evento) => {
                  if (evento.key === 'Enter' || evento.key === ' ') {
                    evento.preventDefault()
                    setMostrarSenha((atual) => !atual)
                  }
                }}
              >
                {mostrarSenha ? <EyeOff /> : <Eye />}
              </span>
            }
            placeholder="Digite sua senha"
            autoComplete="current-password"
            value={senha}
            error={erroCampo.senha}
            onChange={(evento) => setSenha(evento.target.value)}
          />
        </Campos>

        {erroGeral && <Alerta role="alert">{erroGeral}</Alerta>}

        <Button type="submit" fullWidth size="large" icon={<LogIn />} loading={enviando}>
          Entrar
        </Button>
      </Cartao>
    </Tela>
  )
}
