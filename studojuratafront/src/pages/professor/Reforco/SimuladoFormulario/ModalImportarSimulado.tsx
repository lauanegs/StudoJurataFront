import { useMemo, useState } from 'react'
import { FolderInput } from 'lucide-react'

import { Button } from '../../../../components/ui/Button'
import { CheckBox } from '../../../../components/ui/CheckBox'
import { DataTable } from '../../../../components/ui/DataTable'
import { GradeAutoAjuste } from '../../../../components/ui/GradeAutoAjuste'
import { Modal } from '../../../../components/ui/Modal'
import { Select, type SelectOption } from '../../../../components/ui/Select'
import { Stack } from '../../../../components/ui/Stack'
import { useRequisicao } from '../../../../hooks/useRequisicao'
import { simuladoQuestoes, simulados as servicoSimulados } from '../../../../services/simulados'
import type { Coluna } from '../../../../components/ui/DataTable/types'
import type { SimuladoResponse } from '../../../../types/simulados'

interface ModalImportarSimuladoProps {
  aberto: boolean
  onClose: () => void
  /** Simulado em edição, que não aparece na lista. */
  simuladoId: number | null
  opcoesTurmas: SelectOption<number>[]
  opcoesDisciplinas: SelectOption<number>[]
  carregandoBanco: boolean
  /** Ids das questões do simulado de origem, na ordem do vínculo. */
  onImportar: (questaoIds: number[]) => void
}

/** O pai remonta o modal (via `key`) a cada abertura para começar com os filtros limpos. */
export function ModalImportarSimulado({
  aberto,
  onClose,
  simuladoId,
  opcoesTurmas,
  opcoesDisciplinas,
  carregandoBanco,
  onImportar,
}: ModalImportarSimuladoProps) {
  const [turmaId, setTurmaId] = useState<number | null>(null)
  const [disciplinaId, setDisciplinaId] = useState<number | null>(null)
  // Filtros aplicados: só mudam ao clicar "Buscar".
  const [turmaIdAplicada, setTurmaIdAplicada] = useState<number | null>(null)
  const [disciplinaIdAplicada, setDisciplinaIdAplicada] = useState<number | null>(null)
  const [filtroAplicado, setFiltroAplicado] = useState(false)
  const [origemId, setOrigemId] = useState<number | null>(null)

  const requisicaoSimulados = useRequisicao(() => servicoSimulados.listar(), [], { ativo: aberto })
  const requisicaoVinculos = useRequisicao(() => simuladoQuestoes.listar(), [], { ativo: aberto })

  const simuladosParaImportar = useMemo(() => {
    if (!filtroAplicado) return []

    return (requisicaoSimulados.data ?? []).filter(
      (item) =>
        item.id !== simuladoId &&
        (!turmaIdAplicada || item.turmaId === turmaIdAplicada) &&
        (!disciplinaIdAplicada || item.disciplinaId === disciplinaIdAplicada),
    )
  }, [requisicaoSimulados.data, filtroAplicado, turmaIdAplicada, disciplinaIdAplicada, simuladoId])

  function importar() {
    if (!origemId) return

    onImportar(
      (requisicaoVinculos.data ?? [])
        .filter((vinculo) => vinculo.simuladoId === origemId)
        .map((vinculo) => vinculo.questaoId),
    )
  }

  const colunas: Coluna<SimuladoResponse>[] = [
    {
      key: 'selecionar',
      cabecalho: 'Selecionar',
      largura: '96px',
      render: (item) => (
        <CheckBox
          checked={origemId === item.id}
          onChange={() => setOrigemId((atual) => (atual === item.id ? null : item.id))}
          aria-label={`Selecionar simulado: ${item.titulo}`}
        />
      ),
    },
    { key: 'titulo', cabecalho: 'Título', render: (item) => item.titulo },
    {
      key: 'disciplina',
      cabecalho: 'Disciplina',
      render: (item) => opcoesDisciplinas.find((opcao) => opcao.value === item.disciplinaId)?.label ?? 'Sem disciplina',
    },
  ]

  return (
    <Modal
      aberto={aberto}
      onClose={onClose}
      titulo="Importar simulado"
      largura="720px"
      rodape={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="success" disabled={!origemId || carregandoBanco} onClick={importar}>
            Salvar
          </Button>
        </>
      }
    >
      <Stack gap="md">
        <GradeAutoAjuste $larguraMinima="220px">
          <Select<number>
            label="Turma"
            options={opcoesTurmas}
            value={turmaId}
            clearable
            placeholder="Todas"
            onChange={setTurmaId}
          />
          <Select<number>
            label="Disciplina"
            options={opcoesDisciplinas}
            value={disciplinaId}
            clearable
            placeholder="Todas"
            onChange={setDisciplinaId}
          />
        </GradeAutoAjuste>

        <Button
          variant="secondary"
          onClick={() => {
            setTurmaIdAplicada(turmaId)
            setDisciplinaIdAplicada(disciplinaId)
            setFiltroAplicado(true)
          }}
        >
          Buscar
        </Button>

        <DataTable
          descricao="Simulados disponíveis para importar"
          columns={colunas}
          data={simuladosParaImportar}
          rowKey={(item) => item.id}
          loading={requisicaoSimulados.loading}
          empty={{
            titulo: filtroAplicado ? 'Nenhum simulado encontrado' : 'Filtre e busque',
            descricao: filtroAplicado
              ? 'Ajuste os filtros e busque novamente.'
              : 'Escolha a turma e/ou disciplina e clique em Buscar.',
            icon: <FolderInput />,
          }}
        />
      </Stack>
    </Modal>
  )
}
