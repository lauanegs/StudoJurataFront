import { useMemo, type ReactNode } from 'react'
import styled from 'styled-components'
import { BookOpen, CalendarClock, Printer, Target, User, Users } from 'lucide-react'

import { AlertaDesempenhoCard } from '../../../components/ui/AlertaDesempenhoCard'
import { Button } from '../../../components/ui/Button'
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
import { formatarData, formatarPorcentagem } from '../../../utils/format'
import { imprimirRelatorio } from '../../../utils/imprimir'
import { ROTULO_DESTINACAO } from '../../../utils/labels'
import type { SimuladoAlunoResponse, TipoDestinacaoSimulado } from '../../../types'

/** Limiar da tese: turma com essa % de alunos abaixo dessa nota pede reforço manual do professor. */
export const LIMIAR_DESEMPENHO = 60

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`

/* Divisor entre seções (mesmo padrão do cabeçalho do Card: borda de 1px na
   cor neutra) — sem isso, "Distribuição de notas", "Alunos abaixo de X%" e
   "Desempenho por questão" ficavam grudadas, sem nenhuma quebra visual. */
const Secao = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  & + & {
    padding-top: ${({ theme }) => theme.spacing.lg};
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }
`

const TituloSecao = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textStrong};
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

/* Só existe pro relatório impresso — o próprio Modal já mostra título e
   ficha de contexto na tela (bug real: o seletor `.area-impressao &` casava
   sempre, já que este elemento está sempre dentro de uma div com essa
   classe, então ficava duplicado na tela também). Escopado a @media print,
   igual à regra de impressão em styles/global.ts. */
const CabecalhoImpressao = styled.div`
  display: none;

  @media print {
    body.imprimindo-relatorio & {
      display: block;
      margin-bottom: ${({ theme }) => theme.spacing.md};
    }
  }
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
  /** Resumo do recorte de turma/disciplina/aluno/período aplicado na tela (ResumoFiltrosDesempenho) — só quando o modal é aberto a partir de uma tela com esses filtros. */
  resumoFiltros?: ReactNode
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
  resumoFiltros,
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

  const resumoImpressao = itensContextoValidos.map((item) => item.texto).join(' · ')

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

  return (
    <Modal
      aberto={aberto}
      onClose={onClose}
      titulo={titulo}
      largura="720px"
      rodape={
        <Button variant="secondary" icon={<Printer />} onClick={imprimirRelatorio}>
          Imprimir relatório
        </Button>
      }
    >
      <div className="area-impressao">
        <CabecalhoImpressao>
          <strong>{titulo}</strong>
          <div>{resumoImpressao}</div>
        </CabecalhoImpressao>

        {resumoFiltros && <EnvolveContexto>{resumoFiltros}</EnvolveContexto>}

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

            <Secao>
              <TituloSecao>
                {alunoFiltrado ? `Notas de ${alunoFiltrado} neste simulado` : 'Distribuição de notas da turma'}
              </TituloSecao>
              <Histograma valores={notasPercentuais} rotuloAcessivel={`Distribuição de notas de ${titulo}`} />
            </Secao>

            {!alunoFiltrado && (
              <Secao>
                <TituloSecao>
                  Alunos abaixo de {LIMIAR_DESEMPENHO}% ({alunosAbaixoDoLimiar.length})
                </TituloSecao>
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
              </Secao>
            )}

            <Secao>
              <TituloSecao>
                Desempenho por questão{alunoFiltrado ? ` — ${alunoFiltrado}` : ''}
              </TituloSecao>
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
            </Secao>
          </Coluna>
        )}
      </div>
    </Modal>
  )
}
