import { useMemo, useState } from 'react'
import styled from 'styled-components'
import { NotebookPen, Search } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DropDown } from '../../../components/ui/DropDown'
import { Header } from '../../../components/ui/Header'
import { Select } from '../../../components/ui/Select'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { EstadoVazio } from '../../../components/feedback/EstadoVazio'
import { Skeleton } from '../../../components/feedback/Skeleton'
import { usePeriodoLetivo } from '../../../contexts/periodoLetivoContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useRequisicao } from '../../../hooks/useRequisicao'
import {
  matriculas,
  notas as servicoNotas,
  professores as servicoProfessores,
  simuladoAlunos,
  simulados as servicoSimulados,
} from '../../../services/endpoints'
import { formatarNota } from '../../../utils/format'
import type { SimuladoAlunoResponse } from '../../../types'

type TipoFiltro = 'disciplina' | 'aluno'

/* Confirmado no Figma: os 3 selects + botão Buscar dividem uma linha só,
   sem rótulo separado acima de cada campo (o texto do campo é o rótulo,
   mostrado como placeholder dentro da própria caixa). */
const CamposCabecalho = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  width: fit-content;
  max-width: 100%;
  overflow-x: auto;
`

/* Largura fixa (não flex: 1): o slot de filtros do Header (S.Filtros) é
   width:fit-content — um filho em flex:1 não tem contra o que crescer
   dentro de um pai que só se ajusta ao próprio conteúdo, e os campos
   colapsavam pro min-width. 211px vem do Figma: 830px de linha inteira
   (3 campos + botão) menos os 150px do botão e os 3 gaps de 16px,
   dividido por 3. */
const CampoLargura = styled.div`
  width: 211px;
`

const LarguraBotao = styled.div`
  width: 150px;
  flex-shrink: 0;

  button {
    width: 100%;
  }
`

/* Confirmado no Figma: 32px de padding ao redor da lista de acordeões e
   16px de gap entre eles — por isso o Card usa semPadding (o padding padrão
   dele é 24px, não bate) e este wrapper aplica os valores certos. */
const Lista = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
`

interface FiltroAplicado {
  turmaId: number
  tipo: TipoFiltro
  especificoId: number
}

interface LinhaAcordeao {
  chave: string
  titulo: string
  alunoId: number
  disciplinaId: number
}

/**
 * Notas por turma, filtradas por disciplina OU por aluno (o professor
 * escolhe o tipo). O resultado é um acordeão: filtrando por aluno, uma linha
 * por disciplina que o professor leciona nessa turma; filtrando por
 * disciplina, uma linha por aluno matriculado. Cada linha expande pra
 * mostrar os simulados individuais que compõem a nota.
 *
 * Nota é sempre derivada dos simulados concluídos — não há lançamento
 * manual. O recálculo deixou de ser uma ação desta tela: acontece sozinho,
 * pra todas as turmas do professor, quando o período letivo muda na sidebar
 * (ver PeriodoLetivoContext) — esta tela só lê o período atual.
 */
