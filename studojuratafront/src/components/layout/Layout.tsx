import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu } from 'lucide-react'

import { MENUS, Sidebar } from '../Sidebar'
import { useAuth } from '../../hooks/useAuth'
import { useConfirm } from '../../contexts/confirmContexto'
import * as S from './styles'
import type { LayoutProps } from './types'

const CHAVE_COLAPSO = '@studojurata:sidebarColapsada'

/**
 * Shell das telas autenticadas: sidebar + área de conteúdo (doc §3).
 *
 * O perfil vem do usuário logado — nenhuma página passa `perfil` na mão, o que
 * elimina a chance de uma tela do professor renderizar o menu do admin.
 */
export function Layout({ children, largura = 'default' }: LayoutProps) {
  const navegar = useNavigate()
  const confirmar = useConfirm()
  const { usuario, cargo, sair } = useAuth()

  const [colapsada, setColapsada] = useState(
    () => window.localStorage.getItem(CHAVE_COLAPSO) === 'true',
  )
  const [menuMobileAberto, setMenuMobileAberto] = useState(false)

  useEffect(() => {
    window.localStorage.setItem(CHAVE_COLAPSO, String(colapsada))
  }, [colapsada])

  async function confirmarSaida() {
    const confirmado = await confirmar({
      titulo: 'Sair do Studo Jurata?',
      descricao: 'Você precisará entrar novamente com seu usuário e senha.',
      rotuloConfirmar: 'Sair',
    })

    if (!confirmado) return

    await sair()
    navegar('/', { replace: true })
  }

  if (!usuario) return null

  return (
    <S.Container>
      <Sidebar
        usuario={usuario.nomePessoa ?? usuario.username}
        cargo={cargo}
        perfil={usuario.tipoUsuario}
        itens={MENUS[usuario.tipoUsuario]}
        colapsada={colapsada}
        onToggleCollapse={() => setColapsada((atual) => !atual)}
        onExit={confirmarSaida}
        abertaNoMobile={menuMobileAberto}
        onCloseOnMobile={() => setMenuMobileAberto(false)}
      />

      <S.Area>
        <S.BarraMobile>
          <S.BotaoMenu type="button" aria-label="Abrir menu" onClick={() => setMenuMobileAberto(true)}>
            <Menu />
          </S.BotaoMenu>

          <S.TituloMobile>Studo Jurata</S.TituloMobile>
        </S.BarraMobile>

        <S.Conteudo $largura={largura}>{children}</S.Conteudo>
      </S.Area>
    </S.Container>
  )
}
