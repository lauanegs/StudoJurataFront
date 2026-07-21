import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { DataTable } from '../../../components/ui/DataTable'
import { Input } from '../../../components/ui/Input/Input'
import { Button } from '../../../components/ui/Button'
import { Pencil, Trash2 } from 'lucide-react'

const ALUNOS = Array.from({ length: 3 }).map((_, i) => ({
  id: String(i + 1),
  nome: 'Cristian Gonzaga Campos',
  idade: 4,
}))

export default function Alunos() {
  const [busca, setBusca] = useState('')
  const navigate = useNavigate()

  const colunas = [
    { header: 'Nome', accessor: 'nome' as const },
    { header: 'Idade', accessor: 'idade' as const },
    { header: 'Ações', accessor: 'actions' as const, width: '100px' },
  ]

  const dadosFiltrados = ALUNOS.filter((item) =>
    item.nome.toLowerCase().includes(busca.toLowerCase()),
  )

  return (
    <Layout perfil="adm">
      <Header titulo="Alunos">
        <Button label="+ Adicionar aluno" onClick={() => navigate('/adm/alunos/novo')} />
        <Input placeholder="Buscar aluno..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      </Header>

      <DataTable
        columns={colunas}
        data={dadosFiltrados}
        renderActions={(row) => (
          <div style={{ display: 'flex', gap: '12px', cursor: 'pointer' }}>
            <Pencil size={18} color="#64748b" onClick={() => navigate(`/adm/alunos/novo?id=${row.id}`)} />
            <Trash2 size={18} color="#64748b" />
          </div>
        )}
      />
    </Layout>
  )
}
