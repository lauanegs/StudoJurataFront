import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { DataTable } from '../../../components/ui/DataTable'
import { useNavigate } from 'react-router-dom'

interface AlunoLinha {
  id: string
  aluno: string
  acertos: string
  tempo: string
}

const ALUNOS: AlunoLinha[] = Array.from({ length: 4 }).map((_, i) => ({
  id: String(i + 1),
  aluno: 'Matheus',
  acertos: '9/10',
  tempo: '00:50',
}))

export default function SimuladoRealizadoDetalhado() {
  const navigate = useNavigate()

  const colunas = [
    { header: 'Aluno', accessor: 'aluno' as const },
    { header: 'Acertos', accessor: 'acertos' as const },
    { header: 'Tempo', accessor: 'tempo' as const },
  ]

  return (
    <Layout perfil="professor">
      <Header titulo="Simulado Português#123" />
      <div style={{ marginTop: '-16px', color: '#6b7280', fontSize: '14px', display: 'flex', gap: '24px' }}>
        <span>Participação: 9/10</span>
        <span>Média geral: 45%</span>
      </div>

      <DataTable
        columns={colunas}
        data={ALUNOS}
        onRowClick={(row) => navigate(`/professor/reforco/simulados-realizados/aluno?id=${row.id}`)}
      />
    </Layout>
  )
}
