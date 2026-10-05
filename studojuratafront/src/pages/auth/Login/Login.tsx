import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'

import { TelaComBanner } from '@/components/layout/TelaComBanner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ROTA_INICIAL_POR_PERFIL } from '@/contexts/auth/authContexto'
import { useAuth } from '@/hooks/useAuth'
import { ApiError } from '@/services/api'
import { theme as tokens } from '@/styles/theme'
import { useFormularioLogin } from '@/formularios/autenticacao'

import { Cartao, Logo, Titulos, Titulo, Subtitulo, Campos, LinkEsqueciSenha, Alerta } from './styles'

export default function Login() {
  const navegar = useNavigate()
  const localizacao = useLocation()
  const { entrar, usuario, loading } = useAuth()

  const form = useFormularioLogin()
  const [erroGeral, setErroGeral] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Quem já está logado não precisa ver o login de novo.
  useEffect(() => {
    if (!loading && usuario) {
      navegar(ROTA_INICIAL_POR_PERFIL[usuario.tipoUsuario], { replace: true })
    }
  }, [usuario, loading, navegar])

  async function entrarComCredenciais({ username, senha }: { username: string; senha: string }) {
    setErroGeral('')
    setEnviando(true)

    try {
      const logado = await entrar(username.trim(), senha)

      // O destino vem do tipoUsuario devolvido pelo back, nunca de escolha na tela.
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
    <TelaComBanner>
      <Cartao onSubmit={form.onSubmit(entrarComCredenciais, () => setErroGeral(''))} noValidate>
        <Logo src="/images/logo.png" alt="Studo Jurata" />

        <Titulos>
          <Titulo>Studo Jurata</Titulo>
          <Subtitulo>Seja Bem-vindo!</Subtitulo>
        </Titulos>

        <Campos>
          <Input
            aria-label="Usuário"
            corDestaque={tokens.colors.blue}
            altura="52px"
            bordaSolida
            placeholder="usuário"
            autoComplete="username"
            autoFocus
            {...form.getInputProps('username')}
          />

          <Input
            aria-label="Senha"
            type="password"
            alternarVisibilidade
            corDestaque={tokens.colors.blue}
            altura="52px"
            bordaSolida
            placeholder="senha"
            autoComplete="current-password"
            {...form.getInputProps('senha')}
          />
        </Campos>

        <LinkEsqueciSenha href="#" onClick={(evento) => evento.preventDefault()}>
          Esqueci minha senha
        </LinkEsqueciSenha>

        {erroGeral && <Alerta role="alert">{erroGeral}</Alerta>}

        <Button
          type="submit"
          fullWidth
          size="large"
          icon={<LogIn />}
          loading={enviando}
          style={{ background: tokens.gradients.sidebar, borderColor: tokens.colors.blue }}
        >
          Entrar
        </Button>
      </Cartao>
    </TelaComBanner>
  )
}
