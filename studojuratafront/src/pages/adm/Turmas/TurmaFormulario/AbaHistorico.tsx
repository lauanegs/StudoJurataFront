import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'

import { BuscaInput } from '@/components/ui/BuscaInput'
import { DataTable } from '@/components/ui/DataTable'
import { BarraFiltros, CampoFiltro, CamposFiltro } from '@/components/ui/Header'
import { IconButton } from '@/components/ui/IconButton'
import { Select } from '@/components/ui/Select'
import { Tag } from '@/components/ui/Tag'
import { useDebounce } from '@/hooks/useDebounce'
import { usePaginacao } from '@/hooks/usePaginacao'
import { formatarData, normalizar } from '@/utils/format'
import { ROTULO_STATUS_MATRICULA, STATUS_MATRICULA_VARIANT } from '@/utils/labels'
import type { AlunoTurma, StatusMatricula } from '@/dominios/turmas/types'

import type { AbaHistoricoProps } from './types'

const OPCOES_SITUACAO = (Object.entries(ROTULO_STATUS_MATRICULA) as [StatusMatricula, string][]).map(([value, label]) => ({
  value,
  label,
}))

export function AbaHistorico({ turmaId, requisicaoHistorico }: AbaHistoricoProps) {
  const navegar = useNavigate()
  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)
  const [situacao, setSituacao] = useState<StatusMatricula | null>(null)

  const filtrado = useMemo(() => {
    const termo = normalizar(buscaAtrasada)
    return (requisicaoHistorico.data ?? []).filter(
      (matricula) =>
        (!situacao || matricula.status === situacao) &&
        (!termo.trim() || normalizar(matricula.aluno?.pessoa?.nome).includes(termo)),
    )
  }, [requisicaoHistorico.data, buscaAtrasada, situacao])

  const paginacao = usePaginacao(filtrado)

  return (
    <>
      <BarraFiltros>
        <CamposFiltro>
          <CampoFiltro $largura="211px">
            <Select<StatusMatricula>
              placeholder="Todas as situações"
              options={OPCOES_SITUACAO}
              value={situacao}
              clearable
              onChange={setSituacao}
            />
          </CampoFiltro>
          <BuscaInput value={busca} onChange={setBusca} placeholder="Buscar aluno por nome..." />
        </CamposFiltro>
      </BarraFiltros>

      <DataTable<AlunoTurma>
        descricao="Histórico completo de matrículas da turma"
        columns={[
          { key: 'aluno', cabecalho: 'Aluno', render: (matricula) => matricula.aluno?.pessoa?.nome ?? '—' },
          {
            key: 'status',
            cabecalho: 'Situação',
            render: (matricula) =>
              matricula.status ? (
                <Tag variant={STATUS_MATRICULA_VARIANT[matricula.status]}>
                  {ROTULO_STATUS_MATRICULA[matricula.status]}
                </Tag>
              ) : (
                '—'
              ),
          },
          { key: 'inicio', cabecalho: 'Início', render: (matricula) => formatarData(matricula.dataInicio) },
          {
            key: 'fim',
            cabecalho: 'Término',
            render: (matricula) => (matricula.dataFim ? formatarData(matricula.dataFim) : 'em aberto'),
          },
        ]}
        data={paginacao.itensDaPagina}
        rowKey={(matricula) => matricula.id}
        loading={requisicaoHistorico.loading}
        error={requisicaoHistorico.error}
        onReload={requisicaoHistorico.reload}
        densidade="compacta"
        paginacao={{
          pagina: paginacao.pagina,
          totalPaginas: paginacao.totalPaginas,
          label: paginacao.label,
          temAnterior: paginacao.temAnterior,
          temProxima: paginacao.temProxima,
          onPrevious: paginacao.anterior,
          onNext: paginacao.proxima,
        }}
        empty={{
          titulo: busca || situacao ? 'Nenhum aluno encontrado' : 'Sem histórico',
          descricao:
            busca || situacao ? 'Revise a busca ou a situação selecionada.' : 'Nenhuma matrícula foi registrada nesta turma.',
        }}
        actions={(matricula) => (
          <IconButton
            label="Editar matrícula"
            icon={<Pencil />}
            onClick={() => navegar(`/adm/turmas/${turmaId}/matricular/${matricula.id}`)}
          />
        )}
        rotuloColunaAcoes="Matrícula"
      />
    </>
  )
}
