import styled from 'styled-components'
import { X } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Select } from '../../../components/ui/Select'
import type { SelectOption } from '../../../components/ui/Select'

/* Confirmado no Figma (mesmo padrão de Notas.tsx): campos de largura fixa
   numa linha só, sem rótulo separado acima (o placeholder já identifica o
   campo). Os filtros aqui aplicam na hora — não há "Buscar": já é um recorte
   sobre dados já carregados, diferente de Notas.tsx (que só monta o
   acordeão depois de aplicar). */
const Campos = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`

const CampoLargura = styled.div`
  width: 190px;
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
  onLimpar: () => void
}

/**
 * Filtros compartilhados pelas 3 telas de detalhamento de desempenho
 * (Visão geral, Evolução, Por simulado) — turma, disciplina, aluno
 * individual e período. Um único lugar pra manter os 3 consistentes entre
 * si (ver useDesempenhoDados, que já traz as opções derivadas certas pra
 * cada campo).
 */
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
  onLimpar,
}: FiltrosDesempenhoProps) {
  const temFiltroAtivo = Boolean(turmaId || disciplinaId || alunoId || dataInicio || dataFim)

  return (
    <Campos>
      <CampoLargura>
        <Select
          placeholder="Turma"
          options={opcoesTurmas}
          value={turmaId}
          loading={carregandoTurmas}
          clearable
          emptyText="Você não leciona em nenhuma turma"
          onChange={onTurmaChange}
        />
      </CampoLargura>

      <CampoLargura>
        <Select
          placeholder="Disciplina"
          options={opcoesDisciplinas}
          value={disciplinaId}
          clearable
          disabled={!turmaId}
          emptyText="Selecione uma turma primeiro"
          onChange={onDisciplinaChange}
        />
      </CampoLargura>

      <CampoLargura>
        <Select
          placeholder="Aluno"
          options={opcoesAlunos}
          value={alunoId}
          clearable
          disabled={!turmaId}
          loading={carregandoAlunos}
          emptyText="Selecione uma turma primeiro"
          onChange={onAlunoChange}
        />
      </CampoLargura>

      <CampoLargura>
        <DatePicker placeholder="De" value={dataInicio} onChange={(e) => onDataInicioChange(e.target.value)} />
      </CampoLargura>

      <CampoLargura>
        <DatePicker placeholder="Até" value={dataFim} onChange={(e) => onDataFimChange(e.target.value)} />
      </CampoLargura>

      {temFiltroAtivo && (
        <Button variant="subtle" size="small" icon={<X />} onClick={onLimpar}>
          Limpar filtros
        </Button>
      )}
    </Campos>
  )
}
