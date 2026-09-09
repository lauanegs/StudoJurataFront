import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarClock,
  FileDown,
  FileSpreadsheet,
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
import { InfoCard } from '../../../components/ui/InfoCard'
import { ListaInfo } from '../../../components/ui/ListaInfo'
import { Select, type SelectOption } from '../../../components/ui/Select'
import { Tag } from '../../../components/ui/Tag'
import { EstadoVazio } from '../../../components/feedback/EstadoVazio'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { Skeleton } from '../../../components/feedback/Skeleton'
import { useRequisicao } from '../../../hooks/useRequisicao'
import {
  disciplinas as servicoDisciplinas,
  simuladoAlunos,
  simulados as servicoSimulados,
  turmas as servicoTurmas,
} from '../../../services/endpoints'
import { calcularFaixasHistograma } from '../../../utils/desempenho'
import { exportarExcelAbas } from '../../../utils/exportarPlanilha'
import { exportarPdf } from '../../../utils/exportarPdf'
import { formatarData, formatarPorcentagem } from '../../../utils/format'
import { renderizarGraficoComoImagem, type ImagemGrafico } from '../../../utils/renderizarGrafico'
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

/* Pedido explícito: cards de números absolutos no topo, mesmo padrão da
   Home do admin (Indicadores em Home.tsx) — visão geral "de sempre",
   independente do período selecionado pros gráficos abaixo. */
const Indicadores = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

const LarguraPeriodo = styled.div`
  width: 200px;
`

type PeriodoPreset = 'mes' | 'ano' | 'tudo'

const OPCOES_PERIODO: SelectOption<PeriodoPreset>[] = [
  { value: 'mes', label: 'Este mês' },
  { value: 'ano', label: 'Este ano' },
  { value: 'tudo', label: 'Todo o histórico' },
]

