import { BrowserRouter, Routes, Route } from "react-router-dom"

//import Login from "@/pages/auth/Login"
//import Unauthorized from "@/pages/auth/Unauthorized"

// import AdmHome from "../pages/adm/Home"
// import Alunos from "../pages/adm/Alunos/Alunos"
// import NovoAluno from "../pages/adm/Alunos/NovoAluno"
// import Disciplinas from "../pages/adm/Disciplinas/Disciplinas"
// import NovaDisciplina from "../pages/adm/Disciplinas/NovaDisciplina"
// import Professores from "../pages/adm/Professores/Professores"
// import NovoProfessor from "../pages/adm/Professores/NovoProfessor"
// import TurmasAdm from "../pages/adm/Turmas/Turmas"
// import NovaTurma from "../pages/adm/Turmas/NovaTurma"
// import MatricularAluno from "../pages/adm/Turmas/MatricularAluno"

// import ProfessorHome from "../pages/professor/Home"
import ProfessorTurmas from "../pages/professor/Turmas/Turmas"
// import TurmaDetalhada from "../pages/professor/Turmas/TurmaDetalhada"
// import RegistrarAula from "../pages/professor/Turmas/RegistrarAula"

// import AlunoHome from "../pages/aluno/Home"
// import Notas from "../pages/aluno/Notas"
// import Reforco from "../pages/aluno/Reforço"
// import Simulado from "../pages/aluno/Simulado"

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                {/* AUTH
        <Route path="/" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} /> */}

                {/* ADM */}
                {/* <Route path="/adm">
                    <Route index element={<AdmHome />} />

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
                </Route> */}

                {/* PROFESSOR */}
                <Route path="/professor">
                    {/* <Route index element={<ProfessorHome />} /> */}

                    <Route path="turmas">
                        <Route index element={<ProfessorTurmas />} />
                        {/* <Route path=":id" element={<TurmaDetalhada />} />
                        <Route path=":id/registrar-aula" element={<RegistrarAula />} /> */}
                    </Route>
                </Route>

                {/* ALUNO */}
                {/* <Route path="/aluno">
                    <Route index element={<AlunoHome />} />
                    <Route path="notas" element={<Notas />} />
                    <Route path="reforco" element={<Reforco />} />
                    <Route path="simulado" element={<Simulado />} />
                </Route> */}

            </Routes>
        </BrowserRouter>
    )
}