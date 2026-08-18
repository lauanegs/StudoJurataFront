import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import styled from 'styled-components'

import { RotaProtegida } from './RotaProtegida'

/**
 * Rotas da aplicação.
 *
 * As páginas são carregadas sob demanda (lazy) para que o bundle inicial
 * contenha apenas o login. Cada área é protegida pelo perfil correspondente,
 * espelhando as regras do SecurityConfig do back.
 */

// --- Autenticação ----------------------------------------------------------
const Login = lazy(() => import('../pages/auth/Login'))
const NaoAutorizado = lazy(() => import('../pages/auth/NaoAutorizado'))
const NaoEncontrada = lazy(() => import('../pages/auth/NaoEncontrada'))

// --- Administrador ---------------------------------------------------------
const AdmHome = lazy(() => import('../pages/adm/Home'))
const AdmTurmas = lazy(() => import('../pages/adm/Turmas/Turmas'))
const AdmTurmaFormulario = lazy(() => import('../pages/adm/Turmas/TurmaFormulario'))
const AdmMatricularAluno = lazy(() => import('../pages/adm/Turmas/MatricularAluno'))
const AdmAlunos = lazy(() => import('../pages/adm/Alunos/Alunos'))
const AdmAlunoFormulario = lazy(() => import('../pages/adm/Alunos/AlunoFormulario'))
const AdmProfessores = lazy(() => import('../pages/adm/Professores/Professores'))
const AdmProfessorFormulario = lazy(() => import('../pages/adm/Professores/ProfessorFormulario'))
const AdmResponsaveis = lazy(() => import('../pages/adm/Responsaveis/Responsaveis'))
const AdmResponsavelFormulario = lazy(
  () => import('../pages/adm/Responsaveis/ResponsavelFormulario'),
)
const AdmCursos = lazy(() => import('../pages/adm/Cursos/Cursos'))
const AdmCursoFormulario = lazy(() => import('../pages/adm/Cursos/CursoFormulario'))
const AdmDisciplinas = lazy(() => import('../pages/adm/Disciplinas/Disciplinas'))
const AdmDisciplinaFormulario = lazy(
  () => import('../pages/adm/Disciplinas/DisciplinaFormulario'),
)
const AdmEventos = lazy(() => import('../pages/adm/Eventos/Eventos'))
const AdmUsuarios = lazy(() => import('../pages/adm/Usuarios/Usuarios'))
const AdmUsuarioFormulario = lazy(() => import('../pages/adm/Usuarios/UsuarioFormulario'))

// --- Professor -------------------------------------------------------------
const ProfessorHome = lazy(() => import('../pages/professor/Home'))
const ProfessorTurmas = lazy(() => import('../pages/professor/Turmas/Turmas'))
const ProfessorTurmaDetalhada = lazy(() => import('../pages/professor/Turmas/TurmaDetalhada'))
const ProfessorPlanosEnsino = lazy(() => import('../pages/professor/PlanoEnsino/PlanosEnsino'))
const ProfessorPlanoEnsinoFormulario = lazy(
  () => import('../pages/professor/PlanoEnsino/PlanoEnsinoFormulario'),
)
const ProfessorConteudosPlano = lazy(() => import('../pages/professor/PlanoEnsino/ConteudosPlano'))
const ProfessorConteudoFormulario = lazy(
  () => import('../pages/professor/PlanoEnsino/ConteudoFormulario'),
)
const ProfessorPlanosAula = lazy(() => import('../pages/professor/PlanoAula/PlanosAula'))
const ProfessorPlanoAulaFormulario = lazy(
  () => import('../pages/professor/PlanoAula/PlanoAulaFormulario'),
)
const ProfessorAulas = lazy(() => import('../pages/professor/PlanoAula/Aulas'))
const ProfessorAulaFormulario = lazy(() => import('../pages/professor/PlanoAula/AulaFormulario'))
const ProfessorRegistrarAula = lazy(() => import('../pages/professor/PlanoAula/RegistrarAula'))
const ProfessorRegistrarAulaTurma = lazy(() => import('../pages/professor/Turmas/RegistrarAulaTurma'))
const ProfessorNotas = lazy(() => import('../pages/professor/Notas/Notas'))
const ProfessorReforco = lazy(() => import('../pages/professor/Reforco/Dashboard'))
const ProfessorSimulados = lazy(() => import('../pages/professor/Reforco/Simulados'))
const ProfessorSimuladoFormulario = lazy(
  () => import('../pages/professor/Reforco/SimuladoFormulario'),
)
const ProfessorResultadosSimulado = lazy(
  () => import('../pages/professor/Reforco/ResultadosSimulado'),
)
const ProfessorResultadoAluno = lazy(() => import('../pages/professor/Reforco/ResultadoAluno'))
const ProfessorSimuladosRealizados = lazy(
  () => import('../pages/professor/Reforco/SimuladosRealizados'),
)
const ProfessorSimuladosAprovacao = lazy(
  () => import('../pages/professor/Reforco/SimuladosAprovacao'),
)
const ProfessorAprovarSimulado = lazy(
  () => import('../pages/professor/Reforco/AprovarSimulado'),
)
const ProfessorQuestoesPendentes = lazy(
  () => import('../pages/professor/Reforco/QuestoesPendentes'),
)
const ProfessorRevisarQuestao = lazy(() => import('../pages/professor/Reforco/RevisarQuestao'))

