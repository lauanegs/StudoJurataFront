import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Home,
  KeyRound,
  Layers,
  Library,
  NotebookPen,
  Sparkles,
  UserCog,
  UserRound,
  Users,
} from 'lucide-react'

import type { TipoUsuario } from '../../types'
import type { ItemMenu } from './types'

/**
 * Menu por perfil (doc §7): a sidebar é condicional ao TipoUsuario.
 *
 * Os itens espelham exatamente as áreas que o back autoriza em SecurityConfig
 * — por isso o Aluno não vê Turmas/Planos (só teria GET) e o Professor não vê
 * os cadastros de pessoas, que são POST/PUT/DELETE restritos ao Administrador.
 */
export const MENUS: Record<TipoUsuario, ItemMenu[]> = {
  ADMINISTRADOR: [
    { label: 'Home', caminho: '/adm', icon: <Home /> },
    { label: 'Turmas', caminho: '/adm/turmas', icon: <Users /> },
    { label: 'Alunos', caminho: '/adm/alunos', icon: <GraduationCap /> },
    { label: 'Professores', caminho: '/adm/professores', icon: <UserCog /> },
    { label: 'Responsáveis', caminho: '/adm/responsaveis', icon: <UserRound /> },
    { label: 'Cursos', caminho: '/adm/cursos', icon: <Library /> },
    { label: 'Disciplinas', caminho: '/adm/disciplinas', icon: <BookOpen /> },
    { label: 'Eventos', caminho: '/adm/eventos', icon: <CalendarDays /> },
    { label: 'Usuários', caminho: '/adm/usuarios', icon: <KeyRound /> },
  ],

  PROFESSOR: [
    { label: 'Home', caminho: '/professor', icon: <Home /> },
    { label: 'Turmas', caminho: '/professor/turmas', icon: <Users /> },
    { label: 'Planos de Ensino', caminho: '/professor/plano-ensino', icon: <ClipboardList /> },
    { label: 'Planos de Aula', caminho: '/professor/plano-aula', icon: <Layers /> },
    { label: 'Reforço', caminho: '/professor/reforco', icon: <Sparkles /> },
    { label: 'Desempenho', caminho: '/professor/desempenho', icon: <BarChart3 /> },
    { label: 'Notas', caminho: '/professor/notas', icon: <NotebookPen /> },
  ],

  ALUNO: [
    { label: 'Home', caminho: '/aluno', icon: <Home /> },
    { label: 'Reforço', caminho: '/aluno/reforco', icon: <Sparkles /> },
    { label: 'Notas', caminho: '/aluno/notas', icon: <NotebookPen /> },
    { label: 'Perfil', caminho: '/aluno/perfil', icon: <UserRound /> },
  ],
}
