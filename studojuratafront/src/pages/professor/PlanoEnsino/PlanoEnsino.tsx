import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { DataTable } from '../../../components/ui/DataTable'

import { Flag, FileText } from 'lucide-react'
import { useState } from 'react'
import { Input } from '../../../components/ui/Input/Input'
import { Button } from '../../../components/ui/Button'

interface TurmaData {
  turma: string
  curso: string
  disciplina: string
  periodo: string
  carga: string
}

export default function PlanoEnsino() {
  const [busca, setBusca] = useState('')

  const colunas = [
    { header: 'Turma', accessor: 'turma' as const },
    { header: 'Curso', accessor: 'curso' as const },
    { header: 'Disciplina', accessor: 'disciplina' as const },
    { header: 'Período', accessor: 'periodo' as const },
    { header: 'Carga', accessor: 'carga' as const },
  ]

  const dados: TurmaData[] = [
    {
      turma: 'Geek Junior',
      curso: 'Robótica',
      disciplina: 'Lógica',
      periodo: '2025',
      carga: '40h'
    },
    {
      turma: 'Geek Teen',
      curso: 'Programação',
      disciplina: 'JavaScript',
      periodo: '2025',
      carga: '60h'
    },
    {
      turma: 'Geek Kids',
      curso: 'Design',
      disciplina: 'Figma',
      periodo: '2025',
      carga: '30h'
    },
  ]

  const dadosFiltrados = dados.filter((item) =>
    item.turma.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <Layout>
      <Header titulo="Planos de Ensino">
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