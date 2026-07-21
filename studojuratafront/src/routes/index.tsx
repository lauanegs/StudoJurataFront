import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "../pages/auth/Login"
import Unauthorized from "../pages/auth/Unauthorized"

import AdmHome from "../pages/adm/Home"
import Eventos from "../pages/adm/Eventos/Eventos"
import Alunos from "../pages/adm/Alunos/Alunos"
import NovoAluno from "../pages/adm/Alunos/NovoAluno"
import Disciplinas from "../pages/adm/Disciplinas/Disciplinas"
import NovaDisciplina from "../pages/adm/Disciplinas/NovaDisciplina"
import Professores from "../pages/adm/Professores/Professores"
import NovoProfessor from "../pages/adm/Professores/NovoProfessor"
import TurmasAdm from "../pages/adm/Turmas/Turmas"
import NovaTurma from "../pages/adm/Turmas/NovaTurma"
import MatricularAluno from "../pages/adm/Turmas/MatricularAluno"
import Responsaveis from "../pages/adm/Responsaveis/Responsaveis"
import NovoResponsavel from "../pages/adm/Responsaveis/NovoResponsavel"

import ProfessorHome from "../pages/professor/Home"
import ProfessorTurmas from "../pages/professor/Turmas/Turmas"
import TurmaDetalhada from "../pages/professor/Turmas/TurmaDetalhada"
import RegistrarAula from "../pages/professor/Turmas/RegistrarAula"
import Notas from "../pages/professor/Notas/Notas"
import PlanoEnsino from "../pages/professor/PlanoEnsino/PlanoEnsino"
import NovoPlanoEnsino from "../pages/professor/PlanoEnsino/NovoPlanoEnsino"
import ConteudoPlanoEnsino from "../pages/professor/PlanoEnsino/ConteudoPlanoEnsino"
import NovoConteudoPlanoEnsino from "../pages/professor/PlanoEnsino/NovoConteudo"
import PlanoAula from "../pages/professor/PlanoAula/PlanoAula"
import NovoPlanoAula from "../pages/professor/PlanoAula/NovoPlanoAula"
import Aulas from "../pages/professor/PlanoAula/Aulas"
import NovaAula from "../pages/professor/PlanoAula/NovaAula"
import ReforcoDashboard from "../pages/professor/Reforco/Dashboard"
import SimuladosRealizados from "../pages/professor/Reforco/SimuladosRealizados"
import SimuladoRealizadoDetalhado from "../pages/professor/Reforco/SimuladoRealizadoDetalhado"
import SimuladoRealizadoDetalhadoAluno from "../pages/professor/Reforco/SimuladoRealizadoDetalhadoAluno"
import LancarSimulado from "../pages/professor/Reforco/LancarSimulado"
import NovoSimulado from "../pages/professor/Reforco/NovoSimulado"

import AlunoHome from "../pages/aluno/Home"
import AlunoNotas from "../pages/aluno/Notas"
import AlunoReforco from "../pages/aluno/Reforço"
import AlunoSimulado from "../pages/aluno/Simulado"

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                {/* AUTH */}
                <Route path="/" element={<Login />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* ADM */}
                <Route path="/adm">
                    <Route index element={<AdmHome />} />

                    <Route path="eventos" element={<Eventos />} />

                    <Route path="alunos">
                        <Route index element={<Alunos />} />
                        <Route path="novo" element={<NovoAluno />} />
                    </Route>

                    <Route path="disciplinas">
                        <Route index element={<Disciplinas />} />
                        <Route path="nova" element={<NovaDisciplina />} />
                    </Route>

                    <Route path="professores">
                        <Route index element={<Professores />} />
                        <Route path="novo" element={<NovoProfessor />} />
                    </Route>

                    <Route path="turmas">
                        <Route index element={<TurmasAdm />} />
                        <Route path="nova" element={<NovaTurma />} />
                        <Route path="matricular" element={<MatricularAluno />} />
                    </Route>

                    <Route path="responsaveis">
                        <Route index element={<Responsaveis />} />
                        <Route path="novo" element={<NovoResponsavel />} />
                    </Route>
                </Route>

                {/* PROFESSOR */}
                <Route path="/professor">
                    <Route index element={<ProfessorHome />} />

                    <Route path="turmas">
                        <Route index element={<ProfessorTurmas />} />
                        <Route path="detalhada" element={<TurmaDetalhada />} />
                        <Route path="registrar-aula" element={<RegistrarAula />} />
                    </Route>

                    <Route path="notas">
                        <Route index element={<Notas />} />
                    </Route>

                    <Route path="planoEnsino">
                        <Route index element={<PlanoEnsino />} />
                        <Route path="novo-plano-ensino" element={<NovoPlanoEnsino />} />
                        <Route path="conteudo-plano-ensino" element={<ConteudoPlanoEnsino />} />
                        <Route path="novo-conteudo-plano-ensino" element={<NovoConteudoPlanoEnsino />} />
                    </Route>

                    <Route path="planoAula">
                        <Route index element={<PlanoAula />} />
                        <Route path="novo-plano-aula" element={<NovoPlanoAula />} />
                        <Route path="aulas" element={<Aulas />} />
                        <Route path="nova-aula" element={<NovaAula />} />
                    </Route>

                    <Route path="reforco">
                        <Route index element={<ReforcoDashboard />} />
                        <Route path="simulados-realizados" element={<SimuladosRealizados />} />
                        <Route path="simulados-realizados/disciplina" element={<SimuladoRealizadoDetalhado />} />
                        <Route path="simulados-realizados/aluno" element={<SimuladoRealizadoDetalhadoAluno />} />
                        <Route path="lancar-simulado" element={<LancarSimulado />} />
                        <Route path="novo-simulado" element={<NovoSimulado />} />
                    </Route>
                </Route>

                {/* ALUNO */}
                <Route path="/aluno">
                    <Route index element={<AlunoHome />} />
                    <Route path="notas" element={<AlunoNotas />} />
                    <Route path="reforco" element={<AlunoReforco />} />
                    <Route path="simulado" element={<AlunoSimulado />} />
                </Route>

            </Routes>
        </BrowserRouter>
    )
}
