import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { LogIn } from 'lucide-react'

import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ROTA_INICIAL_POR_PERFIL } from '../../contexts/authContexto'
import { useAuth } from '../../hooks/useAuth'
import { ApiError } from '../../services/api'
import { theme as tokens } from '../../styles/theme'

const bannerLogin = '/images/bannerLogin.png'

/*
 * Recorte da mordida branca ao redor do logo, extraído do próprio asset do
 * Figma (node "1:3283", "Vector 1") — canal alfa invertido: branco opaco só
 * onde o design tinha o "buraco", transparente no resto. Fica em cima do
 * retângulo colorido, com tamanho FIXO (não em %), pra não esticar/encolher
 * com a responsividade — só o retângulo por baixo é que acompanha a largura
 * da tela; a mordida em si mantém sempre a proporção original do Figma.
 */
const curvaLogoRecorte = '/images/curvaLogoRecorte.png'

/*
 * A curva/banner é uma camada decorativa absoluta, fora do fluxo — assim o
 * card fica livre pra ser centralizado verticalmente em 100vh e a tela nunca
 * precisa de scroll, independente da altura da janela.
 *
 * A altura usa `min(vw, vh)` em vez de só `vh`: numa tela alta e estreita
 * (celular em pé), só vh faz a curva crescer desproporcional à largura —
 * "subir demais". Amarrando também à largura, ela cresce em telas largas
 * (desktop, onde a foto pode ocupar mais da página) sem inflar em telas
 * estreitas e altas.
 */
const Tela = styled.div`
  position: relative;
  overflow: hidden;

  width: 100%;
  height: 100vh;

  background: ${({ theme }) => theme.colors.white};
`

/*
 * O recorte da curva (abaixo) tem 368px de altura fixa e fica colado na
 * base do Banner — então o Banner precisa ter pelo menos ~196px (onde o
 * topo arredondado da curva começa, medido no próprio arquivo) pra não
 * cortar bem no meio do arco. Era esse corte que deixava a curva com cara
 * de "pico" pontudo em telas menores: o mínimo antigo (150px) cortava a
 * parte de cima arredondada e só sobrava o lado mais íngreme.
 */
const Banner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 0;

  height: clamp(230px, min(28vw, 38vh), 360px);
  overflow: hidden;
`

/* Confirmado no Figma: gradiente azul → roxo por baixo da foto. Retângulo
   simples — sempre preenche 100% da faixa, acompanhando a tela. */
const Gradiente = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.gradients.border};
`

/* Confirmado no Figma: a foto entra só a 15% de opacidade sobre o gradiente. */
const ImagemBanner = styled.img`
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.15;
`

/*
 * Tamanho fixo (escala 1:1 do frame do Figma, 1280×367.5) — não usa % nem
 * vh, então a mordida ao redor do logo não muda de tamanho com a tela,
 * só sua posição (sempre centralizada, alinhada à base da faixa).
 */
const Recorte = styled.img`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);

  width: 1280px;
  height: 368px;
  pointer-events: none;
`

const Conteudo = styled.div`
  position: relative;
  z-index: 1;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
`

const Cartao = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};

  width: 100%;
  max-width: 300px;
`

const Logo = styled.img`
  width: clamp(90px, 14vh, 140px);
  height: clamp(90px, 14vh, 140px);
  object-fit: cover;
`

const Titulos = styled.div`
  text-align: center;
`

const Titulo = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes.title};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textSecondary};
  letter-spacing: -0.6px;
`

const Subtitulo = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
`

const Campos = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
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
      <Banner aria-hidden="true">
        <Gradiente />
        <ImagemBanner src={bannerLogin} alt="" />
        <Recorte src={curvaLogoRecorte} alt="" />
      </Banner>

      <Conteudo>
      <Cartao onSubmit={aoEnviar} noValidate>
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
            value={username}
            error={erroCampo.username}
            onChange={(evento) => setUsername(evento.target.value)}
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
            value={senha}
            error={erroCampo.senha}
            onChange={(evento) => setSenha(evento.target.value)}
          />
        </Campos>

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
      </Conteudo>
    </Tela>
  )
}
