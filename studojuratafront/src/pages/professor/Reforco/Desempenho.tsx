import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Filter,
  FileDown,
  FileSpreadsheet,
  FileText,
  Rocket,
  Search,
  Target,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'

import { Layout } from '../../../components/layout'
import { AlertaDesempenhoCard } from '../../../components/desempenho/AlertaDesempenhoCard'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DesempenhoCard } from '../../../components/desempenho/DesempenhoCard'
import { GraficoBarras } from '../../../components/graficos/GraficoBarras'
import { GraficoCard } from '../../../components/graficos/GraficoCard'
import { GraficoLinha } from '../../../components/graficos/GraficoLinha'
import { Header } from '../../../components/ui/Header'
import { Histograma } from '../../../components/graficos/Histograma'
import { InfoCard } from '../../../components/ui/InfoCard'
import { ListaInfo } from '../../../components/ui/ListaInfo'
import { Modal } from '../../../components/ui/Modal'
import { Select } from '../../../components/ui/Select'
import { Tag } from '../../../components/ui/Tag'
import { Stack } from '../../../components/ui/Stack'
import { GradeAutoAjuste } from '../../../components/ui/GradeAutoAjuste'
import { EstadoVazio } from '../../../components/feedback/EstadoVazio'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { Skeleton } from '../../../components/feedback/Skeleton'
import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { professores as servicoProfessores } from '../../../services/pessoas'
import { calcularFaixasHistograma } from '../../../utils/desempenho'
import { exportarExcelAbas } from '../../../utils/exportacao/exportarPlanilha'
import { exportarPdf } from '../../../utils/exportacao/exportarPdf'
import { formatarPorcentagem } from '../../../utils/format'
import { renderizarGraficoComoImagem, type ImagemGrafico } from '../../../components/graficos/RenderizarGrafico'
import { agruparPorSimulado, mediaPorDisciplina, tendenciaPorDisciplina as calcularTendencia, type DesempenhoSimulado } from './agregacoesDesempenho'
import { DetalheSimuladoModal } from './DetalheSimuladoModal'

// Gap igual ao padding do Card. Sempre 4 colunas em telas largas (auto-fill
// colocaria uma 5ª/6ª), colapsando para 2 e 1 em telas estreitas.
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

