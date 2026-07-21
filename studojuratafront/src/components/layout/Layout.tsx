import { GlobalStyle } from '../../styles/global'
import { Sidebar } from '../Sidebar'
import * as S from './styles'
import type { LayoutProps } from './types'
import type { SidebarMenuItem } from '../Sidebar/types'

const MENUS: Record<string, SidebarMenuItem[]> = {
  adm: [
    { label: 'Home', path: '/adm' },
    { label: 'Turmas', path: '/adm/turmas' },
    { label: 'Alunos', path: '/adm/alunos' },
    { label: 'Professores', path: '/adm/professores' },
    { label: 'Disciplinas', path: '/adm/disciplinas' },
    { label: 'Responsáveis', path: '/adm/responsaveis' },
  ],
  professor: [
    { label: 'Home', path: '/professor' },
    { label: 'Turmas', path: '/professor/turmas' },
    { label: 'Reforço', path: '/professor/reforco' },
    { label: 'Notas', path: '/professor/notas' },
    { label: 'Planos de Ensino', path: '/professor/planoEnsino' },
    { label: 'Planos de Aula', path: '/professor/planoAula' },
  ],
  aluno: [
    { label: 'Home', path: '/aluno' },
    { label: 'Reforço', path: '/aluno/reforco' },
    { label: 'Notas', path: '/aluno/notas' },
  ],
}

const NOMES: Record<string, { usuario: string; cargo: string }> = {
  adm: { usuario: 'Lauane Gonzaga', cargo: 'Administrador' },
  professor: { usuario: 'Lauane Gonzaga', cargo: 'Professor' },
  aluno: { usuario: 'Cristian Gonzaga', cargo: 'Aluno' },
}

export function Layout({ children, perfil = 'adm' }: LayoutProps) {
  const { usuario, cargo } = NOMES[perfil]

  return (
    <>
      <GlobalStyle />

      <S.Container>
        <Sidebar
          usuario={usuario}
          cargo={cargo}
          menus={MENUS[perfil]}
        />

        <S.Content>
          {children}
        </S.Content>
      </S.Container>
    </>
  )
}
