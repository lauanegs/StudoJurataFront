import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { GuardaCursoAluno } from './GuardaCursoAluno'
import { RotaProtegida } from './RotaProtegida'
import { CarregandoTela } from '@/components/feedback/CarregandoTela'

/** Rotas da aplicação */

// --- Autenticação ---------------------------------------------------------
const Login = lazy(() => import('@/pages/auth/Login/Login'))
const NaoAutorizado = lazy(() => import('@/pages/auth/NaoAutorizado/NaoAutorizado'))
const NaoEncontrada = lazy(() => import('@/pages/auth/NaoEncontrada/NaoEncontrada'))

// --- Administrador --------------------------------------------------------
const AdmHome = lazy(() => import('@/pages/adm/Home/Home'))
const AdmTurmas = lazy(() => import('@/pages/adm/Turmas/Turmas'))
const AdmTurmaFormulario = lazy(() => import('@/pages/adm/Turmas/TurmaFormulario/TurmaFormulario'))
const AdmMatricularAluno = lazy(() => import('@/pages/adm/Turmas/MatricularAluno/MatricularAluno'))
const AdmAlunos = lazy(() => import('@/pages/adm/Alunos/Alunos'))
const AdmAlunoFormulario = lazy(() => import('@/pages/adm/Alunos/AlunoFormulario/AlunoFormulario'))
const AdmProfessores = lazy(() => import('@/pages/adm/Professores/Professores'))
const AdmProfessorFormulario = lazy(() => import('@/pages/adm/Professores/ProfessorFormulario/ProfessorFormulario'))
const AdmResponsaveis = lazy(() => import('@/pages/adm/Responsaveis/Responsaveis'))
const AdmResponsavelFormulario = lazy(
  () => import('@/pages/adm/Responsaveis/ResponsavelFormulario/ResponsavelFormulario'),
)
const AdmCursos = lazy(() => import('@/pages/adm/Cursos/Cursos'))
const AdmCursoFormulario = lazy(() => import('@/pages/adm/Cursos/CursoFormulario/CursoFormulario'))
const AdmDisciplinas = lazy(() => import('@/pages/adm/Disciplinas/Disciplinas'))
const AdmDisciplinaFormulario = lazy(
  () => import('@/pages/adm/Disciplinas/DisciplinaFormulario/DisciplinaFormulario'),
)
const AdmEventos = lazy(() => import('@/pages/adm/Eventos/Eventos'))
const AdmUsuarios = lazy(() => import('@/pages/adm/Usuarios/Usuarios'))
const AdmUsuarioFormulario = lazy(() => import('@/pages/adm/Usuarios/UsuarioFormulario/UsuarioFormulario'))