/* No card, turma e disciplina são tags com ícone; o texto por extenso fica no modal. */
const InfoSimulado = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`

/** Base: tentativas concluídas dos simulados das turmas do professor (GET /professores/{id}/desempenho). */
export default function Desempenho() {
  const navegar = useNavigate()

  const { professorId } = useProfessorLogado()

  const [simuladoDetalhado, setSimuladoDetalhado] = useState<DesempenhoSimulado | null>(null)

  // Sem filtro de aluno, que não cabe na visão agregada por simulado. Só
  // refiltra ao clicar "Buscar".
  const [modalFiltrosAberto, setModalFiltrosAberto] = useState(false)
  const [turmaIdForm, setTurmaIdForm] = useState<number | null>(null)
  const [disciplinaIdForm, setDisciplinaIdForm] = useState<number | null>(null)
  const [turmaIdAplicado, setTurmaIdAplicado] = useState<number | null>(null)
  const [disciplinaIdAplicado, setDisciplinaIdAplicado] = useState<number | null>(null)

  const requisicaoTentativas = useRequisicao(
    () => servicoProfessores.desempenho(professorId as number),
    [professorId],
    { ativo: Boolean(professorId) },
  )
  const requisicaoVinculos = useRequisicao(
    () => servicoProfessores.turmasLecionadas(professorId as number),
    [professorId],
    { ativo: Boolean(professorId) },
  )

  const opcoesTurmasFiltro = useMemo(() => {
    const unicas = new Map<number, string>()
    for (const vinculo of requisicaoVinculos.data ?? []) {
      if (vinculo.turma && vinculo.status !== 'INATIVO') unicas.set(vinculo.turma.id, vinculo.turma.titulo)
    }
    return [...unicas.entries()].map(([value, label]) => ({ value, label }))
  }, [requisicaoVinculos.data])

  const opcoesDisciplinasFiltro = useMemo(() => {
    const unicas = new Map<number, string>()
    for (const vinculo of requisicaoVinculos.data ?? []) {
      if (!vinculo.disciplina || vinculo.status === 'INATIVO') continue
      if (turmaIdForm && vinculo.turma?.id !== turmaIdForm) continue
      unicas.set(vinculo.disciplina.id, vinculo.disciplina.titulo)
    }
    return [...unicas.entries()].map(([value, label]) => ({ value, label }))
  }, [requisicaoVinculos.data, turmaIdForm])

  const quantidadeFiltrosAtivos = [turmaIdAplicado, disciplinaIdAplicado].filter(Boolean).length

  function buscarFiltros() {
    setTurmaIdAplicado(turmaIdForm)
    setDisciplinaIdAplicado(disciplinaIdForm)
    setModalFiltrosAberto(false)
  }

  function limparFiltros() {
    setTurmaIdForm(null)
    setDisciplinaIdForm(null)
    setTurmaIdAplicado(null)
    setDisciplinaIdAplicado(null)
  }

  const desempenhosTotais = useMemo(
    () =>
      agruparPorSimulado(requisicaoTentativas.data ?? []).sort((a, b) => {
        // Mais recente primeiro; sem data, o item fica no fim.
        if (!a.data && !b.data) return 0
        if (!a.data) return 1
        if (!b.data) return -1
        return new Date(b.data).getTime() - new Date(a.data).getTime()
      }),
    [requisicaoTentativas.data],
  )

  // O recorte só afeta os gráficos; os cards do topo somam tudo.
  const desempenhos = useMemo(
    () =>
      desempenhosTotais.filter(
        (item) =>
          (!turmaIdAplicado || item.turmaId === turmaIdAplicado) &&
          (!disciplinaIdAplicado || item.disciplinaId === disciplinaIdAplicado),
      ),
    [desempenhosTotais, turmaIdAplicado, disciplinaIdAplicado],
  )

  const rotuloTurmaAplicada = opcoesTurmasFiltro.find((opcao) => opcao.value === turmaIdAplicado)?.label
  const rotuloDisciplinaAplicada = opcoesDisciplinasFiltro.find(
    (opcao) => opcao.value === disciplinaIdAplicado,
  )?.label
  const contextoTextoPeriodo = [
    ...(rotuloTurmaAplicada ? [`Turma: ${rotuloTurmaAplicada}`] : []),
    ...(rotuloDisciplinaAplicada ? [`Disciplina: ${rotuloDisciplinaAplicada}`] : []),
  ]
  const contextoPeriodo = (
    <ListaInfo
      itens={contextoTextoPeriodo.map((texto) => ({ icon: <CalendarClock />, texto }))}
    />
  )

  const criticos = desempenhos.filter((item) => item.percentual < 50)

  // O card mostra só os 4 mais recentes; a lista completa fica no detalhamento.
  const desempenhosRecentes = desempenhos.slice(0, 4)

  const notasGeraisPercentuais = useMemo(() => {
    const idsNoRecorte = new Set(desempenhos.map((item) => item.simuladoId))
    return (requisicaoTentativas.data ?? [])
      .filter((tentativa) => idsNoRecorte.has(tentativa.simuladoId))
      .map((tentativa) => tentativa.percentual)
  }, [desempenhos, requisicaoTentativas.data])

  // Valores exatos do histograma, exportados junto com o gráfico no PDF e no Excel.
  const tabelaDistribuicaoGeral = useMemo(
    () =>
      calcularFaixasHistograma(notasGeraisPercentuais).map((faixa) => ({
        chave: faixa.rotulo,
        rotulo: faixa.rotulo,
        valor: String(faixa.quantidade),
      })),
    [notasGeraisPercentuais],
  )

  const desempenhoPorDisciplina = useMemo(() => mediaPorDisciplina(desempenhos), [desempenhos])
  const tendenciaPorDisciplina = useMemo(() => calcularTendencia(desempenhos), [desempenhos])

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

  // Cards do topo: sempre o total geral, independente do filtro dos gráficos.
  const totalTentativasConcluidas = requisicaoTentativas.data?.length ?? 0
  const totalAlunosAvaliados = useMemo(
    () => new Set((requisicaoTentativas.data ?? []).map((tentativa) => tentativa.alunoId)).size,
    [requisicaoTentativas.data],
  )
  const totalDisciplinasAvaliadas = useMemo(
    () => new Set(desempenhosTotais.map((item) => item.disciplina)).size,
    [desempenhosTotais],
  )

  // Exporta todas as seções num arquivo só: uma aba por seção no Excel, uma
  // tabela por seção no PDF.
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

  // Casa o desenho de cada gráfico com a seção de mesmo título do relatório.
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

  const loading = requisicaoTentativas.loading
  const error = requisicaoTentativas.error

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
          <>
            <Button
              size="large"
              variant="primary"
              icon={<Filter />}
              onClick={() => {
                setTurmaIdForm(turmaIdAplicado)
                setDisciplinaIdForm(disciplinaIdAplicado)
                setModalFiltrosAberto(true)
              }}
            >
              Filtrar{quantidadeFiltrosAtivos > 0 ? ` (${quantidadeFiltrosAtivos})` : ''}
            </Button>
          </>
        }
      />

      <Modal
        aberto={modalFiltrosAberto}
        onClose={() => setModalFiltrosAberto(false)}
        titulo="Filtros"
        descricao="Turma e disciplina consideradas nos gráficos."
        largura="420px"
        rodape={
          <>
            {quantidadeFiltrosAtivos > 0 && (
              <Button variant="subtle" icon={<X />} onClick={limparFiltros}>
                Limpar filtros
              </Button>
            )}
            <Button icon={<Search />} onClick={buscarFiltros}>
              Buscar
            </Button>
          </>
        }
      >
        <Stack gap="md">
          <Select
            label="Turma"
            placeholder="Todas as turmas"
            options={opcoesTurmasFiltro}
            value={turmaIdForm}
            clearable
            loading={requisicaoVinculos.loading}
            emptyText="Você não leciona em nenhuma turma"
            onChange={(valor) => {
              setTurmaIdForm(valor)
              setDisciplinaIdForm(null)
            }}
          />

          <Select
            label="Disciplina"
            placeholder="Todas as disciplinas"
            options={opcoesDisciplinasFiltro}
            value={disciplinaIdForm}
            clearable
            disabled={!turmaIdForm}
            emptyText="Selecione uma turma primeiro"
            onChange={setDisciplinaIdForm}
          />
        </Stack>
      </Modal>

      <GradeAutoAjuste $larguraMinima="220px">
        <InfoCard
          value={desempenhosTotais.length}
          label="simulados aplicados"
          icon={<ClipboardCheck />}
          tom="purple"
        />
        <InfoCard
          value={totalTentativasConcluidas}
          label="tentativas concluídas"
          icon={<CheckCircle2 />}
          tom="blue"
        />
        <InfoCard value={totalAlunosAvaliados} label="alunos avaliados" icon={<Users />} tom="success" />
        <InfoCard
          value={totalDisciplinasAvaliadas}
          label="disciplinas avaliadas"
          icon={<BookOpen />}
          tom="orange"
        />
      </GradeAutoAjuste>

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
              Detalhar
            </Button>
          }
        >
          <GradeAutoAjuste $larguraMinima="280px" $espaco="xl">
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
          </GradeAutoAjuste>
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
              Detalhar
            </Button>
          }
        >
          <GradeAutoAjuste $larguraMinima="280px" $espaco="xl">
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
          </GradeAutoAjuste>
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
            Detalhar
          </Button>
        }
      >
        {loading ? (
          <Skeleton $altura="140px" $raio="8px" />
        ) : error ? (
          <ErroCarregamento mensagem={error} onRetry={requisicaoTentativas.reload} />
        ) : desempenhos.length === 0 ? (
          <EstadoVazio
            titulo={
              desempenhosTotais.length > 0
                ? 'Nenhum simulado encontrado com esses filtros'
                : 'Ainda não há simulados concluídos'
            }
            descricao={
              desempenhosTotais.length > 0
                ? 'Ajuste ou limpe os filtros de turma/disciplina.'
                : 'Assim que os alunos finalizarem os primeiros simulados, o desempenho aparece aqui.'
            }
            icon={<TrendingUp />}
            acao={
              desempenhosTotais.length > 0 ? (
                <Button variant="secondary" onClick={limparFiltros}>
                  Limpar filtros
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
          (tentativa) => tentativa.simuladoId === simuladoDetalhado?.simuladoId,
        )}
        data={simuladoDetalhado?.data}
        tipoDestinacao={simuladoDetalhado?.tipoDestinacao}
      />
    </Layout>
  )
}