export default function Notas() {
  const toast = useToast()
  const { professorId } = useProfessorLogado()
  const { periodoLetivo } = usePeriodoLetivo()

  const [turmaId, setTurmaId] = useState<number | null>(null)
  const [tipo, setTipo] = useState<TipoFiltro | null>(null)
  const [especificoId, setEspecificoId] = useState<number | null>(null)
  const [filtro, setFiltro] = useState<FiltroAplicado | null>(null)

  const requisicaoVinculos = useRequisicao(
    () => servicoProfessores.turmasLecionadas(professorId as number),
    [professorId],
    { ativo: Boolean(professorId) },
  )

  const opcoesTurmas = useMemo(() => {
    const unicas = new Map<number, string>()
    for (const vinculo of requisicaoVinculos.data ?? []) {
      if (vinculo.turma && vinculo.status !== 'INATIVO') {
        unicas.set(vinculo.turma.id, vinculo.turma.titulo)
      }
    }
    return [...unicas.entries()].map(([value, label]) => ({ value, label }))
  }, [requisicaoVinculos.data])

  const opcoesTipo: { value: TipoFiltro; label: string }[] = [
    { value: 'disciplina', label: 'Disciplina' },
    { value: 'aluno', label: 'Aluno' },
  ]

  const disciplinasDaTurma = useMemo(
    () =>
      (requisicaoVinculos.data ?? [])
        .filter((vinculo) => vinculo.turma?.id === turmaId && vinculo.status !== 'INATIVO' && vinculo.disciplina)
        .map((vinculo) => ({ value: vinculo.disciplina!.id, label: vinculo.disciplina?.titulo ?? '—' })),
    [requisicaoVinculos.data, turmaId],
  )

  const requisicaoMatriculasTurma = useRequisicao(
    () => matriculas.ativosPorTurma(turmaId as number),
    [turmaId],
    { ativo: Boolean(turmaId) && tipo === 'aluno' },
  )

  const opcoesEspecifico = useMemo(() => {
    if (tipo === 'disciplina') return disciplinasDaTurma

    if (tipo === 'aluno') {
      return (requisicaoMatriculasTurma.data ?? []).map((matricula) => ({
        value: matricula.aluno.id,
        label: matricula.aluno?.pessoa?.nome ?? `Aluno ${matricula.aluno.id}`,
      }))
    }

    return []
  }, [tipo, disciplinasDaTurma, requisicaoMatriculasTurma.data])

  function buscar() {
    if (!turmaId || !tipo || !especificoId) {
      toast.warning('Selecione turma, tipo de filtro e o item específico antes de buscar.')
      return
    }

    setFiltro({ turmaId, tipo, especificoId })
  }

  // Dados pra montar os acordeões — sempre ativos: a tela abre com a lista
  // completa (todas as turmas/disciplinas do professor), sem exigir Buscar.
  const requisicaoMatriculasResultado = useRequisicao(
    () => matriculas.ativosPorTurma(filtro?.turmaId as number),
    [filtro?.turmaId],
    { ativo: filtro?.tipo === 'disciplina' },
  )
  const requisicaoNotas = useRequisicao(() => servicoNotas.listar(), [])
  const requisicaoSimulados = useRequisicao(() => servicoSimulados.listar(), [])

  // Sem filtro: uma matrícula por (turma, disciplina) do professor —
  // equivalente a rodar o modo "por disciplina" pra cada vínculo dele.
  const vinculosAtivos = useMemo(
    () => (requisicaoVinculos.data ?? []).filter((v) => v.turma && v.disciplina && v.status !== 'INATIVO'),
    [requisicaoVinculos.data],
  )
  const turmasUnicas = useMemo(
    () => [...new Set(vinculosAtivos.map((v) => v.turma!.id))],
    [vinculosAtivos],
  )
  const requisicaoMatriculasTodas = useRequisicao(
    async () => {
      const listas = await Promise.all(turmasUnicas.map((id) => matriculas.ativosPorTurma(id)))
      return new Map(turmasUnicas.map((id, indice) => [id, listas[indice]]))
    },
    [turmasUnicas],
    { ativo: !filtro && turmasUnicas.length > 0 },
  )

  const linhasAcordeao = useMemo<LinhaAcordeao[]>(() => {
    if (!filtro) {
      return vinculosAtivos.flatMap((vinculo) => {
        const alunosDaTurma = requisicaoMatriculasTodas.data?.get(vinculo.turma!.id) ?? []

        return alunosDaTurma.map((matricula) => ({
          chave: `${vinculo.id}-${matricula.aluno.id}`,
          titulo: `${matricula.aluno?.pessoa?.nome ?? `Aluno ${matricula.aluno.id}`} · ${vinculo.turma!.titulo} · ${vinculo.disciplina!.titulo}`,
          alunoId: matricula.aluno.id,
          disciplinaId: vinculo.disciplina!.id,
        }))
      })
    }

    if (filtro.tipo === 'aluno') {
      return disciplinasDaTurma.map((disciplina) => ({
        chave: `disciplina-${disciplina.value}`,
        titulo: disciplina.label,
        alunoId: filtro.especificoId,
        disciplinaId: disciplina.value,
      }))
    }

    return (requisicaoMatriculasResultado.data ?? []).map((matricula) => ({
      chave: `aluno-${matricula.aluno.id}`,
      titulo: matricula.aluno?.pessoa?.nome ?? `Aluno ${matricula.aluno.id}`,
      alunoId: matricula.aluno.id,
      disciplinaId: filtro.especificoId,
    }))
  }, [filtro, disciplinasDaTurma, requisicaoMatriculasResultado.data, vinculosAtivos, requisicaoMatriculasTodas.data])

  // Tentativas de simulado de cada aluno envolvido, buscadas uma vez por aluno distinto.
  const alunosEnvolvidos = useMemo(
    () => [...new Set(linhasAcordeao.map((linha) => linha.alunoId))],
    [linhasAcordeao],
  )

  const requisicaoTentativas = useRequisicao(
    async () => {
      const listas = await Promise.all(alunosEnvolvidos.map((id) => simuladoAlunos.listarPorAluno(id)))
      return new Map<number, SimuladoAlunoResponse[]>(alunosEnvolvidos.map((id, indice) => [id, listas[indice]]))
    },
    [alunosEnvolvidos],
    { ativo: alunosEnvolvidos.length > 0 },
  )

  const porSimulado = useMemo(
    () => new Map((requisicaoSimulados.data ?? []).map((simulado) => [simulado.id, simulado])),
    [requisicaoSimulados.data],
  )

  function notaDaLinha(alunoId: number, disciplinaId: number) {
    return (
      (requisicaoNotas.data ?? []).find(
        (nota) =>
          nota.aluno?.id === alunoId &&
          nota.disciplina?.id === disciplinaId &&
          nota.periodoLetivo === periodoLetivo,
      ) ?? null
    )
  }

  function simuladosDaLinha(alunoId: number, disciplinaId: number) {
    const tentativas = requisicaoTentativas.data?.get(alunoId) ?? []

    return tentativas
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

  const carregandoResultado =
    requisicaoMatriculasResultado.loading ||
    requisicaoMatriculasTodas.loading ||
    requisicaoNotas.loading ||
    requisicaoSimulados.loading

  if (requisicaoVinculos.error) {
    return (
      <Layout>
        <Header titulo="Notas" />
        <ErroCarregamento mensagem={requisicaoVinculos.error} onRetry={requisicaoVinculos.reload} />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo="Notas"
        filtros={
          <CamposCabecalho>
            <CampoLargura>
              <Select
                placeholder="Turma"
                options={opcoesTurmas}
                value={turmaId}
                loading={requisicaoVinculos.loading}
                emptyText="Você não leciona em nenhuma turma"
                onChange={(valor) => {
                  setTurmaId(valor)
                  setEspecificoId(null)
                }}
              />
            </CampoLargura>

            <CampoLargura>
              <Select<TipoFiltro>
                placeholder="Disciplina / Aluno"
                options={opcoesTipo}
                value={tipo}
                emptyText="—"
                onChange={(valor) => {
                  setTipo(valor)
                  setEspecificoId(null)
                }}
              />
            </CampoLargura>

            <CampoLargura>
              <Select
                placeholder="Disc/Aluno (Específico)"
                options={opcoesEspecifico}
                value={especificoId}
                disabled={!tipo || !turmaId}
                loading={tipo === 'aluno' && requisicaoMatriculasTurma.loading}
                emptyText="Selecione turma e tipo primeiro"
                onChange={setEspecificoId}
              />
            </CampoLargura>

            <LarguraBotao>
              <Button size="large" icon={<Search />} onClick={buscar}>
                Buscar
              </Button>
            </LarguraBotao>
          </CamposCabecalho>
        }
      />

      {carregandoResultado ? (
        <Skeleton $altura="240px" $raio="8px" />
      ) : linhasAcordeao.length === 0 ? (
        <Card>
          <EstadoVazio
            titulo="Nada encontrado"
            descricao={filtro ? 'Não há dados para esse filtro.' : 'Você ainda não leciona em nenhuma turma.'}
            icon={<NotebookPen />}
          />
        </Card>
      ) : (
        <Card semPadding>
          <Lista>
            {linhasAcordeao.map((linha, indice) => {
              const nota = notaDaLinha(linha.alunoId, linha.disciplinaId)

              return (
                <DropDown
                  key={linha.chave}
                  titulo={linha.titulo}
                  resumo={typeof nota?.total === 'number' ? `Nota: ${formatarNota(nota.total)}` : 'Sem nota'}
                  abertoInicialmente={indice === 0}
                  itens={simuladosDaLinha(linha.alunoId, linha.disciplinaId)}
                  emptyText="Nenhum simulado concluído considerado nesta nota."
                />
              )
            })}
          </Lista>
        </Card>
      )}
    </Layout>
  )
}