// --- Professor ------------------------------------------------------------
const ProfessorHome = lazy(() => import('@/pages/professor/Home/Home'))
const ProfessorTurmas = lazy(() => import('@/pages/professor/Turmas/Turmas'))
const ProfessorTurmaDetalhada = lazy(() => import('@/pages/professor/Turmas/TurmaDetalhada/TurmaDetalhada'))
const ProfessorPlanosEnsino = lazy(() => import('@/pages/professor/PlanoEnsino/PlanosEnsino/PlanosEnsino'))
const ProfessorPlanoEnsinoFormulario = lazy(
  () => import('@/pages/professor/PlanoEnsino/PlanoEnsinoFormulario/PlanoEnsinoFormulario'),
)
const ProfessorConteudosPlano = lazy(() => import('@/pages/professor/PlanoEnsino/ConteudosPlano/ConteudosPlano'))
const ProfessorConteudoFormulario = lazy(
  () => import('@/pages/professor/PlanoEnsino/ConteudoFormulario/ConteudoFormulario'),
)
const ProfessorPlanosAula = lazy(() => import('@/pages/professor/PlanoAula/PlanosAula/PlanosAula'))
const ProfessorPlanoAulaFormulario = lazy(
  () => import('@/pages/professor/PlanoAula/PlanoAulaFormulario/PlanoAulaFormulario'),
)
const ProfessorAulas = lazy(() => import('@/pages/professor/PlanoAula/Aulas/Aulas'))
const ProfessorAulaFormulario = lazy(() => import('@/pages/professor/PlanoAula/AulaFormulario/AulaFormulario'))
const ProfessorRegistrarAula = lazy(() => import('@/pages/professor/PlanoAula/RegistrarAula/RegistrarAula'))
const ProfessorRegistrarAulaTurma = lazy(() => import('@/pages/professor/Turmas/RegistrarAulaTurma/RegistrarAulaTurma'))
const ProfessorNotas = lazy(() => import('@/pages/professor/Notas/Notas'))
const ProfessorDesempenho = lazy(() => import('@/pages/professor/Reforco/Desempenho/Desempenho'))
const ProfessorDesempenhoGeral = lazy(() => import('@/pages/professor/Reforco/DesempenhoGeral/DesempenhoGeral'))
const ProfessorDesempenhoEvolucao = lazy(() => import('@/pages/professor/Reforco/DesempenhoEvolucao/DesempenhoEvolucao'))
const ProfessorDesempenhoSimulados = lazy(
  () => import('@/pages/professor/Reforco/DesempenhoSimulados/DesempenhoSimulados'),
)
const ProfessorSimulados = lazy(() => import('@/pages/professor/Reforco/Simulados/Simulados'))
const ProfessorSimuladoFormulario = lazy(
  () => import('@/pages/professor/Reforco/SimuladoFormulario/SimuladoFormulario'),
)
const ProfessorResultadosSimulado = lazy(
  () => import('@/pages/professor/Reforco/ResultadosSimulado/ResultadosSimulado'),
)
const ProfessorResultadoAluno = lazy(() => import('@/pages/professor/Reforco/ResultadoAluno/ResultadoAluno'))
const ProfessorSimuladosRealizados = lazy(
  () => import('@/pages/professor/Reforco/SimuladosRealizados/SimuladosRealizados'),
)
const ProfessorSimuladosAprovacao = lazy(
  () => import('@/pages/professor/Reforco/SimuladosAprovacao/SimuladosAprovacao'),
)
const ProfessorAprovarSimulado = lazy(
  () => import('@/pages/professor/Reforco/AprovarSimulado/AprovarSimulado'),
)
const ProfessorQuestoesPendentes = lazy(
  () => import('@/pages/professor/Reforco/QuestoesPendentes/QuestoesPendentes'),
)
const ProfessorRevisarQuestao = lazy(() => import('@/pages/professor/Reforco/RevisarQuestao/RevisarQuestao'))

// --- Aluno ----------------------------------------------------------------
const AlunoHome = lazy(() => import('@/pages/aluno/Home/Home'))
const AlunoReforco = lazy(() => import('@/pages/aluno/Reforco/Reforco'))
const AlunoSimulado = lazy(() => import('@/pages/aluno/Simulado/Simulado'))
const AlunoNotas = lazy(() => import('@/pages/aluno/Notas/Notas'))
const AlunoPerfil = lazy(() => import('@/pages/aluno/Perfil/Perfil'))
const AlunoSelecionarCurso = lazy(() => import('@/pages/aluno/SelecionarCurso/SelecionarCurso'))

export function AppRoutes() {
  return (
    <Suspense fallback={<CarregandoTela />}>
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
          path="/adm/turmas/:turmaId/matricular/:matriculaId"
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
        {/* Sem rota "/novo": o plano de aula nasce junto com o plano de ensino */}
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
              <ProfessorSimulados />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/desempenho"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorDesempenho />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/desempenho/geral"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorDesempenhoGeral />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/desempenho/evolucao"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorDesempenhoEvolucao />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/desempenho/simulados"
          element={
            <RotaProtegida perfis={['PROFESSOR']}>
              <ProfessorDesempenhoSimulados />
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
              <GuardaCursoAluno>
                <AlunoHome />
              </GuardaCursoAluno>
            </RotaProtegida>
          }
        />
        <Route
          path="/aluno/reforco"
          element={
            <RotaProtegida perfis={['ALUNO']}>
              <GuardaCursoAluno>
                <AlunoReforco />
              </GuardaCursoAluno>
            </RotaProtegida>
          }
        />
        <Route
          path="/aluno/simulado/:simuladoAlunoId"
          element={
            <RotaProtegida perfis={['ALUNO']}>
              <GuardaCursoAluno>
                <AlunoSimulado />
              </GuardaCursoAluno>
            </RotaProtegida>
          }
        />
        <Route
          path="/aluno/notas"
          element={
            <RotaProtegida perfis={['ALUNO']}>
              <GuardaCursoAluno>
                <AlunoNotas />
              </GuardaCursoAluno>
            </RotaProtegida>
          }
        />
        <Route
          path="/aluno/curso"
          element={
            <RotaProtegida perfis={['ALUNO']}>
              <AlunoSelecionarCurso />
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
