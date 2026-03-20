import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { DataTable } from '../../../components/ui/DataTable'

import { useState } from 'react'
import { Input } from '../../../components/ui/Input/Input'
import { Button } from '../../../components/ui/Button'

interface TurmaData {
  turma: string
  curso: string
  disciplina: string
}

export default function PlanoAula() {
  const [busca, setBusca] = useState('')

  const colunas = [
    { header: 'Turma', accessor: 'turma' as const },
    { header: 'Curso', accessor: 'curso' as const },
    { header: 'Disciplina', accessor: 'disciplina' as const },
  ]

  const dados: TurmaData[] = [
    {
      turma: 'Geek Junior',
      curso: 'Robótica',
      disciplina: 'Lógica',
    },
    {
      turma: 'Geek Teen',
      curso: 'Programação',
      disciplina: 'JavaScript',
    },
    {
      turma: 'Geek Kids',
      curso: 'Design',
      disciplina: 'Figma',
    },
  ]

  const dadosFiltrados = dados.filter((item) =>
    item.turma.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <Layout>
      <Header titulo="Planos de Aula">
        <Button label="Adicionar plano" />
        <Input 
          placeholder="Buscar plano..." 
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </Header>

      <DataTable
        columns={colunas}
        data={dadosFiltrados}
      />
    </Layout>
  )
}