// --- Aluno -----------------------------------------------------------------
const AlunoHome = lazy(() => import('../pages/aluno/Home'))
const AlunoReforco = lazy(() => import('../pages/aluno/Reforco'))
const AlunoSimulado = lazy(() => import('../pages/aluno/Simulado'))
const AlunoNotas = lazy(() => import('../pages/aluno/Notas'))
const AlunoPerfil = lazy(() => import('../pages/aluno/Perfil'))

const Carregando = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  min-height: 100vh;

  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export function AppRoutes() {
  return (
    <Suspense fallback={<Carregando role="status">Carregando...</Carregando>}>
      <Routes>
        {/* Autenticação */}
        <Route path="/" element={<Login />} />
        <Route path="/nao-autorizado" element={<NaoAutorizado />} />

        {/* Administrador */}
        <Route
          path="/adm"
          element={
            <RotaProtegida perfis={['ADMINISTRADOR']}>
              <AdmHome />
            </RotaProtegida>
          }
        />
        <Route
          path="/adm/turmas"
          element={
            <RotaProtegida perfis={['ADMINISTRADOR']}>
              <AdmTurmas />
            </RotaProtegida>
          }
        />
        <Route
          path="/adm/turmas/nova"
          element={
            <RotaProtegida perfis={['ADMINISTRADOR']}>
              <AdmTurmaFormulario />
            </RotaProtegida>
          }
        />
        <Route
          path="/adm/turmas/:id"
          element={
            <RotaProtegida perfis={['ADMINISTRADOR']}>
              <AdmTurmaFormulario />
            </RotaProtegida>
          }
        />
        <Route
          path="/adm/turmas/:turmaId/matricular"
          element={
            <RotaProtegida perfis={['ADMINISTRADOR']}>
              <AdmMatricularAluno />
            </RotaProtegida>
          }
        />
        <Route
          path="/adm/alunos"
          element={
            <RotaProtegida perfis={['ADMINISTRADOR']}>
              <AdmAlunos />
            </RotaProtegida>
          }
        />
        <Route
          path="/adm/alunos/novo"
          element={
            <RotaProtegida perfis={['ADMINISTRADOR']}>
              <AdmAlunoFormulario />
            </RotaProtegida>
          }
        />
        <Route
          path="/adm/alunos/:id"
          element={
            <RotaProtegida perfis={['ADMINISTRADOR']}>
              <AdmAlunoFormulario />
            </RotaProtegida>
          }
        />
        <Route
          path="/adm/professores"
          element={
            <RotaProtegida perfis={['ADMINISTRADOR']}>
              <AdmProfessores />
            </RotaProtegida>
          }
        />
        <Route
          path="/adm/professores/novo"
          element={
            <RotaProtegida perfis={['ADMINISTRADOR']}>
              <AdmProfessorFormulario />
            </RotaProtegida>
          }
        />
        <Route
          path="/adm/professores/:id"
          element={
            <RotaProtegida perfis={['ADMINISTRADOR']}>
              <AdmProfessorFormulario />
            </RotaProtegida>
          }
        />
        <Route
          path="/adm/responsaveis"
          element={
            <RotaProtegida perfis={['ADMINISTRADOR']}>
              <AdmResponsaveis />
            </RotaProtegida>
          }
        />
        <Route
          path="/adm/responsaveis/novo"
          element={
            <RotaProtegida perfis={['ADMINISTRADOR']}>
              <AdmResponsavelFormulario />
            </RotaProtegida>
          }
        />
        <Route
          path="/adm/responsaveis/:id"
          element={
            <RotaProtegida perfis={['ADMINISTRADOR']}>
              <AdmResponsavelFormulario />
            </RotaProtegida>
          }
        />
        <Route
          path="/adm/cursos"
          element={
            <RotaProtegida perfis={['ADMINISTRADOR']}>
              <AdmCursos />
            </RotaProtegida>
          }
        />
        <Route
          path="/adm/cursos/novo"
          element={
            <RotaProtegida perfis={['ADMINISTRADOR']}>
              <AdmCursoFormulario />
            </RotaProtegida>
          }
        />
        <Route
          path="/adm/cursos/:id"
          element={
            <RotaProtegida perfis={['ADMINISTRADOR']}>
              <AdmCursoFormulario />
            </RotaProtegida>
          }
        />
        <Route
          path="/adm/disciplinas"
          element={
            <RotaProtegida perfis={['ADMINISTRADOR']}>
              <AdmDisciplinas />
            </RotaProtegida>
          }
        />
        <Route
          path="/adm/disciplinas/nova"
          element={
            <RotaProtegida perfis={['ADMINISTRADOR']}>
              <AdmDisciplinaFormulario />
            </RotaProtegida>
          }
        />
        <Route
          path="/adm/disciplinas/:id"
          element={
            <RotaProtegida perfis={['ADMINISTRADOR']}>
              <AdmDisciplinaFormulario />
            </RotaProtegida>
          }
        />
        <Route
          path="/adm/eventos"
          element={
            <RotaProtegida perfis={['ADMINISTRADOR']}>
              <AdmEventos />
            </RotaProtegida>
          }
        />
        <Route
          path="/adm/usuarios"
          element={
            <RotaProtegida perfis={['ADMINISTRADOR']}>
              <AdmUsuarios />
            </RotaProtegida>
          }
        />
        <Route
          path="/adm/usuarios/novo"
          element={
            <RotaProtegida perfis={['ADMINISTRADOR']}>
              <AdmUsuarioFormulario />
            </RotaProtegida>
          }
        />
        <Route
          path="/adm/usuarios/:id"
          element={
            <RotaProtegida perfis={['ADMINISTRADOR']}>
              <AdmUsuarioFormulario />
            </RotaProtegida>
          }
        />
        {/* Professor */}
        <Route
          path="/professor"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorHome />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/turmas"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorTurmas />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/turmas/:turmaId"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorTurmaDetalhada />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/turmas/:turmaId/registrar-aula"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorRegistrarAulaTurma />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/plano-ensino"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorPlanosEnsino />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/plano-ensino/novo"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorPlanoEnsinoFormulario />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/plano-ensino/:id"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorPlanoEnsinoFormulario />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/plano-ensino/:planoId/conteudos"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorConteudosPlano />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/plano-ensino/:planoId/conteudos/novo"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorConteudoFormulario />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/plano-ensino/:planoId/conteudos/:conteudoId"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorConteudoFormulario />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/plano-aula"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorPlanosAula />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/plano-aula/novo"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorPlanoAulaFormulario />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/plano-aula/:id"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorPlanoAulaFormulario />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/plano-aula/:planoAulaId/aulas"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorAulas />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/plano-aula/:planoAulaId/aulas/nova"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorAulaFormulario />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/plano-aula/:planoAulaId/aulas/:aulaId"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorAulaFormulario />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/aulas/:aulaId/registrar"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorRegistrarAula />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/notas"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorNotas />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/reforco"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorReforco />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/reforco/simulados"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorSimulados />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/reforco/simulados/novo"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorSimuladoFormulario />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/reforco/simulados/:id"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorSimuladoFormulario />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/reforco/simulados/:simuladoId/resultados"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorResultadosSimulado />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/reforco/simulados/:simuladoId/resultados/:simuladoAlunoId"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorResultadoAluno />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/reforco/realizados"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorSimuladosRealizados />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/reforco/aprovacao"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorSimuladosAprovacao />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/reforco/aprovacao/:simuladoId"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorAprovarSimulado />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/reforco/questoes"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorQuestoesPendentes />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/reforco/questoes/:questaoId"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorRevisarQuestao />
            </RotaProtegida>
          }
        />

        {/* Aluno */}
        <Route
          path="/aluno"
          element={
            <RotaProtegida perfis={['ALUNO']}>
              <AlunoHome />
            </RotaProtegida>
          }
        />
        <Route
          path="/aluno/reforco"
          element={
            <RotaProtegida perfis={['ALUNO']}>
              <AlunoReforco />
            </RotaProtegida>
          }
        />
        <Route
          path="/aluno/simulado/:simuladoAlunoId"
          element={
            <RotaProtegida perfis={['ALUNO']}>
              <AlunoSimulado />
            </RotaProtegida>
          }
        />
        <Route
          path="/aluno/notas"
          element={
            <RotaProtegida perfis={['ALUNO']}>
              <AlunoNotas />
            </RotaProtegida>
          }
        />
        <Route
          path="/aluno/perfil"
          element={
            <RotaProtegida perfis={['ALUNO']}>
              <AlunoPerfil />
            </RotaProtegida>
          }
        />

        {/* Compatibilidade com os endereços antigos */}
        <Route path="/unauthorized" element={<Navigate to="/nao-autorizado" replace />} />
        <Route path="/professor/planoEnsino/*" element={<Navigate to="/professor/plano-ensino" replace />} />
        <Route path="/professor/planoAula/*" element={<Navigate to="/professor/plano-aula" replace />} />

        <Route path="*" element={<NaoEncontrada />} />
      </Routes>
    </Suspense>
  )
}
