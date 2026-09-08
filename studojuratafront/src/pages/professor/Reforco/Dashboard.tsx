import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  FileText,
  Rocket,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'

import { Layout } from '../../../components/layout'
import { AlertaDesempenhoCard } from '../../../components/ui/AlertaDesempenhoCard'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DesempenhoCard } from '../../../components/ui/DesempenhoCard'
import { GraficoBarras, type ItemGraficoBarras } from '../../../components/ui/GraficoBarras'
import { GraficoCard } from '../../../components/ui/GraficoCard'
import { GraficoLinha, type PontoGraficoLinha } from '../../../components/ui/GraficoLinha'
import { Header } from '../../../components/ui/Header'
import { Histograma } from '../../../components/ui/Histograma'
import { Tag } from '../../../components/ui/Tag'
import { EstadoVazio } from '../../../components/feedback/EstadoVazio'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { Skeleton } from '../../../components/feedback/Skeleton'
import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useRequisicao } from '../../../hooks/useRequisicao'
import {
  disciplinas as servicoDisciplinas,
  ia as servicoIa,
  professores as servicoProfessores,
  questoes as servicoQuestoes,
  simuladoAlunos,
  simuladoQuestoes,
  simulados as servicoSimulados,
  turmas as servicoTurmas,
} from '../../../services/endpoints'
import { formatarData } from '../../../utils/format'
import type { TipoDestinacaoSimulado } from '../../../types'
import { DetalheSimuladoModal } from './DetalheSimuladoModal'

// Mesma medida do padding do Card que envolve a lista (tokens.spacing.lg em
// Card.tsx) — antes o espaçamento entre os cards era bem menor que a
// distância deles até a borda do Card, parecendo desproporcional.
// Cards de desempenho ficaram verticais (bloco colorido em cima, texto
// embaixo) especificamente pra caber 4 por linha aqui. Confirmado pelo
// usuário: sempre 4 colunas em telas largas (não auto-fill, que deixava
// entrar uma 5ª/6ª coluna em telas muito largas) — colapsa pra 2 e depois 1
// só pra não espremer o card em telas estreitas.
const GradeDesempenho = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`

/* Confirmado no Figma (padrão já usado em outras telas de resumo): duas
   colunas lado a lado em telas largas, empilhando em telas estreitas — os
   dois gráficos de visão geral não competem por espaço com o histograma. */
const GradeVisaoGeral = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
`

/* Confirmado pelo usuário: no card, turma e disciplina viram tags com ícone
   (mesmo padrão do subtítulo do header) — o texto "Turma: X"/"Disciplina: Y"
   por extenso fica só no modal de detalhamento (DetalheSimuladoModal). */