/** Simulado "no período" pela data em que foi aplicado (mesmo campo usado pra ordenar por realização). */
function estaNoPeriodo(dataIso: string | undefined, preset: PeriodoPreset): boolean {
  if (preset === 'tudo') return true
  if (!dataIso) return false

  const data = new Date(dataIso)
  const agora = new Date()

  if (preset === 'ano') return data.getFullYear() === agora.getFullYear()
  return data.getFullYear() === agora.getFullYear() && data.getMonth() === agora.getMonth()
}

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
 * Painel de Desempenho (pedido explícito: aba própria na sidebar, separada
 * do módulo de Reforço, pra não misturar "gerenciar simulados" com "ver
 * indicadores").
 *
 * Não há endpoint agregado no back, então o desempenho por simulado é
 * calculado aqui: para cada simulado com tentativas concluídas, a nota
 * média dos alunos é comparada com a notaMaxima do simulado (confirmado no
 * Figma: um card por simulado, não por disciplina).
 */
export default function Desempenho() {
  const navegar = useNavigate()

  const [simuladoDetalhado, setSimuladoDetalhado] = useState<DesempenhoSimulado | null>(null)
  // Pedido explícito: os gráficos que abrem a tela já vêm filtrados por um
  // período (ano atual por padrão) — "Todo o histórico" continua disponível
  // pra quem quiser o panorama completo.
  const [periodo, setPeriodo] = useState<PeriodoPreset>('ano')

  const requisicaoSimulados = useRequisicao(() => servicoSimulados.listar(), [])
  const requisicaoTentativas = useRequisicao(() => simuladoAlunos.listar(), [])
  const requisicaoDisciplinas = useRequisicao(() => servicoDisciplinas.listar(), [])
  const requisicaoTurmas = useRequisicao(() => servicoTurmas.listar(), [])

  const desempenhosTotais = useMemo<DesempenhoSimulado[]>(() => {
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

  // Recorte pelo período selecionado — só afeta os gráficos abaixo; os
  // cards de números absolutos no topo continuam somando tudo (ver
  // totais* mais abaixo, calculados a partir de desempenhosTotais).
  const desempenhos = useMemo(
    () => desempenhosTotais.filter((item) => estaNoPeriodo(item.data, periodo)),
    [desempenhosTotais, periodo],
  )

  const rotuloPeriodo = OPCOES_PERIODO.find((opcao) => opcao.value === periodo)?.label ?? ''
  const contextoTextoPeriodo = [`Período: ${rotuloPeriodo}`]
  const contextoPeriodo = (
    <ListaInfo itens={[{ icon: <CalendarClock />, texto: contextoTextoPeriodo[0] }]} />
  )

  const criticos = desempenhos.filter((item) => item.percentual < 50)

  // O card "Desempenho por simulado" do painel mostra só uma amostra — os 4
  // mais recentes; a lista completa (com todos os simulados, também
  // ordenada por realização) fica na tela de detalhamento.
  const desempenhosRecentes = desempenhos.slice(0, 4)

  // Distribuição geral: toda tentativa concluída de todo simulado deste
  // professor no período selecionado, agregada — diferente do histograma
  // por simulado (que só aparece dentro do detalhamento de UM simulado),
  // este mostra o panorama da turma toda no recorte escolhido.
  const notasGeraisPercentuais = useMemo(() => {
    const idsNoPeriodo = new Set(desempenhos.map((item) => item.simuladoId))
    const simuladosDoProfessor = new Map((requisicaoSimulados.data ?? []).map((simulado) => [simulado.id, simulado]))

    return (requisicaoTentativas.data ?? [])
      .filter(
        (tentativa) =>
          tentativa.status === 'CONCLUIDO' &&
          typeof tentativa.nota === 'number' &&
          idsNoPeriodo.has(tentativa.simuladoId),
      )
      .map((tentativa) => {
        const maxima = simuladosDoProfessor.get(tentativa.simuladoId)?.notaMaxima || 10
        return Math.min(100, ((tentativa.nota as number) / maxima) * 100)
      })
  }, [desempenhos, requisicaoSimulados.data, requisicaoTentativas.data])

  // Valores exatos por trás do histograma acima — vira a tabela mostrada na
  // impressão (no lugar do gráfico, que não imprime de forma confiável) e o
  // conteúdo exportado pro Excel.
  const tabelaDistribuicaoGeral = useMemo(
    () =>
      calcularFaixasHistograma(notasGeraisPercentuais).map((faixa) => ({
        chave: faixa.rotulo,
        rotulo: faixa.rotulo,
        valor: String(faixa.quantidade),
      })),
    [notasGeraisPercentuais],
  )

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
  // dessa disciplina no período selecionado, em ordem cronológica — mostra
  // se a turma está melhorando ou piorando entre um simulado e outro, não
  // só a média isolada de cada um. Só entram disciplinas com 2+ simulados
  // (tendência não existe com um ponto só).
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

  // Valores exatos do gráfico de desempenho por disciplina (mesma linha de
  // raciocínio da tabela de distribuição acima).
  const tabelaDesempenhoPorDisciplina = useMemo(
    () =>
      desempenhoPorDisciplina.map((item) => ({
        chave: item.chave,
        rotulo: item.rotulo,
        valor: formatarPorcentagem(item.valor),
      })),
    [desempenhoPorDisciplina],
  )

  // Cards de números absolutos no topo (pedido explícito, mesmo padrão da
  // Home do admin) — sempre o total geral, independente do período
  // selecionado pros gráficos abaixo.
  const totalTentativasConcluidas = useMemo(
    () => (requisicaoTentativas.data ?? []).filter((tentativa) => tentativa.status === 'CONCLUIDO').length,
    [requisicaoTentativas.data],
  )
  const totalAlunosAvaliados = useMemo(() => {
    const ids = new Set(
      (requisicaoTentativas.data ?? [])
        .filter((tentativa) => tentativa.status === 'CONCLUIDO')
        .map((tentativa) => tentativa.alunoId),
    )
    return ids.size
  }, [requisicaoTentativas.data])
  const totalDisciplinasAvaliadas = useMemo(
    () => new Set(desempenhosTotais.map((item) => item.disciplina)).size,
    [desempenhosTotais],
  )

  // Pedido explícito: exportar TUDO — todas as seções da tela, num arquivo
  // só, organizadas (uma aba por seção no Excel, uma tabela por seção no
  // PDF) — não só o gráfico que estiver aberto no momento.
  const secoesRelatorioCompleto = useMemo(
    () => [
      {
        titulo: 'Resumo geral',
        colunaRotulo: 'Indicador',
        colunaValor: 'Valor',
        linhas: [
          { chave: 'simulados', rotulo: 'Simulados aplicados', valor: String(desempenhosTotais.length) },
          { chave: 'tentativas', rotulo: 'Tentativas concluídas', valor: String(totalTentativasConcluidas) },
          { chave: 'alunos', rotulo: 'Alunos avaliados', valor: String(totalAlunosAvaliados) },
          { chave: 'disciplinas', rotulo: 'Disciplinas avaliadas', valor: String(totalDisciplinasAvaliadas) },
        ],
      },
      {
        titulo: 'Distribuição geral das notas',
        colunaRotulo: 'Faixa de nota',
        colunaValor: 'Quantidade',
        linhas: tabelaDistribuicaoGeral,
      },
      {
        titulo: 'Desempenho médio por disciplina',
        colunaRotulo: 'Disciplina',
        colunaValor: 'Desempenho médio',
        linhas: tabelaDesempenhoPorDisciplina,
      },
      ...tendenciaPorDisciplina.map((item) => ({
        titulo: `Evolução — ${item.disciplina}`,
        colunaRotulo: 'Simulado',
        colunaValor: 'Nota',
        linhas: item.pontos.map((ponto) => ({
          chave: ponto.chave,
          rotulo: ponto.rotulo,
          valor: formatarPorcentagem(ponto.valor),
        })),
      })),
      {
        titulo: 'Desempenho por simulado',
        colunaRotulo: 'Simulado',
        colunaValor: 'Desempenho',
        linhas: desempenhos.map((item) => ({
          chave: String(item.simuladoId),
          rotulo: `${item.titulo} — ${item.turma} — ${item.disciplina}`,
          valor: formatarPorcentagem(item.percentual),
        })),
      },
    ],
    [
      desempenhosTotais.length,
      totalTentativasConcluidas,
      totalAlunosAvaliados,
      totalDisciplinasAvaliadas,
      tabelaDistribuicaoGeral,
      tabelaDesempenhoPorDisciplina,
      tendenciaPorDisciplina,
      desempenhos,
    ],
  )

  // Pra "Exportar tudo": captura o desenho de cada gráfico da tela (os
  // MESMOS componentes, renderizados fora da tela) e casa com a seção de
  // mesmo título em secoesRelatorioCompleto acima — "Resumo geral" e
  // "Desempenho por simulado" não têm gráfico correspondente, ficam só com
  // a tabela.
  const capturarImagensRelatorio = async (): Promise<Map<string, ImagemGrafico | null>> => {
    const alturaDisciplina = Math.max(120, desempenhoPorDisciplina.length * 44)

    const [distribuicaoGeral, porDisciplina, ...evolucoes] = await Promise.all([
      renderizarGraficoComoImagem(
        <Histograma valores={notasGeraisPercentuais} rotuloAcessivel="Distribuição geral de notas" />,
        640,
        280,
      ),
      renderizarGraficoComoImagem(
        <GraficoBarras itens={desempenhoPorDisciplina} altura={alturaDisciplina} rotuloAcessivel="Desempenho médio por disciplina" />,
        640,
        alturaDisciplina,
      ),
      ...tendenciaPorDisciplina.map((item) =>
        renderizarGraficoComoImagem(
          <GraficoLinha pontos={item.pontos} rotuloAcessivel={`Evolução do desempenho em ${item.disciplina}`} />,
          640,
          280,
        ),
      ),
    ])

    const mapa = new Map<string, ImagemGrafico | null>()
    mapa.set('Distribuição geral das notas', distribuicaoGeral)
    mapa.set('Desempenho médio por disciplina', porDisciplina)
    tendenciaPorDisciplina.forEach((item, indice) => mapa.set(`Evolução — ${item.disciplina}`, evolucoes[indice]))
    return mapa
  }

  const loading =
    requisicaoSimulados.loading ||
    requisicaoTentativas.loading ||
    requisicaoDisciplinas.loading ||
    requisicaoTurmas.loading

  const error = requisicaoSimulados.error ?? requisicaoTentativas.error

  return (
    <Layout>
      <Header
        titulo="Desempenho"
        actions={
          <>
            <Button
              size="large"
              variant="secondary"
              icon={<FileSpreadsheet />}
              onClick={async () => {
                const imagens = await capturarImagensRelatorio()
                exportarExcelAbas(
                  'Relatório de desempenho',
                  secoesRelatorioCompleto.map((secao) => ({
                    nome: secao.titulo,
                    ...secao,
                    imagem: imagens.get(secao.titulo) ?? null,
                  })),
                )
              }}
            >
              Exportar tudo (Excel)
            </Button>
            <Button
              size="large"
              variant="secondary"
              icon={<FileDown />}
              onClick={async () => {
                const imagens = await capturarImagensRelatorio()
                exportarPdf(
                  'Relatório de desempenho',
                  'Relatório de desempenho',
                  contextoTextoPeriodo,
                  secoesRelatorioCompleto.map((secao) => ({ ...secao, imagem: imagens.get(secao.titulo) ?? null })),
                )
              }}
            >
              Exportar tudo (PDF)
            </Button>
          </>
        }
        filtros={
          <LarguraPeriodo>
            <Select<PeriodoPreset>
              options={OPCOES_PERIODO}
              value={periodo}
              onChange={(valor) => setPeriodo(valor ?? 'ano')}
            />
          </LarguraPeriodo>
        }
      />

      <Indicadores>
        <InfoCard value={desempenhosTotais.length} label="simulados aplicados" />
        <InfoCard value={totalTentativasConcluidas} label="tentativas concluídas" />
        <InfoCard value={totalAlunosAvaliados} label="alunos avaliados" />
        <InfoCard value={totalDisciplinasAvaliadas} label="disciplinas avaliadas" />
      </Indicadores>

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
              onClick={() => navegar('/professor/desempenho/geral')}
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
              contexto={contextoPeriodo}
              contextoTexto={contextoTextoPeriodo}
              dados={tabelaDistribuicaoGeral}
              colunaRotulo="Faixa de nota"
              colunaValor="Quantidade"
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
              contexto={contextoPeriodo}
              contextoTexto={contextoTextoPeriodo}
              dados={tabelaDesempenhoPorDisciplina}
              colunaRotulo="Disciplina"
              colunaValor="Desempenho médio"
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
              onClick={() => navegar('/professor/desempenho/evolucao')}
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
                contexto={contextoPeriodo}
              contextoTexto={contextoTextoPeriodo}
                colunaRotulo="Simulado"
                colunaValor="Nota"
                dados={item.pontos.map((ponto) => ({
                  chave: ponto.chave,
                  rotulo: ponto.rotulo,
                  valor: formatarPorcentagem(ponto.valor),
                }))}
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
            onClick={() => navegar('/professor/desempenho/simulados')}
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
            titulo={
              desempenhosTotais.length > 0
                ? `Nenhum simulado concluído em "${rotuloPeriodo}"`
                : 'Ainda não há simulados concluídos'
            }
            descricao={
              desempenhosTotais.length > 0
                ? 'Troque o período no topo da tela pra ver um recorte maior.'
                : 'Assim que os alunos finalizarem os primeiros simulados, o desempenho aparece aqui.'
            }
            icon={<TrendingUp />}
            acao={
              desempenhosTotais.length > 0 ? (
                <Button variant="secondary" onClick={() => setPeriodo('tudo')}>
                  Ver todo o histórico
                </Button>
              ) : (
                <Button icon={<Rocket />} onClick={() => navegar('/professor/reforco/simulados/novo')}>
                  Lançar simulado
                </Button>
              )
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
