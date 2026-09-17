import { useState } from 'react'
import styled from 'styled-components'
import { Filter, Search, X } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Modal } from '../../../components/ui/Modal'
import { Select } from '../../../components/ui/Select'
import type { SelectOption } from '../../../components/ui/Select'
import { Stack } from '../../../components/ui/Stack'

/* Campos num modal: cinco numa linha do Header ficavam apertados. Só filtra ao clicar "Buscar". */
const GradePeriodo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
`

interface FiltrosDesempenhoProps {
  opcoesTurmas: SelectOption<number>[]
  opcoesDisciplinas: SelectOption<number>[]
  opcoesAlunos: SelectOption<number>[]
  turmaId: number | null
  disciplinaId: number | null
  alunoId: number | null
  dataInicio: string
  dataFim: string
  carregandoTurmas: boolean
  carregandoAlunos: boolean
  onTurmaChange: (valor: number | null) => void
  onDisciplinaChange: (valor: number | null) => void
  onAlunoChange: (valor: number | null) => void
  onDataInicioChange: (valor: string) => void
  onDataFimChange: (valor: string) => void
  onBuscar: () => void
  onLimpar: () => void
}

/** Filtros compartilhados pelas telas de detalhamento de desempenho. */
export function FiltrosDesempenho({
  opcoesTurmas,
  opcoesDisciplinas,
  opcoesAlunos,
  turmaId,
  disciplinaId,
  alunoId,
  dataInicio,
  dataFim,
  carregandoTurmas,
  carregandoAlunos,
  onTurmaChange,
  onDisciplinaChange,
  onAlunoChange,
  onDataInicioChange,
  onDataFimChange,
  onBuscar,
  onLimpar,
}: FiltrosDesempenhoProps) {
  const [aberto, setAberto] = useState(false)

  const quantidadeAtiva = [turmaId, disciplinaId, alunoId, dataInicio, dataFim].filter(Boolean).length
  const temFiltroAtivo = quantidadeAtiva > 0

  function buscar() {
    onBuscar()
    setAberto(false)
  }

  return (
    <>
      <Button size="large" variant="primary" icon={<Filter />} onClick={() => setAberto(true)}>
        Filtrar{temFiltroAtivo ? ` (${quantidadeAtiva})` : ''}
      </Button>

      <Modal
        aberto={aberto}
        onClose={() => setAberto(false)}
        titulo="Filtros"
        descricao="Turma, disciplina, aluno e período considerados nos gráficos."
        largura="440px"
        rodape={
          <>
            {temFiltroAtivo && (
              <Button variant="subtle" icon={<X />} onClick={onLimpar}>
                Limpar filtros
              </Button>
            )}
            <Button icon={<Search />} onClick={buscar}>
              Buscar
            </Button>
          </>
        }
      >
        <Stack gap="md">
          <Select
            label="Turma"
            placeholder="Todas as turmas"
            options={opcoesTurmas}
            value={turmaId}
            loading={carregandoTurmas}
            clearable
            emptyText="Você não leciona em nenhuma turma"
            onChange={onTurmaChange}
          />

          <Select
            label="Disciplina"
            placeholder="Todas as disciplinas"
            options={opcoesDisciplinas}
            value={disciplinaId}
            clearable
            disabled={!turmaId}
            emptyText="Selecione uma turma primeiro"
            onChange={onDisciplinaChange}
          />

          <Select
            label="Aluno"
            placeholder="Todos os alunos"
            options={opcoesAlunos}
            value={alunoId}
            clearable
            disabled={!turmaId}
            loading={carregandoAlunos}
            emptyText="Selecione uma turma primeiro"
            onChange={onAlunoChange}
          />

          <GradePeriodo>
            <DatePicker label="De" value={dataInicio} onChange={(e) => onDataInicioChange(e.target.value)} />
            <DatePicker label="Até" value={dataFim} onChange={(e) => onDataFimChange(e.target.value)} />
          </GradePeriodo>
        </Stack>
      </Modal>
    </>
  )
}