const InfoSimulado = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`

interface DesempenhoSimulado {
  simuladoId: number
  titulo: string
  turma: string
  disciplina: string
  percentual: number
  tentativas: number
  notaMaxima: number
  /** Pra ordenar a tendência ao longo do tempo — dataInicio do simulado, com createdAt como reserva. */
  data?: string
  tipoDestinacao?: TipoDestinacaoSimulado
}

/**
 * Painel do módulo de Reforço.
 *
 * Não há endpoint agregado no back, então o desempenho por simulado é
 * calculado aqui: para cada simulado com tentativas concluídas, a nota
 * média dos alunos é comparada com a notaMaxima do simulado (confirmado no
 * Figma: um card por simulado, não por disciplina).
 */
export default function ReforcoDashboard() {
  const navegar = useNavigate()
  const { professorId } = useProfessorLogado()

  const [simuladoDetalhado, setSimuladoDetalhado] = useState<DesempenhoSimulado | null>(null)

  const requisicaoSimulados = useRequisicao(() => servicoSimulados.listar(), [])
  const requisicaoTentativas = useRequisicao(() => simuladoAlunos.listar(), [])
  const requisicaoDisciplinas = useRequisicao(() => servicoDisciplinas.listar(), [])
  const requisicaoTurmas = useRequisicao(() => servicoTurmas.listar(), [])
  const requisicaoQuestoesPendentes = useRequisicao(() => servicoQuestoes.listarPendentes(), [])
  const requisicaoSimuladoQuestoes = useRequisicao(() => simuladoQuestoes.listar(), [])
  const requisicaoVinculos = useRequisicao(
    () => servicoProfessores.turmasLecionadas(professorId as number),
    [professorId],
    { ativo: Boolean(professorId) },
  )
  // Vínculo aluno/conteúdo/motivo/prazo de cada simulado gerado pela IA —
  // usado só pra detectar os que passaram do prazo sem ter sido lançados
  // (ver simuladosAtrasados). Detalhamento completo fica na tela de
  // aprovação (SimuladosAprovacao.tsx).
  const requisicaoVinculosIA = useRequisicao(() => servicoIa.listarSimuladosGerados(), [])

  const desempenhos = useMemo<DesempenhoSimulado[]>(() => {
    const simulados = requisicaoSimulados.data ?? []
    const tentativas = requisicaoTentativas.data ?? []
    const listaDisciplinas = requisicaoDisciplinas.data ?? []
    const listaTurmas = requisicaoTurmas.data ?? []

    const acumulado = new Map<number, { soma: number; quantidade: number }>()

    tentativas
      .filter((tentativa) => tentativa.status === 'CONCLUIDO' && typeof tentativa.nota === 'number')
      .forEach((tentativa) => {
        const atual = acumulado.get(tentativa.simuladoId) ?? { soma: 0, quantidade: 0 }
        acumulado.set(tentativa.simuladoId, {
          soma: atual.soma + (tentativa.nota as number),
          quantidade: atual.quantidade + 1,
        })
      })

    return [...acumulado.entries()]
      .map(([simuladoId, valores]) => {
        const simulado = simulados.find((item) => item.id === simuladoId)
        const maxima = simulado?.notaMaxima || 10

        return {
          simuladoId,
          titulo: simulado?.titulo ?? `Simulado ${simuladoId}`,
          turma: listaTurmas.find((turma) => turma.id === simulado?.turmaId)?.titulo ?? 'Sem turma',
          disciplina:
            listaDisciplinas.find((disciplina) => disciplina.id === simulado?.disciplinaId)?.titulo ??
            'Sem disciplina',
          percentual: Math.min(100, (valores.soma / valores.quantidade / maxima) * 100),
          tentativas: valores.quantidade,
          notaMaxima: maxima,
          data: simulado?.dataInicio ?? simulado?.createdAt ?? undefined,
          tipoDestinacao: simulado?.tipoDestinacao,
        }
      })
      .sort((a, b) => {
        // Confirmado pelo usuário: por realização, mais recente primeiro —
        // não mais pelo pior desempenho. Sem data, o item fica no fim.
        if (!a.data && !b.data) return 0
        if (!a.data) return 1
        if (!b.data) return -1
        return new Date(b.data).getTime() - new Date(a.data).getTime()
      })
  }, [requisicaoSimulados.data, requisicaoTentativas.data, requisicaoDisciplinas.data, requisicaoTurmas.data])

  const criticos = desempenhos.filter((item) => item.percentual < 50)

  // O card "Desempenho por simulado" do painel mostra só uma amostra — os 4
  // mais recentes; a lista completa (com todos os simulados, também
  // ordenada por realização) fica na tela de detalhamento.
  const desempenhosRecentes = desempenhos.slice(0, 4)

  // O botão leva pra "Simulados aguardando aprovação" (SimuladosAprovacao.tsx),
  // que lista SIMULADOS, não questões — contar questoesPendentes.length aqui
  // direto não batia com o total real de simulados naquela tela (um simulado
  // pode ter várias questões pendentes, inflando o número; e a contagem
  // também não era filtrada pelas turmas deste professor). Mesma lógica de
  // agrupamento da tela de aprovação, só que contando em vez de listar.
  const pendentes = useMemo(() => {
    const turmasDoProfessor = new Set((requisicaoVinculos.data ?? []).map((vinculo) => vinculo.turma?.id))
    const idsQuestoesPendentes = new Set((requisicaoQuestoesPendentes.data ?? []).map((questao) => questao.id))

    const simuladosComPendencia = new Set(
      (requisicaoSimuladoQuestoes.data ?? [])
        .filter((vinculo) => idsQuestoesPendentes.has(vinculo.questaoId))
        .map((vinculo) => vinculo.simuladoId),
    )

    return (requisicaoSimulados.data ?? []).filter(
      (simulado) => simuladosComPendencia.has(simulado.id) && turmasDoProfessor.has(simulado.turmaId ?? undefined),
    ).length
  }, [requisicaoVinculos.data, requisicaoQuestoesPendentes.data, requisicaoSimuladoQuestoes.data, requisicaoSimulados.data])

  // Distribuição geral: toda tentativa concluída de todo simulado deste
  // professor, agregada — diferente do histograma por simulado (que só
  // aparece dentro do detalhamento de UM simulado), este mostra o panorama
  // da turma toda ao longo de tudo que já foi aplicado.
  const notasGeraisPercentuais = useMemo(() => {
    const simuladosDoProfessor = new Map((requisicaoSimulados.data ?? []).map((simulado) => [simulado.id, simulado]))

    return (requisicaoTentativas.data ?? [])
      .filter((tentativa) => tentativa.status === 'CONCLUIDO' && typeof tentativa.nota === 'number')
      .map((tentativa) => {
        const maxima = simuladosDoProfessor.get(tentativa.simuladoId)?.notaMaxima || 10
        return Math.min(100, ((tentativa.nota as number) / maxima) * 100)
      })
  }, [requisicaoSimulados.data, requisicaoTentativas.data])

  // Desempenho médio por disciplina — média dos percentuais já calculados
  // por simulado (não recalcula do zero), só reagrupando por disciplina em
  // vez de por simulado individual.
  const desempenhoPorDisciplina = useMemo<ItemGraficoBarras[]>(() => {
    const acumulado = new Map<string, { soma: number; quantidade: number }>()

    desempenhos.forEach((item) => {
      const atual = acumulado.get(item.disciplina) ?? { soma: 0, quantidade: 0 }
      acumulado.set(item.disciplina, { soma: atual.soma + item.percentual, quantidade: atual.quantidade + 1 })
    })

    return [...acumulado.entries()]
      .map(([disciplina, valores]) => ({
        chave: disciplina,
        rotulo: disciplina,
        valor: valores.soma / valores.quantidade,
      }))
      .sort((a, b) => a.valor - b.valor)
  }, [desempenhos])

  // Evolução ao longo do tempo, por disciplina: os simulados já concluídos
  // dessa disciplina, em ordem cronológica — mostra se a turma está
  // melhorando ou piorando entre um simulado e outro, não só a média
  // isolada de cada um. Só entram disciplinas com 2+ simulados (tendência
  // não existe com um ponto só) e a data vem do próprio simulado (sem data
  // registrada, fica de fora — não dá pra ordenar cronologicamente).
  const tendenciaPorDisciplina = useMemo(() => {
    const porDisciplina = new Map<string, DesempenhoSimulado[]>()

    desempenhos
      .filter((item) => item.data)
      .forEach((item) => {
        const lista = porDisciplina.get(item.disciplina) ?? []
        lista.push(item)
        porDisciplina.set(item.disciplina, lista)
      })

    return [...porDisciplina.entries()]
      .map(([disciplina, itens]) => ({
        disciplina,
        pontos: [...itens]
          .sort((a, b) => new Date(a.data as string).getTime() - new Date(b.data as string).getTime())
          .map<PontoGraficoLinha>((item) => ({
            chave: String(item.simuladoId),
            rotulo: formatarData(item.data),
            valor: item.percentual,
          })),
      }))
      .filter((item) => item.pontos.length >= 2)
  }, [desempenhos])

  // Simulados gerados pela IA que passaram do prazo de revisão sem terem
  // sido lançados (Simulado.status ainda RASCUNHO) — substitui o antigo
  // aviso de "revisão espaçada vencendo hoje" (um contador sem ação) por
  // algo acionável: simulados de verdade parados, esperando o professor.
  const simuladosAtrasados = useMemo(() => {
    const hojeISO = new Date().toISOString().slice(0, 10)
    const simuladosPorId = new Map((requisicaoSimulados.data ?? []).map((simulado) => [simulado.id, simulado]))

    return (requisicaoVinculosIA.data ?? []).filter((vinculo) => {
      const simulado = simuladosPorId.get(vinculo.simuladoId)
      return simulado?.status === 'RASCUNHO' && vinculo.prazoLancamento < hojeISO
    })
  }, [requisicaoVinculosIA.data, requisicaoSimulados.data])

  const loading =
    requisicaoSimulados.loading ||
    requisicaoTentativas.loading ||
    requisicaoDisciplinas.loading ||
    requisicaoTurmas.loading

  const error = requisicaoSimulados.error ?? requisicaoTentativas.error

  return (
    <Layout>
      <Header
        titulo="Módulo de Reforço"
        actions={
          <>
            <Button
              size="large"
              variant="secondary"
              icon={<ClipboardCheck />}
              onClick={() => navegar('/professor/reforco/aprovacao')}
            >
              Simulados para aprovação{pendentes > 0 ? ` (${pendentes})` : ''}
            </Button>
            <Button
              size="large"
              variant="secondary"
              icon={<FileText />}
              onClick={() => navegar('/professor/reforco/simulados')}
            >
              Ver simulados
            </Button>
            <Button
              size="large"
              variant="secondary"
              icon={<BookOpen />}
              onClick={() => navegar('/professor/reforco/questoes?aba=aprovadas')}
            >
              Banco de questões
            </Button>
            <Button size="large" icon={<Rocket />} onClick={() => navegar('/professor/reforco/simulados/novo')}>
              Lançar simulado
            </Button>
          </>
        }
      />

      {criticos.length > 0 && (
        <AlertaDesempenhoCard
          titulo="Desempenho abaixo de 50%"
          descricao={`${criticos.map((item) => item.titulo).join(', ')} ${
            criticos.length === 1 ? 'está' : 'estão'
          } com aproveitamento crítico. Considere lançar um simulado de reforço.`}
          acao={
            <Button size="small" icon={<Rocket />} onClick={() => navegar('/professor/reforco/simulados/novo')}>
              Criar reforço
            </Button>
          }
        />
      )}

      {simuladosAtrasados.length > 0 && (
        <AlertaDesempenhoCard
          titulo="Revisões de reforço atrasadas"
          descricao={`${simuladosAtrasados.length} simulado(s) gerado(s) pela IA passou(aram) do prazo de revisão e ainda não ${
            simuladosAtrasados.length === 1 ? 'foi lançado' : 'foram lançados'
          }.`}
          acao={
            <Button
              size="small"
              icon={<ClipboardCheck />}
              onClick={() => navegar('/professor/reforco/aprovacao')}
            >
              Ver simulados
            </Button>
          }
        />
      )}

      {!loading && !error && desempenhos.length > 0 && (
        <Card
          titulo="Visão geral"
          icon={<BarChart3 />}
          corpoComFundo
          actions={
            <Button
              variant="subtle"
              size="small"
              icon={<ArrowRight />}
              onClick={() => navegar('/professor/reforco/desempenho/geral')}
            >
              Ver detalhes
            </Button>
          }
        >
          <GradeVisaoGeral>
            <GraficoCard
              titulo="Distribuição geral das notas"
              descricao="Todas as tentativas concluídas de todos os simulados, agrupadas em faixas de 20 pontos."
              renderGrafico={(altura) => (
                <Histograma
                  valores={notasGeraisPercentuais}
                  altura={altura}
                  rotuloAcessivel="Distribuição geral de notas de todos os simulados"
                />
              )}
            />

            <GraficoCard
              titulo="Desempenho médio por disciplina"
              descricao="Média do desempenho dos alunos em cada disciplina, considerando todos os simulados concluídos."
              renderGrafico={(altura) => (
                <GraficoBarras
                  itens={desempenhoPorDisciplina}
                  altura={altura}
                  rotuloAcessivel="Desempenho médio por disciplina"
                />
              )}
            />
          </GradeVisaoGeral>
        </Card>
      )}

      {!loading && !error && tendenciaPorDisciplina.length > 0 && (
        <Card
          titulo="Evolução ao longo do tempo"
          icon={<TrendingUp />}
          corpoComFundo
          actions={
            <Button
              variant="subtle"
              size="small"
              icon={<ArrowRight />}
              onClick={() => navegar('/professor/reforco/desempenho/evolucao')}
            >
              Ver detalhes
            </Button>
          }
        >
          <GradeVisaoGeral>
            {tendenciaPorDisciplina.map((item) => (
              <GraficoCard
                key={item.disciplina}
                titulo={`Evolução — ${item.disciplina}`}
                descricao="Nota média da turma em cada simulado dessa disciplina, em ordem cronológica."
                renderGrafico={(altura) => (
                  <GraficoLinha
                    pontos={item.pontos}
                    altura={altura}
                    rotuloAcessivel={`Evolução do desempenho em ${item.disciplina} ao longo do tempo`}
                  />
                )}
              />
            ))}
          </GradeVisaoGeral>
        </Card>
      )}

      <Card
        titulo="Desempenho por simulado"
        icon={<Target />}
        corpoComFundo
        actions={
          <Button
            variant="subtle"
            size="small"
            icon={<ArrowRight />}
            onClick={() => navegar('/professor/reforco/desempenho/simulados')}
          >
            Ver detalhes
          </Button>
        }
      >
        {loading ? (
          <Skeleton $altura="140px" $raio="8px" />
        ) : error ? (
          <ErroCarregamento mensagem={error} onRetry={requisicaoSimulados.reload} />
        ) : desempenhos.length === 0 ? (
          <EstadoVazio
            titulo="Ainda não há simulados concluídos"
            descricao="Assim que os alunos finalizarem os primeiros simulados, o desempenho aparece aqui."
            icon={<TrendingUp />}
            acao={
              <Button icon={<Rocket />} onClick={() => navegar('/professor/reforco/simulados/novo')}>
                Lançar simulado
              </Button>
            }
          />
        ) : (
          <GradeDesempenho>
            {desempenhosRecentes.map((item) => (
              <DesempenhoCard
                key={item.simuladoId}
                titulo={item.titulo}
                descricao={
                  <InfoSimulado>
                    <Tag variant="neutral" icon={<Users />}>
                      {item.turma}
                    </Tag>
                    <Tag variant="neutral" icon={<BookOpen />}>
                      {item.disciplina}
                    </Tag>
                  </InfoSimulado>
                }
                porcentagem={item.percentual}
                icon={<FileText />}
                onClick={() => setSimuladoDetalhado(item)}
              />
            ))}
          </GradeDesempenho>
        )}
      </Card>

      <DetalheSimuladoModal
        aberto={Boolean(simuladoDetalhado)}
        onClose={() => setSimuladoDetalhado(null)}
        simuladoId={simuladoDetalhado?.simuladoId ?? null}
        titulo={simuladoDetalhado?.titulo ?? ''}
        turma={simuladoDetalhado?.turma ?? ''}
        disciplina={simuladoDetalhado?.disciplina ?? ''}
        notaMaxima={simuladoDetalhado?.notaMaxima ?? 10}
        tentativas={(requisicaoTentativas.data ?? []).filter(
          (tentativa) => tentativa.simuladoId === simuladoDetalhado?.simuladoId && tentativa.status === 'CONCLUIDO',
        )}
        data={simuladoDetalhado?.data}
        tipoDestinacao={simuladoDetalhado?.tipoDestinacao}
      />
    </Layout>
  )
}
