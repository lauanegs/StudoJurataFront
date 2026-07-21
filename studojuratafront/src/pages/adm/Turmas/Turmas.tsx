import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { DataTable } from '../../../components/ui/DataTable'
import { Input } from '../../../components/ui/Input/Input'
import { Button } from '../../../components/ui/Button'
import { Pencil, Trash2 } from 'lucide-react'

interface TurmaLinha {
  id: string
  turma: string
  alunosAtivos: number
}

const TURMAS: TurmaLinha[] = Array.from({ length: 6 }).map((_, index) => ({
  id: String(index + 1),
  turma: 'Geek Junior - quarta - 8:00',
  alunosAtivos: 4,
}))

export default function Turmas() {
  const [busca, setBusca] = useState('')
  const navigate = useNavigate()

  const colunas = [
    { header: 'Turma', accessor: 'turma' as const },
    { header: 'Alunos ativos', accessor: 'alunosAtivos' as const },
    { header: 'Ações', accessor: 'actions' as const, width: '100px' },
  ]

  const dadosFiltrados = TURMAS.filter((item) =>
    item.turma.toLowerCase().includes(busca.toLowerCase()),
  )

  return (
    <Layout perfil="adm">
      <Header titulo="Turmas">
        <Button label="+ Adicionar turma" onClick={() => navigate('/adm/turmas/nova')} />
        <Input
          placeholder="Buscar turma..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </Header>

      <DataTable
        columns={colunas}
        data={dadosFiltrados}
        renderActions={(row) => (
          <div style={{ display: 'flex', gap: '12px', cursor: 'pointer' }}>
            <Pencil size={18} color="#64748b" onClick={() => navigate(`/adm/turmas/nova?id=${row.id}`)} />
            <Trash2 size={18} color="#64748b" />
          </div>
        )}
      />
    </Layout>
  )
}
