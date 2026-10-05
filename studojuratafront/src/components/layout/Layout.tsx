import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu } from 'lucide-react'

import { MENUS, Sidebar } from './Sidebar'
import { useAuth } from '@/hooks/useAuth'
import { useCursoAluno } from '@/hooks/useCursoAluno'
import { useConfirm } from '@/contexts/confirmContexto'
import * as S from './styles'
import type { LayoutProps } from './types'

const CHAVE_COLAPSO = '@studojurata:sidebarColapsada'

/**
 * Shell das telas autenticadas: sidebar + área de conteúdo.
 *
 * O perfil vem do usuário logado — nenhuma página passa `perfil` na mão, o que
 * elimina a chance de uma tela do professor renderizar o menu do admin.
 */
export function Layout({ children, largura = 'default' }: LayoutProps) {
  const navegar = useNavigate()
  const confirmar = useConfirm()
  const { usuario, cargo, sair } = useAuth()
  // Só aluno com mais de um curso ganha o atalho para escolher outro (a consulta nem roda para os demais perfis).
  const { temVariosCursos, matriculas, turmaId, selecionar } = useCursoAluno()

  const [colapsada, setColapsada] = useState(
    () => window.localStorage.getItem(CHAVE_COLAPSO) === 'true',
  )
  const [menuMobileAberto, setMenuMobileAberto] = useState(false)

  useEffect(() => {
    window.localStorage.setItem(CHAVE_COLAPSO, String(colapsada))
  }, [colapsada])

  async function confirmarSaida() {
    await confirmar({
      titulo: 'Sair do Studo Jurata?',
      descricao: 'Você precisará entrar novamente com seu usuário e senha.',
      rotuloConfirmar: 'Sair',
      aoConfirmar: async () => {
        await sair()
        navegar('/', { replace: true })
      },
    })
  }

  if (!usuario) return null

  const seletorCurso =
    usuario.tipoUsuario === 'ALUNO' && temVariosCursos
      ? {
          opcoes: matriculas.map((matricula) => ({
            value: matricula.turma.id,
            label: `${matricula.turma.curso?.nome ?? matricula.turma.titulo}${matricula.status === 'CONCLUIDA' ? ' (concluído)' : ''}`,
          })),
          valor: turmaId,
          onChange: selecionar,
        }
      : undefined

  return (
    <S.Container>
      <Sidebar
        usuario={usuario.nomePessoa ?? usuario.username}
        cargo={cargo}
        perfil={usuario.tipoUsuario}
        itens={MENUS[usuario.tipoUsuario]}
        seletorCurso={seletorCurso}
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
