import { useMemo, useState } from 'react'
import styled from 'styled-components'

import { Layout } from '../../components/layout'
import { Button } from '../../components/ui/Button'
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
import {
  disciplinas as servicoDisciplinas,
  notas as servicoNotas,
  simuladoAlunos,
  simulados as servicoSimulados,
} from '../../services/endpoints'
import { nivelDesempenho } from '../../utils/desempenho'
import { formatarNota } from '../../utils/format'

const VARIANTE_POR_NIVEL = { baixo: 'error', medio: 'warning', alto: 'success' } as const

const Lista = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`

/* Confirmado no Figma: select de disciplina + botão "Buscar" colados, na
   mesma linha, igual ao padrão já usado nas telas do professor (sem label
   flutuante acima do campo). */
const CamposCabecalho = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`

/* O <Field> por baixo do Select pede width:100% do pai — dentro de um flex
   item sem largura própria isso força o cálculo de shrink-to-fit e o campo
   acaba quebrando de linha mesmo sobrando espaço. Uma largura fixa aqui
   (mesmo padrão já usado nos headers do professor) resolve. */
const CampoLargura = styled.div`
  width: 280px;
`

/**
 * Notas do aluno logado.
 *
 * O back devolve a Nota consolidada por disciplina/período; os simulados que a
 * compõem são reconstruídos aqui a partir das tentativas concluídas.
 */
export default function AlunoNotas() {
  const { alunoId, loading: carregandoAluno, error: erroAluno } = useAlunoLogado()

  // Confirmado no Figma: o filtro é por disciplina e só se aplica ao clicar
  // em "Buscar" — a lista começa completa, sem filtro.
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState<number | null>(null)
  const [disciplinaId, setDisciplinaId] = useState<number | null>(null)

  // Com matrícula cíclica o aluno pode ter Nota em mais de uma turma da mesma
  // disciplina (repetência) ou cursar mais de um curso — a lista mostra só
  // uma turma por vez. null = "ainda não escolheu": usa a turma da Nota mais
  // recente (o histórico já vem do back ordenado do mais novo pro mais
  // antigo) como padrão, sem precisar de estado sincronizado por efeito.
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

  // Filtra também por turma: com matrícula cíclica o aluno pode ter mais de
  // uma Nota da mesma disciplina (repetência em outra turma) — sem a turma,
  // os dois acordeões mostrariam os mesmos simulados duplicados.
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
          <CamposCabecalho>
            {opcoesTurmas.length > 1 && (
              <CampoLargura>
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
              </CampoLargura>
            )}

            <CampoLargura>
              <Select<number>
                options={opcoesDisciplinas}
                value={disciplinaSelecionada}
                loading={requisicaoDisciplinas.loading}
                clearable
                placeholder="Todas as disciplinas"
                emptyText="Nenhuma disciplina com notas"
                onChange={setDisciplinaSelecionada}
              />
            </CampoLargura>

            <Button size="large" onClick={() => setDisciplinaId(disciplinaSelecionada)}>
              Buscar
            </Button>
          </CamposCabecalho>
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
          <Lista>
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
          </Lista>
        )}
      </Card>
    </Layout>
  )
}
