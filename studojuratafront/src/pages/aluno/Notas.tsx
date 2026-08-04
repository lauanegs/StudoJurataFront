import { useMemo, useState } from 'react'
import styled from 'styled-components'
import { NotebookPen } from 'lucide-react'

import { Layout } from '../../components/layout'
import { Card } from '../../components/ui/Card'
import { DropDown } from '../../components/ui/DropDown'
import { Header } from '../../components/ui/Header'
import { Select } from '../../components/ui/Select'
import { Tag } from '../../components/ui/Tag'
import { ErroCarregamento } from '../../components/feedback/ErroCarregamento'
import { EstadoVazio } from '../../components/feedback/EstadoVazio'
import { Skeleton } from '../../components/feedback/Skeleton'
import { useAlunoLogado } from '../../hooks/usePerfilLogado'
import { useRequisicao } from '../../hooks/useRequisicao'
import { notas as servicoNotas, simuladoAlunos, simulados as servicoSimulados } from '../../services/endpoints'
import { formatarNota } from '../../utils/format'

const Lista = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`

/**
 * Notas do aluno logado.
 *
 * O back devolve a Nota consolidada por disciplina/período; os simulados que a
 * compõem são reconstruídos aqui a partir das tentativas concluídas.
 */
export default function AlunoNotas() {
  const { alunoId, loading: carregandoAluno, error: erroAluno } = useAlunoLogado()

  const [periodo, setPeriodo] = useState<string | null>(null)

  const requisicaoNotas = useRequisicao(
    () => servicoNotas.historicoPorAluno(alunoId as number),
    [alunoId],
    { ativo: Boolean(alunoId) },
  )
  const requisicaoTentativas = useRequisicao(
    () => simuladoAlunos.listarPorAluno(alunoId as number),
    [alunoId],
    { ativo: Boolean(alunoId) },
  )
  const requisicaoSimulados = useRequisicao(() => servicoSimulados.listar(), [])

  const porSimulado = useMemo(
    () => new Map((requisicaoSimulados.data ?? []).map((simulado) => [simulado.id, simulado])),
    [requisicaoSimulados.data],
  )

  const periodos = useMemo(() => {
    const unicos = new Set((requisicaoNotas.data ?? []).map((nota) => nota.periodoLetivo))
    return [...unicos].sort().reverse().map((item) => ({ value: item, label: item }))
  }, [requisicaoNotas.data])

  const notas = useMemo(() => {
    const lista = requisicaoNotas.data ?? []
    return periodo ? lista.filter((nota) => nota.periodoLetivo === periodo) : lista
  }, [requisicaoNotas.data, periodo])

  function simuladosDaDisciplina(disciplinaId?: number) {
    return (requisicaoTentativas.data ?? [])
      .filter((tentativa) => {
        if (tentativa.status !== 'CONCLUIDO') return false
        return porSimulado.get(tentativa.simuladoId)?.disciplinaId === disciplinaId
      })
      .map((tentativa) => {
        const simulado = porSimulado.get(tentativa.simuladoId)

        return {
          label: simulado?.titulo ?? `Simulado ${tentativa.simuladoId}`,
          value: `${formatarNota(tentativa.nota)} / ${formatarNota(simulado?.notaMaxima ?? 10)}`,
        }
      })
  }

  const media = useMemo(() => {
    const comTotal = notas.filter((nota) => typeof nota.total === 'number')
    if (comTotal.length === 0) return null

    return comTotal.reduce((soma, nota) => soma + (nota.total ?? 0), 0) / comTotal.length
  }, [notas])

  if (erroAluno) {
    return (
      <Layout>
        <Header titulo="Minhas notas" />
        <ErroCarregamento titulo="Cadastro do aluno não encontrado" mensagem={erroAluno} />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo="Minhas notas"
        subtitulo={
          media !== null ? (
            <>
              <span>Média geral</span>
              <Tag variant={media >= 7 ? 'success' : media >= 5 ? 'warning' : 'error'}>
                {formatarNota(media)}
              </Tag>
            </>
          ) : undefined
        }
        filtros={
          <Select<string>
            label="Período letivo"
            options={periodos}
            value={periodo}
            clearable
            placeholder="Todos os períodos"
            maxWidth="280px"
            emptyText="Nenhum período com notas"
            onChange={setPeriodo}
          />
        }
      />

      <Card titulo="Notas por disciplina" icon={<NotebookPen />}>
        {requisicaoNotas.loading || carregandoAluno ? (
          <Skeleton $altura="160px" $raio="8px" />
        ) : requisicaoNotas.error ? (
          <ErroCarregamento
            mensagem={requisicaoNotas.error}
            onRetry={requisicaoNotas.reload}
          />
        ) : notas.length === 0 ? (
          <EstadoVazio
            titulo="Você ainda não tem notas"
            descricao="As notas são calculadas automaticamente a partir dos simulados concluídos."
            icon={<NotebookPen />}
          />
        ) : (
          <Lista>
            {notas.map((nota, indice) => (
              <DropDown
                key={nota.id}
                titulo={nota.disciplina?.titulo ?? `Disciplina ${nota.disciplina?.id}`}
                resumo={`${formatarNota(nota.total)} · ${nota.periodoLetivo}`}
                abertoInicialmente={indice === 0}
                itens={simuladosDaDisciplina(nota.disciplina?.id)}
                emptyText="Nenhum simulado concluído nesta disciplina ainda."
              />
            ))}
          </Lista>
        )}
      </Card>
    </Layout>
  )
}
