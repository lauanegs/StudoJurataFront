import { useMemo, type ReactNode } from 'react'
import styled from 'styled-components'
import { BookOpen, CalendarClock, FileDown, FileSpreadsheet, Target, User, Users } from 'lucide-react'

import { AlertaDesempenhoCard } from '../../../components/ui/AlertaDesempenhoCard'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Histograma } from '../../../components/ui/Histograma'
import { ListaInfo } from '../../../components/ui/ListaInfo'
import { Modal } from '../../../components/ui/Modal'
import { Tag } from '../../../components/ui/Tag'
import { EstadoVazio } from '../../../components/feedback/EstadoVazio'
import { Skeleton } from '../../../components/feedback/Skeleton'
import { useRequisicao } from '../../../hooks/useRequisicao'
import {
  alunos as servicoAlunos,
  questaoAlunos,
  questoes as servicoQuestoes,
  simuladoQuestoes,
} from '../../../services/endpoints'
import { calcularFaixasHistograma } from '../../../utils/desempenho'
import { exportarExcelAbas } from '../../../utils/exportarPlanilha'
import { exportarPdf } from '../../../utils/exportarPdf'
import { formatarData, formatarPorcentagem } from '../../../utils/format'
import { renderizarGraficoComoImagem } from '../../../utils/renderizarGrafico'
import { ROTULO_DESTINACAO } from '../../../utils/labels'
import type { SimuladoAlunoResponse, TipoDestinacaoSimulado } from '../../../types'

/** Limiar da tese: turma com essa % de alunos abaixo dessa nota pede reforço manual do professor. */
export const LIMIAR_DESEMPENHO = 60

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`

/* Espaço entre o campo inicial (ListaInfo, componente compartilhado) e o
   resto do conteúdo — ListaInfo em si não tem margem própria, cada tela que
   a usa define o espaçamento conforme o próprio layout. */
const EnvolveContexto = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const TabelaQuestoes = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    text-align: left;
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  th {
    color: ${({ theme }) => theme.colors.textTertiary};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
  }

  td {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`

const ListaAlunos = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
`

const LinhaAluno = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.background};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
`

interface DetalheSimuladoModalProps {
  aberto: boolean
  onClose: () => void
  simuladoId: number | null
  titulo: string
  turma: string
  disciplina: string
  notaMaxima: number
  tentativas: SimuladoAlunoResponse[]
  /** dataInicio do simulado, com createdAt como reserva — exibida como "Aplicado em". */
  data?: string
  tipoDestinacao?: TipoDestinacaoSimulado
  /** Nome do aluno, quando o detalhamento foi aberto com um filtro de aluno aplicado (tela "Desempenho por simulado"). */
  alunoFiltrado?: string
}

/**
 * Detalhamento de um simulado, aberto ao clicar no DesempenhoCard: histograma
 * de notas, alunos abaixo do limiar (o gatilho da tese pra reforço manual do
 * professor — não IA) e desempenho por questão. Some dado é buscado só
 * quando o modal abre (não no Dashboard inteiro), pra não pesar a tela que
 * lista todos os simulados só por causa do detalhamento de um.
 *
 * Com `alunoFiltrado` definido, `tentativas` já vem filtrada só daquele
 * aluno (ver DesempenhoSimulados.tsx) — todo o conteúdo abaixo reflete isso
 * automaticamente, mas os textos/alertas mudam de "turma" pra "aluno" pra
 * não sugerir uma estatística de turma sobre o dado de uma pessoa só.
 *
 * Exportar PDF/Excel gera os TRÊS blocos de dados da tela (distribuição de
 * notas, alunos abaixo do limiar e desempenho por questão) — não só o
 * histograma — cada um vira uma seção/aba própria.
 */
