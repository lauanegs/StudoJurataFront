import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { DataTable } from '../../../components/ui/DataTable'

import { Flag, FileText } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '../../../components/ui/Input/Input'

interface TurmaData {
  id: string
  turma: string
  alunos: number
}

export default function Turmas() {
  const [busca, setBusca] = useState('')
  const navigate = useNavigate()

  const colunas = [
    { header: 'Turma', accessor: 'turma' as const },
    { header: 'Alunos', accessor: 'alunos' as const },
    { header: 'Ações', accessor: 'actions' as const, width: '120px' }
  ]

  const dados: TurmaData[] = Array.from({ length: 6 }).map((_, i) => ({
    id: String(i + 1),
    turma: 'Geek Junior - quarta - 8:00',
    alunos: 4,
  }))

  const dadosFiltrados = dados.filter((item) =>
    item.turma.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <Layout perfil="professor">
      <Header titulo="Turmas">
        <Input
          placeholder="Buscar turma..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </Header>

      <DataTable
        columns={colunas}
        data={dadosFiltrados}
        onRowClick={(row) => navigate(`/professor/turmas/detalhada?id=${row.id}`)}
        renderActions={(row) => (
          <div style={{ display: 'flex', gap: '12px', cursor: 'pointer' }}>
            <Flag size={18} color="#64748b" onClick={(e) => { e.stopPropagation(); navigate(`/professor/turmas/registrar-aula?turmaId=${row.id}`) }} />
            <FileText size={18} color="#64748b" onClick={(e) => { e.stopPropagation(); navigate(`/professor/turmas/detalhada?id=${row.id}`) }} />
          </div>
        )}
      />
    </Layout>
  )
}
