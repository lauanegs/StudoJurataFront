import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { DataTable } from '../../../components/ui/DataTable'
import { Input } from '../../../components/ui/Input/Input'
import { Button } from '../../../components/ui/Button'
import { Pencil, Trash2 } from 'lucide-react'

const DISCIPLINAS = Array.from({ length: 4 }).map((_, i) => ({
  id: String(i + 1),
  nome: 'Robótica',
}))

export default function Disciplinas() {
  const [busca, setBusca] = useState('')
  const navigate = useNavigate()

  const colunas = [
    { header: 'Nome', accessor: 'nome' as const },
    { header: 'Ações', accessor: 'actions' as const, width: '100px' },
  ]

  const dadosFiltrados = DISCIPLINAS.filter((item) =>
    item.nome.toLowerCase().includes(busca.toLowerCase()),
  )

  return (
    <Layout perfil="adm">
      <Header titulo="Disciplinas">
        <Button label="+ Adicionar disciplina" onClick={() => navigate('/adm/disciplinas/nova')} />
        <Input placeholder="Buscar disciplina..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      </Header>

      <DataTable
        columns={colunas}
        data={dadosFiltrados}
        renderActions={(row) => (
          <div style={{ display: 'flex', gap: '12px', cursor: 'pointer' }}>
            <Pencil size={18} color="#64748b" onClick={() => navigate(`/adm/disciplinas/nova?id=${row.id}`)} />
            <Trash2 size={18} color="#64748b" />
          </div>
        )}
      />
    </Layout>
  )
}
