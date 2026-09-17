import { useMemo, useState } from 'react'

import { Layout } from '../../components/layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DropDown } from '../../components/ui/DropDown'
import { Header, CamposFiltro, CampoFiltro } from '../../components/ui/Header'
import { Select } from '../../components/ui/Select'
import { Stack } from '../../components/ui/Stack'
import { Tag } from '../../components/ui/Tag'
import { ErroCarregamento } from '../../components/feedback/ErroCarregamento'
import { EstadoVazio } from '../../components/feedback/EstadoVazio'
import { Skeleton } from '../../components/feedback/Skeleton'
import { useAlunoLogado } from '../../hooks/usePerfilLogado'
import { useRequisicao } from '../../hooks/useRequisicao'
import {
  disciplinas as servicoDisciplinas,
  notas as servicoNotas,
  simuladoAlunos,
  simulados as servicoSimulados,
} from '../../services/endpoints'
import { nivelDesempenho } from '../../utils/desempenho'
import { formatarNota } from '../../utils/format'

const VARIANTE_POR_NIVEL = { baixo: 'error', medio: 'warning', alto: 'success' } as const

/**
 * O back devolve a Nota consolidada por disciplina e turma; os simulados que a
 * compõem são reconstruídos aqui a partir das tentativas concluídas.
 */
export default function AlunoNotas() {
  const { alunoId, loading: carregandoAluno, error: erroAluno } = useAlunoLogado()

  // O filtro só se aplica ao clicar em "Buscar"; a lista começa completa.
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState<number | null>(null)
  const [disciplinaId, setDisciplinaId] = useState<number | null>(null)

  // O aluno pode ter nota em mais de uma turma; a lista mostra uma por vez.
  // null = usa a turma da nota mais recente (o back já ordena do mais novo).
  const [turmaSelecionada, setTurmaSelecionada] = useState<number | null>(null)

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
  const requisicaoDisciplinas = useRequisicao(() => servicoDisciplinas.listar(), [])

  const porSimulado = useMemo(
    () => new Map((requisicaoSimulados.data ?? []).map((simulado) => [simulado.id, simulado])),
    [requisicaoSimulados.data],
  )

  const opcoesTurmas = useMemo(() => {
    const mapa = new Map<number, string>()
    for (const nota of requisicaoNotas.data ?? []) {
      if (nota.turma?.id) mapa.set(nota.turma.id, nota.turma.titulo ?? `Turma ${nota.turma.id}`)
    }
    return Array.from(mapa, ([value, label]) => ({ value, label }))
  }, [requisicaoNotas.data])

  const turmaId = turmaSelecionada ?? requisicaoNotas.data?.[0]?.turma?.id ?? null

  const opcoesDisciplinas = useMemo(() => {
    const ids = new Set(
      (requisicaoNotas.data ?? [])
        .filter((nota) => nota.turma?.id === turmaId)
        .map((nota) => nota.disciplina?.id)
        .filter(Boolean),
    )
    return (requisicaoDisciplinas.data ?? [])
      .filter((disciplina) => ids.has(disciplina.id))
      .map((disciplina) => ({ value: disciplina.id, label: disciplina.titulo ?? '—' }))
  }, [requisicaoNotas.data, requisicaoDisciplinas.data, turmaId])

  const notas = useMemo(() => {
    return (requisicaoNotas.data ?? []).filter(
      (nota) => nota.turma?.id === turmaId && (!disciplinaId || nota.disciplina?.id === disciplinaId),
    )
  }, [requisicaoNotas.data, disciplinaId, turmaId])

  // Filtra também por turma: com repetência, a mesma disciplina teria simulados duplicados.
  function tentativasDaDisciplina(disciplinaFiltroId?: number, turmaFiltroId?: number) {
    return (requisicaoTentativas.data ?? [])
      .filter((tentativa) => {
        if (tentativa.status !== 'CONCLUIDO') return false
        const simulado = porSimulado.get(tentativa.simuladoId)
        return simulado?.disciplinaId === disciplinaFiltroId && simulado?.turmaId === turmaFiltroId
      })
      .map((tentativa) => ({ tentativa, simulado: porSimulado.get(tentativa.simuladoId) }))
  }

  function simuladosDaDisciplina(disciplinaFiltroId?: number, turmaFiltroId?: number) {
    return tentativasDaDisciplina(disciplinaFiltroId, turmaFiltroId).map(({ tentativa, simulado }) => ({
      label: simulado?.titulo ?? `Simulado ${tentativa.simuladoId}`,
      value: `Nota: ${formatarNota(tentativa.nota)}/${formatarNota(simulado?.notaMaxima ?? 10)}`,
    }))
  }

  // Quantos pontos (de 100) a disciplina já distribuiu até agora: só os
  // simulados com notaMaxima concluídos contam — o restante dos 100 pontos
  // da disciplina ainda não foi "colocado em jogo". nota.total é sempre
  // sobre essa base, nunca sobre os 100 pontos totais do curso inteiro.
  function pontosDistribuidos(disciplinaFiltroId?: number, turmaFiltroId?: number) {
    return tentativasDaDisciplina(disciplinaFiltroId, turmaFiltroId).reduce(
      (soma, { simulado }) => soma + (simulado?.notaMaxima ?? 0),
      0,
    )
  }

  if (erroAluno) {
    return (
      <Layout>
        <Header titulo="Notas" />
        <ErroCarregamento titulo="Cadastro do aluno não encontrado" mensagem={erroAluno} />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo="Notas"
        filtros={
          <CamposFiltro>
            {opcoesTurmas.length > 1 && (
              <CampoFiltro $largura="280px">
                <Select<number>
                  options={opcoesTurmas}
                  value={turmaId}
                  placeholder="Selecione a turma"
                  emptyText="Nenhuma turma com notas"
                  onChange={(valor) => {
                    setTurmaSelecionada(valor)
                    setDisciplinaSelecionada(null)
                    setDisciplinaId(null)
                  }}
                />
              </CampoFiltro>
            )}

            <CampoFiltro $largura="280px">
              <Select<number>
                options={opcoesDisciplinas}
                value={disciplinaSelecionada}
                loading={requisicaoDisciplinas.loading}
                clearable
                placeholder="Todas as disciplinas"
                emptyText="Nenhuma disciplina com notas"
                onChange={setDisciplinaSelecionada}
              />
            </CampoFiltro>

            <Button size="large" onClick={() => setDisciplinaId(disciplinaSelecionada)}>
              Buscar
            </Button>
          </CamposFiltro>
        }
      />

      <Card>
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
          />
        ) : (
          <Stack gap="xs">
            {notas.map((nota, indice) => {
              const distribuido = pontosDistribuidos(nota.disciplina?.id, nota.turma?.id)
              const percentual = distribuido > 0 ? ((nota.total ?? 0) / distribuido) * 100 : 0

              return (
                <DropDown
                  key={nota.id}
                  titulo={nota.disciplina?.titulo ?? `Disciplina ${nota.disciplina?.id}`}
                  resumo={
                    <Tag variant={VARIANTE_POR_NIVEL[nivelDesempenho(percentual)]}>
                      Nota: {formatarNota(nota.total ?? 0)}/{formatarNota(distribuido)}
                    </Tag>
                  }
                  abertoInicialmente={indice === 0}
                  itens={simuladosDaDisciplina(nota.disciplina?.id, nota.turma?.id)}
                  emptyText="Nenhum simulado concluído nesta disciplina ainda."
                />
              )
            })}
          </Stack>
        )}
      </Card>
    </Layout>
  )
}
