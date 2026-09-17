import { useMemo, useState } from 'react'
import { ClipboardCheck } from 'lucide-react'

import { Button } from '../../../../components/ui/Button'
import { CheckBox } from '../../../../components/ui/CheckBox'
import { DataTable } from '../../../../components/ui/DataTable'
import { Modal } from '../../../../components/ui/Modal'
import { Select, type SelectOption } from '../../../../components/ui/Select'
import { Stack } from '../../../../components/ui/Stack'
import { ROTULO_TIPO_QUESTAO } from '../../../../utils/labels'
import type { Coluna } from '../../../../components/ui/DataTable/types'
import type { QuestaoResponse } from '../../../../types/simulados'

interface ModalImportarQuestoesProps {
  aberto: boolean
  onClose: () => void
  opcoesDisciplinas: SelectOption<number>[]
  bancoQuestoes: QuestaoResponse[]
  carregando: boolean
  idsJaNoSimulado: Set<number>
  /** Retorna false quando nada pôde ser importado, mantendo a seleção. */
  onImportar: (escolhidas: QuestaoResponse[]) => boolean
}

export function ModalImportarQuestoes({
  aberto,
  onClose,
  opcoesDisciplinas,
  bancoQuestoes,
  carregando,
  idsJaNoSimulado,
  onImportar,
}: ModalImportarQuestoesProps) {
  const [disciplinaId, setDisciplinaId] = useState<number | null>(null)
  // Filtro aplicado: só muda ao clicar "Buscar".
  const [disciplinaIdAplicada, setDisciplinaIdAplicada] = useState<number | null>(null)
  const [filtroAplicado, setFiltroAplicado] = useState(false)
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set())

  const opcoes = useMemo(() => {
    if (!filtroAplicado) return []

    return bancoQuestoes.filter(
      (item) =>
        item.status !== 'REJEITADA' &&
        !idsJaNoSimulado.has(item.id) &&
        (!disciplinaIdAplicada || item.disciplinaId === disciplinaIdAplicada),
    )
  }, [bancoQuestoes, idsJaNoSimulado, filtroAplicado, disciplinaIdAplicada])

  function alternar(id: number) {
    setSelecionadas((atuais) => {
      const novas = new Set(atuais)
      if (novas.has(id)) novas.delete(id)
      else novas.add(id)
      return novas
    })
  }

  function importar() {
    const escolhidas = opcoes.filter((item) => selecionadas.has(item.id))
    if (escolhidas.length === 0 || !onImportar(escolhidas)) return

    setSelecionadas(new Set())
    setDisciplinaId(null)
    setDisciplinaIdAplicada(null)
    setFiltroAplicado(false)
  }

  const colunas: Coluna<QuestaoResponse>[] = [
    {
      key: 'selecionar',
      cabecalho: 'Selecionar',
      largura: '96px',
      render: (item) => (
        <CheckBox
          checked={selecionadas.has(item.id)}
          onChange={() => alternar(item.id)}
          aria-label={`Selecionar questão: ${item.enunciado}`}
        />
      ),
    },
    { key: 'enunciado', cabecalho: 'Enunciado', render: (item) => item.enunciado },
    { key: 'tipo', cabecalho: 'Tipo', render: (item) => ROTULO_TIPO_QUESTAO[item.tipo] },
  ]

  return (
    <Modal
      aberto={aberto}
      onClose={onClose}
      titulo="Importar questão"
      largura="720px"
      rodape={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="success" disabled={selecionadas.size === 0} onClick={importar}>
            Salvar
          </Button>
        </>
      }
    >
      <Stack gap="md">
        <Select<number>
          label="Disciplina"
          options={opcoesDisciplinas}
          value={disciplinaId}
          clearable
          placeholder="Todas"
          onChange={setDisciplinaId}
        />

        <Button
          variant="secondary"
          onClick={() => {
            setDisciplinaIdAplicada(disciplinaId)
            setFiltroAplicado(true)
          }}
        >
          Buscar
        </Button>

        <DataTable
          descricao="Questões do banco"
          columns={colunas}
          data={opcoes}
          rowKey={(item) => item.id}
          loading={carregando}
          empty={{
            titulo: filtroAplicado ? 'Nenhuma questão encontrada' : 'Filtre e busque',
            descricao: filtroAplicado
              ? 'Todas as questões do banco já estão neste simulado ou não há questões para essa disciplina.'
              : 'Escolha a disciplina e clique em Buscar.',
            icon: <ClipboardCheck />,
          }}
        />
      </Stack>
    </Modal>
  )
}
