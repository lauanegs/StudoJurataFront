import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { DataTable } from '../../../components/ui/DataTable'
import { Select } from '../../../components/ui/Select/Select'
import { Button } from '../../../components/ui/Button'

interface SimuladoLinha {
  id: string
  titulo: string
  disciplinaAluno: string
  mediaGeral: string
  participacao: string
}

const SIMULADOS: SimuladoLinha[] = Array.from({ length: 4 }).map((_, i) => ({
  id: String(i + 1),
  titulo: 'Matematica#11',
  disciplinaAluno: 'Robótica',
  mediaGeral: '45%',
  participacao: '9/10',
}))

export default function SimuladosRealizados() {
  const [turma, setTurma] = useState<string | number>('')
  const [contexto, setContexto] = useState<string | number>('')
  const [contextoEspecifico, setContextoEspecifico] = useState<string | number>('')
  const navigate = useNavigate()

  const colunas = [
    { header: 'Título', accessor: 'titulo' as const },
    { header: 'Disciplina / Aluno', accessor: 'disciplinaAluno' as const },
    { header: 'Média geral', accessor: 'mediaGeral' as const },
    { header: 'Participação', accessor: 'participacao' as const },
  ]

  function abrirDetalhe(item: SimuladoLinha) {
    if (contexto === 'aluno') {
      navigate(`/professor/reforco/simulados-realizados/aluno?id=${item.id}`)
    } else {
      navigate(`/professor/reforco/simulados-realizados/disciplina?id=${item.id}`)
    }
  }

  return (
    <Layout perfil="professor">
      <Header titulo="Simulados realizados">
        <Select options={[{ value: '1', label: 'Geek Junior' }]} value={turma} onChange={setTurma} placeholder="Turma" />
        <Select
          options={[{ value: 'disciplina', label: 'Disciplina' }, { value: 'aluno', label: 'Aluno' }]}
          value={contexto}
          onChange={setContexto}
          placeholder="Disciplina / Aluno"
        />
        <Select options={[{ value: '1', label: 'Robótica' }]} value={contextoEspecifico} onChange={setContextoEspecifico} placeholder="Disciplina / Aluno" />
        <Button label="Buscar" />
      </Header>

      <DataTable columns={colunas} data={SIMULADOS} onRowClick={abrirDetalhe} />
    </Layout>
  )
}
