import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, UserPlus, Users } from 'lucide-react'

import { AlertaDesempenhoCard } from '../../../../components/desempenho/AlertaDesempenhoCard'
import { BuscaInput } from '../../../../components/ui/BuscaInput'
import { Button } from '../../../../components/ui/Button'
import { DataTable } from '../../../../components/ui/DataTable'
import { IconButton } from '../../../../components/ui/IconButton'
import { Tag } from '../../../../components/ui/Tag'
import { useAvisosDispensados } from '../../../../hooks/useAvisosDispensados'
import { useDebounce } from '../../../../hooks/useDebounce'
import { usePaginacao } from '../../../../hooks/usePaginacao'
import { useRequisicao, type RequestResult } from '../../../../hooks/useRequisicao'
import { turmas as servicoTurmas } from '../../../../services/turmas'
import { formatarCargaHoraria, formatarData, formatarIdade, normalizar } from '../../../../utils/format'
import { ROTULO_STATUS_MATRICULA, STATUS_MATRICULA_VARIANT } from '../../../../utils/labels'
import type { AlunoTurma, TurmaDisciplina } from '../../../../types/turmas'
import { LinhaAcaoFlutuante } from './styles'

interface AbaAlunosProps {
  turmaId: number
  requisicaoAtivos: RequestResult<AlunoTurma[]>
  historico: AlunoTurma[]
  vinculos: TurmaDisciplina[] | null
}

export function AbaAlunos({ turmaId, requisicaoAtivos, historico, vinculos }: AbaAlunosProps) {
  const navegar = useNavigate()
  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)

  const { dispensados, dispensar } = useAvisosDispensados()
  /** Aviso informativo de matrícula concluída automaticamente por carga horária (FrequenciaService). */
  const avisosCargaHoraria = useMemo(
    () => historico.filter((matricula) => matricula.status === 'CONCLUIDA' && !dispensados.includes(matricula.id)),
    [historico, dispensados],
  )

  // Recalcula quando matrículas ou disciplinas da turma mudam, já que as duas alteram a carga horária.
  const requisicaoFrequencia = useRequisicao(
    () => servicoTurmas.frequenciaAlunos(turmaId),
    [turmaId, requisicaoAtivos.data, vinculos],
  )
  const cargaHorariaPorAluno = useMemo(
    () => new Map((requisicaoFrequencia.data ?? []).map((resumo) => [resumo.alunoId, resumo.cargaHoraria])),
    [requisicaoFrequencia.data],
  )

  const filtrados = useMemo(() => {
    const lista = requisicaoAtivos.data ?? []
    if (!buscaAtrasada.trim()) return lista
    const termo = normalizar(buscaAtrasada)
    return lista.filter((matricula) => normalizar(matricula.aluno?.pessoa?.nome).includes(termo))
  }, [requisicaoAtivos.data, buscaAtrasada])

  const paginacao = usePaginacao(filtrados)
  const matricular = () => navegar(`/adm/turmas/${turmaId}/matricular`)

  return (
    <>
      {avisosCargaHoraria.map((matricula) => (
        <AlertaDesempenhoCard
          key={matricula.id}
          tom="success"
          titulo={`${matricula.aluno?.pessoa?.nome ?? 'Aluno'} concluiu a carga horária`}
          descricao={`Matrícula concluída automaticamente em ${formatarData(matricula.dataFim)}. Se for necessário reativar, entre em contato com a administração.`}
          acao={
            <Button variant="secondary" size="small" onClick={() => dispensar(matricula.id)}>
              Ciente
            </Button>
          }
        />
      ))}

      <LinhaAcaoFlutuante>
        <Button size="large" icon={<UserPlus />} onClick={matricular}>
          Matricular aluno
        </Button>

        <BuscaInput value={busca} onChange={setBusca} placeholder="Buscar aluno por nome..." />
      </LinhaAcaoFlutuante>

      <DataTable<AlunoTurma>
        descricao="Alunos com matrícula ativa"
        columns={[
          {
            key: 'aluno',
            cabecalho: 'Aluno',
            ordenavel: true,
            valorOrdenacao: (matricula) => matricula.aluno?.pessoa?.nome ?? '',
            render: (matricula) => matricula.aluno?.pessoa?.nome ?? '—',
          },
          {
            key: 'idade',
            cabecalho: 'Idade',
            render: (matricula) => formatarIdade(matricula.aluno?.pessoa?.dataNascimento),
          },
          {
            key: 'cargaHoraria',
            cabecalho: 'Carga horária',
            ocultarEmTelaPequena: true,
            render: (matricula) => formatarCargaHoraria(cargaHorariaPorAluno.get(matricula.aluno.id) ?? 0),
          },
          {
            key: 'inicio',
            cabecalho: 'Data da matrícula',
            render: (matricula) => formatarData(matricula.dataInicio),
          },
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
        ]}
        data={paginacao.itensDaPagina}
        rowKey={(matricula) => matricula.id}
        loading={requisicaoAtivos.loading}
        error={requisicaoAtivos.error}
        onReload={requisicaoAtivos.reload}
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
          titulo: busca ? 'Nenhum aluno encontrado' : 'Nenhum aluno matriculado',
          descricao: busca
            ? 'Revise o termo buscado ou limpe o filtro.'
            : 'Matricule alunos para começar a registrar aulas e frequências.',
          icon: <Users />,
          acao: !busca && (
            <Button icon={<UserPlus />} onClick={matricular}>
              Matricular aluno
            </Button>
          ),
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