export function DetalheSimuladoModal({
  aberto,
  onClose,
  simuladoId,
  titulo,
  turma,
  disciplina,
  notaMaxima,
  tentativas,
  data,
  tipoDestinacao,
  alunoFiltrado,
}: DetalheSimuladoModalProps) {
  const requisicaoAlunos = useRequisicao(() => servicoAlunos.listar(), [], { ativo: aberto })
  const requisicaoQuestoes = useRequisicao(() => servicoQuestoes.listar(), [], { ativo: aberto })
  const requisicaoVinculos = useRequisicao(() => simuladoQuestoes.listar(), [], { ativo: aberto })
  const requisicaoRespostas = useRequisicao(() => questaoAlunos.listar(), [], { ativo: aberto })

  const carregando =
    requisicaoAlunos.loading ||
    requisicaoQuestoes.loading ||
    requisicaoVinculos.loading ||
    requisicaoRespostas.loading

  const notasPercentuais = useMemo(
    () =>
      tentativas
        .filter((tentativa) => typeof tentativa.nota === 'number')
        .map((tentativa) => Math.min(100, ((tentativa.nota as number) / notaMaxima) * 100)),
    [tentativas, notaMaxima],
  )

  const alunosAbaixoDoLimiar = useMemo(() => {
    const mapaAlunos = new Map((requisicaoAlunos.data ?? []).map((aluno) => [aluno.id, aluno]))

    return tentativas
      .filter((tentativa) => typeof tentativa.nota === 'number')
      .map((tentativa) => ({
        tentativa,
        percentual: Math.min(100, ((tentativa.nota as number) / notaMaxima) * 100),
        nome: mapaAlunos.get(tentativa.alunoId)?.pessoa?.nome ?? `Aluno ${tentativa.alunoId}`,
      }))
      .filter((item) => item.percentual < LIMIAR_DESEMPENHO)
      .sort((a, b) => a.percentual - b.percentual)
  }, [tentativas, notaMaxima, requisicaoAlunos.data])

  // Valores exatos de cada bloco da tela — a mesma base usada pra desenhar
  // os gráficos/listas vira as seções/abas exportadas (PDF e Excel).
  const tabelaDistribuicao = useMemo(
    () =>
      calcularFaixasHistograma(notasPercentuais).map((faixa) => ({
        chave: faixa.rotulo,
        rotulo: faixa.rotulo,
        valor: String(faixa.quantidade),
      })),
    [notasPercentuais],
  )

  const tabelaAlunosAbaixo = useMemo(
    () =>
      alunosAbaixoDoLimiar.map((item) => ({
        chave: String(item.tentativa.id),
        rotulo: item.nome,
        valor: formatarPorcentagem(item.percentual),
      })),
    [alunosAbaixoDoLimiar],
  )

  const percentualTurmaAbaixo =
    notasPercentuais.length > 0 ? (alunosAbaixoDoLimiar.length / notasPercentuais.length) * 100 : 0

  // Regra da tese: turma com >= 60% dos alunos abaixo de 60% pede reforço
  // MANUAL do professor — a IA fica reservada pra casos individuais. Com um
  // aluno filtrado, essa estatística de turma não faz sentido: o que importa
  // ali é só a média do próprio aluno (mediaAluno), comparada ao mesmo
  // limiar — mas como candidato a reforço INDIVIDUAL (motivo
  // BAIXO_APROVEITAMENTO do RecomendacaoService), não manual.
  const pedeReforcoManual = percentualTurmaAbaixo >= LIMIAR_DESEMPENHO

  const mediaAluno =
    notasPercentuais.length > 0 ? notasPercentuais.reduce((soma, valor) => soma + valor, 0) / notasPercentuais.length : 0
  const alunoAbaixoDoLimiar = mediaAluno < LIMIAR_DESEMPENHO

  // Campo inicial do modal — turma, disciplina, data, destinação e, quando
  // houver, o aluno filtrado. Cada linha descreve um dado diferente, no
  // mesmo padrão ícone + texto do subtítulo do Header (SubtituloItem).
  const rotuloDestinacao = tipoDestinacao
    ? tipoDestinacao === 'ESPECIFICO'
      ? `${ROTULO_DESTINACAO[tipoDestinacao]} (${tentativas.length})`
      : ROTULO_DESTINACAO[tipoDestinacao]
    : null

  const itensContexto: Array<{ icon: ReactNode; texto: string } | null> = [
    { icon: <Users />, texto: `Turma: ${turma}` },
    { icon: <BookOpen />, texto: `Disciplina: ${disciplina}` },
    data ? { icon: <CalendarClock />, texto: `Aplicado em ${formatarData(data)}` } : null,
    rotuloDestinacao ? { icon: <Target />, texto: `Destinação: ${rotuloDestinacao}` } : null,
    alunoFiltrado
      ? { icon: <User />, texto: `Filtrado por aluno: ${alunoFiltrado} — dados abaixo são só dele(a)` }
      : null,
  ]
  const itensContextoValidos = itensContexto.filter((item): item is { icon: ReactNode; texto: string } => item !== null)
  const contextoTexto = itensContextoValidos.map((item) => item.texto)

  const desempenhoPorQuestao = useMemo(() => {
    if (!simuladoId) return []

    const idsTentativas = new Set(tentativas.map((tentativa) => tentativa.id))
    const mapaQuestoes = new Map((requisicaoQuestoes.data ?? []).map((questao) => [questao.id, questao]))

    return (requisicaoVinculos.data ?? [])
      .filter((vinculo) => vinculo.simuladoId === simuladoId && vinculo.status !== 'REMOVIDA')
      .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
      .map((vinculo) => {
        const respostas = (requisicaoRespostas.data ?? []).filter(
          (resposta) => resposta.questaoId === vinculo.questaoId && idsTentativas.has(resposta.simuladoAlunoId),
        )
        const acertos = respostas.filter((resposta) => resposta.acertou).length

        return {
          questaoId: vinculo.questaoId,
          enunciado: mapaQuestoes.get(vinculo.questaoId)?.enunciado ?? `Questão ${vinculo.questaoId}`,
          percentualAcerto: respostas.length > 0 ? (acertos / respostas.length) * 100 : null,
          respondida: respostas.length,
        }
      })
  }, [simuladoId, tentativas, requisicaoQuestoes.data, requisicaoVinculos.data, requisicaoRespostas.data])

  const tabelaQuestoes = useMemo(
    () =>
      desempenhoPorQuestao.map((item, indice) => ({
        chave: String(item.questaoId),
        rotulo: `Questão ${indice + 1} — ${item.enunciado}`,
        valor: item.percentualAcerto === null ? '—' : formatarPorcentagem(item.percentualAcerto),
      })),
    [desempenhoPorQuestao],
  )

  // As mesmas 3 seções da tela (histograma / alunos abaixo / por questão) —
  // "alunos abaixo" só entra quando não há um aluno já filtrado (a lista de
  // 1 nome não faz sentido nesse caso, mesma regra da tela).
  // Só o histograma (Distribuição de notas) tem um desenho pra capturar —
  // "Alunos abaixo" e "Desempenho por questão" são listas/tabelas na tela,
  // sem gráfico correspondente.
  const capturarImagemHistograma = () =>
    renderizarGraficoComoImagem(
      <Histograma valores={notasPercentuais} rotuloAcessivel={`Distribuição de notas de ${titulo}`} />,
      640,
      280,
    )

  const secoesRelatorio = [
    { titulo: 'Distribuição de notas', colunaRotulo: 'Faixa de nota', colunaValor: 'Quantidade', linhas: tabelaDistribuicao },
    ...(!alunoFiltrado
      ? [
          {
            titulo: `Alunos abaixo de ${LIMIAR_DESEMPENHO}%`,
            colunaRotulo: 'Aluno',
            colunaValor: 'Nota',
            linhas: tabelaAlunosAbaixo,
          },
        ]
      : []),
    { titulo: 'Desempenho por questão', colunaRotulo: 'Questão', colunaValor: '% de acerto', linhas: tabelaQuestoes },
  ]

  return (
    <Modal
      aberto={aberto}
      onClose={onClose}
      titulo={titulo}
      largura="720px"
      rodape={
        <>
          <Button
            variant="secondary"
            icon={<FileSpreadsheet />}
            onClick={async () => {
              const imagem = await capturarImagemHistograma()
              exportarExcelAbas(
                titulo,
                secoesRelatorio.map((secao, indice) => ({ nome: secao.titulo, ...secao, imagem: indice === 0 ? imagem : null })),
              )
            }}
          >
            Exportar Excel
          </Button>
          <Button
            variant="secondary"
            icon={<FileDown />}
            onClick={async () => {
              const imagem = await capturarImagemHistograma()
              exportarPdf(
                titulo,
                titulo,
                contextoTexto,
                secoesRelatorio.map((secao, indice) => ({ ...secao, imagem: indice === 0 ? imagem : null })),
              )
            }}
          >
            Baixar PDF
          </Button>
        </>
      }
    >
      <EnvolveContexto>
        <ListaInfo itens={itensContextoValidos} />
      </EnvolveContexto>

      {carregando ? (
        <Coluna>
          <Skeleton $altura="160px" $raio="8px" />
          <Skeleton $altura="120px" $raio="8px" />
        </Coluna>
      ) : notasPercentuais.length === 0 ? (
        <EstadoVazio
          titulo="Sem tentativas concluídas"
          descricao="Assim que os alunos finalizarem este simulado, o detalhamento aparece aqui."
          icon={<Users />}
        />
      ) : (
        <Coluna>
          {alunoFiltrado ? (
            <AlertaDesempenhoCard
              tom={alunoAbaixoDoLimiar ? 'warning' : 'success'}
              titulo={`Aproveitamento de ${formatarPorcentagem(mediaAluno)} — ${
                alunoAbaixoDoLimiar ? 'abaixo do esperado' : 'dentro do esperado'
              }`}
              descricao={
                alunoAbaixoDoLimiar
                  ? `${alunoFiltrado} está abaixo de ${LIMIAR_DESEMPENHO}% neste simulado — candidato a reforço individual (a IA pode gerar automaticamente, pela regra de baixo aproveitamento).`
                  : `${alunoFiltrado} está dentro do esperado neste simulado — sem gatilho de reforço.`
              }
            />
          ) : pedeReforcoManual ? (
            <AlertaDesempenhoCard
              titulo={`${formatarPorcentagem(percentualTurmaAbaixo)} da turma abaixo de ${LIMIAR_DESEMPENHO}%`}
              descricao="Pela regra de acompanhamento, isso pede um reforço lançado manualmente pelo professor — a IA fica reservada a casos individuais."
            />
          ) : (
            <AlertaDesempenhoCard
              tom="success"
              titulo={`Só ${formatarPorcentagem(percentualTurmaAbaixo)} da turma abaixo de ${LIMIAR_DESEMPENHO}%`}
              descricao="Dentro do esperado — sem gatilho de reforço geral pra esta turma."
            />
          )}

          <Card
            elevacao="none"
            titulo={alunoFiltrado ? `Notas de ${alunoFiltrado} neste simulado` : 'Distribuição de notas da turma'}
          >
            <Histograma valores={notasPercentuais} rotuloAcessivel={`Distribuição de notas de ${titulo}`} />
          </Card>

          {!alunoFiltrado && (
            <Card
              elevacao="none"
              titulo={`Alunos abaixo de ${LIMIAR_DESEMPENHO}% (${alunosAbaixoDoLimiar.length})`}
            >
              {alunosAbaixoDoLimiar.length === 0 ? (
                <EstadoVazio titulo="Ninguém abaixo do limiar" descricao="Todos os alunos foram bem neste simulado." />
              ) : (
                <ListaAlunos>
                  {alunosAbaixoDoLimiar.map((item) => (
                    <LinhaAluno key={item.tentativa.id}>
                      <span>{item.nome}</span>
                      <Tag variant="error">
                        {formatarPorcentagem(item.percentual)}
                      </Tag>
                    </LinhaAluno>
                  ))}
                </ListaAlunos>
              )}
            </Card>
          )}

          <Card elevacao="none" titulo={`Desempenho por questão${alunoFiltrado ? ` — ${alunoFiltrado}` : ''}`}>
            <TabelaQuestoes>
              <thead>
                <tr>
                  <th>Questão</th>
                  <th>% de acerto</th>
                </tr>
              </thead>
              <tbody>
                {desempenhoPorQuestao.map((item, indice) => (
                  <tr key={item.questaoId}>
                    <td>
                      Questão {indice + 1} — {item.enunciado}
                    </td>
                    <td>
                      {item.percentualAcerto === null ? (
                        '—'
                      ) : (
                        <Tag
                          variant={
                            item.percentualAcerto < 40 ? 'error' : item.percentualAcerto < 70 ? 'warning' : 'success'
                          }
                        >
                          {formatarPorcentagem(item.percentualAcerto)}
                        </Tag>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </TabelaQuestoes>
          </Card>
        </Coluna>
      )}
    </Modal>
  )
}
