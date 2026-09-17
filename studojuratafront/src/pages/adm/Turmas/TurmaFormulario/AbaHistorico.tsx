import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'

import { BuscaInput } from '../../../../components/ui/BuscaInput'
import { DataTable } from '../../../../components/ui/DataTable'
import { IconButton } from '../../../../components/ui/IconButton'
import { Tag } from '../../../../components/ui/Tag'
import { useDebounce } from '../../../../hooks/useDebounce'
import { usePaginacao } from '../../../../hooks/usePaginacao'
import type { RequestResult } from '../../../../hooks/useRequisicao'
import { formatarData, normalizar } from '../../../../utils/format'
import { ROTULO_STATUS_MATRICULA, STATUS_MATRICULA_VARIANT } from '../../../../utils/labels'
import type { AlunoTurma } from '../../../../types/turmas'
import { LinhaAcaoFlutuante } from './styles'

interface AbaHistoricoProps {
  turmaId: number
  requisicaoHistorico: RequestResult<AlunoTurma[]>
}

export function AbaHistorico({ turmaId, requisicaoHistorico }: AbaHistoricoProps) {
  const navegar = useNavigate()
  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)

  const filtrado = useMemo(() => {
    const lista = requisicaoHistorico.data ?? []
    if (!buscaAtrasada.trim()) return lista
    const termo = normalizar(buscaAtrasada)
    return lista.filter((matricula) => normalizar(matricula.aluno?.pessoa?.nome).includes(termo))
  }, [requisicaoHistorico.data, buscaAtrasada])

  const paginacao = usePaginacao(filtrado)

  return (
    <>
      <LinhaAcaoFlutuante>
        <BuscaInput value={busca} onChange={setBusca} placeholder="Buscar aluno por nome..." />
      </LinhaAcaoFlutuante>

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
          titulo: busca ? 'Nenhum aluno encontrado' : 'Sem histórico',
          descricao: busca ? 'Revise o termo buscado ou limpe o filtro.' : 'Nenhuma matrícula foi registrada nesta turma.',
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
