import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { DataTable } from '../../../components/ui/DataTable'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '../../../components/ui/Input/Input'
import { Button } from '../../../components/ui/Button'

interface TurmaData {
  id: string
  turma: string
  curso: string
  disciplina: string
}

export default function PlanoAula() {
  const [busca, setBusca] = useState('')
  const navigate = useNavigate()

  const colunas = [
    { header: 'Turma', accessor: 'turma' as const },
    { header: 'Curso', accessor: 'curso' as const },
    { header: 'Disciplina', accessor: 'disciplina' as const },
  ]

  const dados: TurmaData[] = [
    { id: '1', turma: 'Geek Junior', curso: 'Robótica', disciplina: 'Lógica' },
    { id: '2', turma: 'Geek Teen', curso: 'Programação', disciplina: 'JavaScript' },
    { id: '3', turma: 'Geek Kids', curso: 'Design', disciplina: 'Figma' },
  ]

  const dadosFiltrados = dados.filter((item) =>
    item.turma.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <Layout perfil="professor">
      <Header titulo="Planos de Aula">
        <Button label="Adicionar plano" onClick={() => navigate('/professor/planoAula/novo-plano-aula')} />
        <Input
          placeholder="Buscar plano..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </Header>

      <DataTable
        columns={colunas}
        data={dadosFiltrados}
        onRowClick={(row) => navigate(`/professor/planoAula/aulas?id=${row.id}`)}
      />
    </Layout>
  )
}
