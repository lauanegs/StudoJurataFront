import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { CheckCheck, ListTree, Save, UserX, Users } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { CheckBox } from '../../../components/ui/CheckBox'
import { Chip } from '../../../components/ui/Chip'
import { DataTable } from '../../../components/ui/DataTable'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Header } from '../../../components/ui/Header'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { Select } from '../../../components/ui/Select'
import { Tab } from '../../../components/ui/Tab'
import { TextArea } from '../../../components/ui/TextArea'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { EstadoVazio } from '../../../components/feedback/EstadoVazio'
import { useToast } from '../../../contexts/toastContexto'
import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import {
  aulas as servicoAulas,
  conteudosPlano,
  frequencias as servicoFrequencias,
  matriculas,
  planosAula,
  professores as servicoProfessores,
  turmas as servicoTurmas,
} from '../../../services/endpoints'
import { formatarCargaHoraria } from '../../../utils/format'
import { theme as tokens } from '../../../styles/theme'
import type { AlunoTurma } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

type Aba = 'chamada' | 'conteudo'

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

/* Confirmado no Figma: data, disciplina e o botão salvar ficam juntos,
   nessa ordem, dentro do próprio cartão do Header — não em um Card separado.
   width:fit-content pra encolher em volta dos 3 campos (que não devem
   esticar), em vez de herdar o width:100% que o slot de filtros do Header
   normalmente estica pra grids de filtro que preenchem o espaço disponível. */
const CamposCabecalho = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  width: fit-content;
  max-width: 100%;
  overflow-x: auto;
`

/* Largura fixa e concreta pra cada campo — o <Field> por baixo do
   Input/Select/DatePicker pede width:100% do pai pra preencher célula de
   grid de formulário; só max-width no campo (auto-width no pai) não é
   suficiente pra essa cadeia resolver de forma confiável (o pai encolhia
   demais em vez de assumir a largura máxima do filho). Um pai com largura
   já definida elimina essa ambiguidade. */
const CampoLargura = styled.div<{ $largura: string }>`
  width: ${({ $largura }) => $largura};
`

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`

/* Botões "flutuantes" acima da tabela — soltos no fundo cinza da página,
   fora do cartão branco da tabela, não dentro do header dela. */
const BotoesFlutuantes = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.xs};
`

const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

interface LinhaChamada {
  alunoId: number
  nome: string
  presente: boolean
  cargaHorariaAtingida: number
}

/**
 * Entrada rápida de "Registrar aula" a partir de Turmas: o professor escolhe
 * data + disciplina (uma turma pode ter mais de uma disciplina/professor) e
 * a tela reconcilia automaticamente com o plano de aula daquela
 * turma+disciplina — acha a aula já publicada nesta data ou a próxima
 * pendente no plano sozinha, sem exigir que o professor procure por ela.
 * O select "Selecionar aula do plano de aula" (aba Registrar conteúdo)
 * deixa o professor confirmar ou trocar essa escolha; sem nenhuma aula
 * disponível no plano, os campos abaixo dele criam uma manualmente.
 *
 * Distinta de `PlanoAula/RegistrarAula.tsx`, que edita uma aula já
 * conhecida (chegando pela lista de Aulas de um Plano de Aula específico).
 */
export default function RegistrarAulaTurma() {
  const { turmaId } = useParams()
  const toast = useToast()
  const { professorId } = useProfessorLogado()

  const idTurma = Number(turmaId)

  const [aba, setAba] = useState<Aba>('chamada')
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10))
  const [turmaDisciplinaId, setTurmaDisciplinaId] = useState<number | null>(null)
  const [aulaSelecionadaManualId, setAulaSelecionadaManualId] = useState<number | null>(null)
  const [quantidadeHorarios, setQuantidadeHorarios] = useState('')
  const [dataPrevista, setDataPrevista] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [edicoesChamada, setEdicoesChamada] = useState<Record<number, boolean>>({})
  const [modalConteudoAberto, setModalConteudoAberto] = useState(false)
  const [conteudosSelecionados, setConteudosSelecionados] = useState<Set<number>>(new Set())

  const requisicaoTurma = useRequisicao(() => servicoTurmas.buscar(idTurma), [idTurma])

  const requisicaoVinculos = useRequisicao(
    () => servicoProfessores.turmasLecionadas(professorId as number),
    [professorId],
    { ativo: Boolean(professorId) },
  )

  const disciplinasDaTurma = useMemo(
    () =>
      (requisicaoVinculos.data ?? [])
        .filter((vinculo) => vinculo.turma?.id === idTurma && vinculo.status !== 'INATIVO')
        .map((vinculo) => ({ value: vinculo.id, label: vinculo.disciplina?.titulo ?? '—' })),
    [requisicaoVinculos.data, idTurma],
  )

  // Só a primeira disciplina lecionada nessa turma vem pré-selecionada — nunca decidir por conta própria quando há mais de uma.
  const disciplinaAtiva = turmaDisciplinaId ?? disciplinasDaTurma[0]?.value ?? null

  const requisicaoPlanos = useRequisicao(
    () => planosAula.listarPorTurmaDisciplina(disciplinaAtiva as number),
    [disciplinaAtiva],
    { ativo: Boolean(disciplinaAtiva) },
  )

  // Regra de negócio já assumida em TurmaDetalhada: 1 plano de aula ativo por turma+disciplina.
  const planoAtual = (requisicaoPlanos.data ?? [])[0] ?? null

  const requisicaoAulasPlano = useRequisicao(
    () => servicoAulas.listarPorPlanoAula(planoAtual?.id as number),
    [planoAtual?.id],
    { ativo: Boolean(planoAtual) },
  )

  const aulasDoPlano = useMemo(() => requisicaoAulasPlano.data ?? [], [requisicaoAulasPlano.data])

  // Reconciliação automática com o plano de aula: acha sozinha a aula certa
  // pra esta sessão, sem depender de o professor abrir a aba de conteúdo —
  // a já publicada nesta data (edição) ou a próxima pendente, por ordem.
  const aulaSugerida = useMemo(() => {
    const aulaHoje = aulasDoPlano.find((aula) => aula.dataPublicacao?.slice(0, 10) === data)
    if (aulaHoje) return aulaHoje

    return (
      [...aulasDoPlano]
        .filter((aula) => !aula.dataPublicacao && aula.status !== 'INATIVO')
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))[0] ?? null
    )
  }, [aulasDoPlano, data])

  const aulaAlvo = aulaSelecionadaManualId
    ? (aulasDoPlano.find((aula) => aula.id === aulaSelecionadaManualId) ?? null)
    : aulaSugerida

  // Trocar a data ou a disciplina invalida a escolha manual anterior — a
  // reconciliação automática assume de novo a partir da nova aulaSugerida.
  useEffect(() => {
    setAulaSelecionadaManualId(null)
  }, [data, disciplinaAtiva])

  // Os campos de "criar/ajustar aula" seguem a aula-alvo atual (selecionada
  // ou sugerida) — trocando de aula, os campos atualizam junto.
  useEffect(() => {
    setQuantidadeHorarios(aulaAlvo?.cargaHoraria?.toString() ?? '')
    setDataPrevista(aulaAlvo?.dataPrevista?.slice(0, 10) ?? '')
    setObservacoes(aulaAlvo?.observacoes ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aulaAlvo?.id])

  const opcoesAulasPlano = useMemo(
    () =>
      [...aulasDoPlano]
        .filter((aula) => aula.status !== 'INATIVO')
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
        .map((aula) => ({
          value: aula.id,
          label: `${aula.ordem ? `Aula ${aula.ordem} — ` : ''}${aula.titulo ?? 'Sem título'}`,
          description: aula.dataPublicacao ? 'Já ministrada' : 'Planejada',
        })),
    [aulasDoPlano],
  )

  const requisicaoMatriculas = useRequisicao(() => matriculas.ativosPorTurma(idTurma), [idTurma])

  const requisicaoConteudosAula = useRequisicao(
    () => servicoAulas.listarConteudos(aulaAlvo?.id as number),
    [aulaAlvo?.id],
    { ativo: Boolean(aulaAlvo) },
  )

  const requisicaoConteudosPlano = useRequisicao(
    () => conteudosPlano.listar(),
    [],
    { ativo: modalConteudoAberto },
  )

  // Carga horária acumulada de cada aluno nesta disciplina — soma das aulas
  // ministradas (com data de publicação) em que ele foi marcado presente.
  const requisicaoCargaHoraria = useRequisicao(
    async () => {
      const alunos = requisicaoMatriculas.data ?? []
      if (!planoAtual) return new Map<number, number>()

      const listas = await Promise.all(
        alunos.map((matricula) => servicoFrequencias.listarPorAluno(matricula.aluno.id)),
      )

      return new Map(
        alunos.map((matricula, indice) => {
          const total = listas[indice]
            .filter((frequencia) => frequencia.presente && frequencia.aula?.planoAula?.id === planoAtual.id)
            .reduce((soma, frequencia) => soma + (frequencia.aula?.cargaHoraria ?? 0), 0)

          return [matricula.aluno.id, total]
        }),
      )
    },
    [requisicaoMatriculas.data, planoAtual?.id],
    { ativo: Boolean(planoAtual) && !requisicaoMatriculas.loading },
  )

  const linhasChamada = useMemo<LinhaChamada[]>(() => {
    const alunos = requisicaoMatriculas.data ?? []
    const cargaHoraria = requisicaoCargaHoraria.data ?? new Map<number, number>()

    return alunos.map((matricula: AlunoTurma) => ({
      alunoId: matricula.aluno.id,
      nome: matricula.aluno?.pessoa?.nome ?? `Aluno ${matricula.aluno.id}`,
      presente: edicoesChamada[matricula.aluno.id] ?? true,
      cargaHorariaAtingida: cargaHoraria.get(matricula.aluno.id) ?? 0,
    }))
  }, [requisicaoMatriculas.data, requisicaoCargaHoraria.data, edicoesChamada])

  const conteudosDisponiveis = useMemo(() => {
    if (!planoAtual) return []

    const vinculados = new Set((requisicaoConteudosAula.data ?? []).map((item) => item.conteudoPlano?.id))

    return (requisicaoConteudosPlano.data ?? [])
      .filter(
        (conteudo) =>
          conteudo.planoEnsino?.id === planoAtual.planoEnsino?.id &&
          conteudo.status !== 'INATIVO' &&
          !vinculados.has(conteudo.id),
      )
      .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
  }, [requisicaoConteudosPlano.data, requisicaoConteudosAula.data, planoAtual])

  const { executar: salvar, executando: salvando } = useAcao(async () => {
    if (!planoAtual) {
      toast.warning('Sem plano de aula', 'Esta disciplina ainda não tem um plano de aula nesta turma.')
      return
    }

    try {
      let idAula = aulaAlvo?.id

      if (idAula) {
        await servicoAulas.atualizar(idAula, {
          dataPublicacao: data,
          dataPrevista: dataPrevista || undefined,
          cargaHoraria: quantidadeHorarios ? Number(quantidadeHorarios) : undefined,
          observacoes: observacoes.trim() || undefined,
        })
      } else {
        if (!quantidadeHorarios) {
          toast.warning('Informe a quantidade de horários', 'Necessário para criar a aula desta data.')
          return
        }

        const novaAula = await servicoAulas.criar({
          planoAula: planoAtual,
          dataPrevista: dataPrevista || data,
          dataPublicacao: data,
          cargaHoraria: Number(quantidadeHorarios),
          observacoes: observacoes.trim() || undefined,
          status: 'ATIVO',
        })
        idAula = novaAula.id
      }

      await servicoAulas.registrarChamada(idAula, {
        alunos: linhasChamada.map((linha) => ({ alunoId: linha.alunoId, presente: linha.presente })),
      })

      toast.success('Aula registrada', 'Chamada e dados da aula salvos.')
      await requisicaoAulasPlano.reload()
    } catch (erroSalvar) {
      toast.error('Não foi possível salvar', erroSalvar instanceof ApiError ? erroSalvar.message : undefined)
    }
  })

  const { executar: vincularConteudos, executando: vinculando } = useAcao(async () => {
    if (!aulaAlvo || conteudosSelecionados.size === 0) return

    try {
      await Promise.all(
        [...conteudosSelecionados].map((conteudoId) => servicoAulas.vincularConteudo(aulaAlvo.id, conteudoId)),
      )
      toast.success('Conteúdo vinculado à aula')
      setConteudosSelecionados(new Set())
      setModalConteudoAberto(false)
      await requisicaoConteudosAula.reload()
    } catch (erroVincular) {
      toast.error('Não foi possível vincular', erroVincular instanceof ApiError ? erroVincular.message : undefined)
    }
  })

  async function desvincularConteudo(conteudoPlanoId: number) {
    if (!aulaAlvo) return

    try {
      await servicoAulas.desvincularConteudo(aulaAlvo.id, conteudoPlanoId)
      toast.success('Conteúdo removido da aula')
      await requisicaoConteudosAula.reload()
    } catch (erroRemover) {
      toast.error('Não foi possível remover', erroRemover instanceof ApiError ? erroRemover.message : undefined)
    }
  }

  function alternarConteudoSelecionado(id: number) {
    setConteudosSelecionados((atuais) => {
      const novos = new Set(atuais)
      if (novos.has(id)) novos.delete(id)
      else novos.add(id)
      return novos
    })
  }

  const colunasChamada: Coluna<LinhaChamada>[] = [
    {
      key: 'presente',
      cabecalho: 'Presente',
      largura: '27%',
      render: (linha) => (
        <CheckBox
          checked={linha.presente}
          aria-label={`Presença de ${linha.nome}`}
          onChange={(evento) =>
            setEdicoesChamada((atuais) => ({ ...atuais, [linha.alunoId]: evento.target.checked }))
          }
        />
      ),
    },
    { key: 'nome', cabecalho: 'Nome', render: (linha) => linha.nome },
    {
      key: 'cargaHoraria',
      cabecalho: 'Carga horária atingida',
      render: (linha) => formatarCargaHoraria(linha.cargaHorariaAtingida),
    },
  ]

  if (requisicaoTurma.error) {
    return (
      <Layout>
        <Header titulo="Registrar aula" voltarPara={`/professor/turmas/${idTurma}`} />
        <ErroCarregamento mensagem={requisicaoTurma.error} onRetry={requisicaoTurma.reload} />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo={requisicaoTurma.data?.titulo ?? 'Turma'}
        voltarPara={`/professor/turmas/${idTurma}`}
        rotuloVoltar="Voltar para a turma"
        filtros={
          <CamposCabecalho>
            <CampoLargura $largura="240px">
              <DatePicker
                label="Data de registro"
                value={data}
                onChange={(evento) => setData(evento.target.value)}
              />
            </CampoLargura>

            <CampoLargura $largura="408px">
              <Select
                label="Disciplina"
                options={disciplinasDaTurma}
                value={disciplinaAtiva}
                loading={requisicaoVinculos.loading}
                emptyText="Você não leciona disciplinas nesta turma"
                onChange={setTurmaDisciplinaId}
              />
            </CampoLargura>

            <Button size="large" icon={<Save />} loading={salvando} onClick={salvar}>
              Salvar
            </Button>
          </CamposCabecalho>
        }
      />

      <Tab<Aba>
        rotuloAcessivel="Seções do registro de aula"
        value={aba}
        onChange={setAba}
        options={[
          { value: 'chamada', label: 'Realizar chamada' },
          { value: 'conteudo', label: 'Registrar conteúdo' },
        ]}
      />

      {aba === 'chamada' && (
        <Coluna>
          <BotoesFlutuantes>
            <Button
              variant="subtle"
              size="small"
              icon={<CheckCheck />}
              onClick={() =>
                setEdicoesChamada(Object.fromEntries(linhasChamada.map((linha) => [linha.alunoId, true])))
              }
            >
              Marcar todos presentes
            </Button>
            <Button
              variant="subtle"
              size="small"
              icon={<UserX />}
              onClick={() =>
                setEdicoesChamada(Object.fromEntries(linhasChamada.map((linha) => [linha.alunoId, false])))
              }
            >
              Marcar todos ausentes
            </Button>
          </BotoesFlutuantes>

          <DataTable
            descricao="Chamada da aula"
            columns={colunasChamada}
            data={linhasChamada}
            rowKey={(linha) => linha.alunoId}
            loading={requisicaoMatriculas.loading}
            error={requisicaoMatriculas.error}
            onReload={requisicaoMatriculas.reload}
            empty={{
              titulo: 'Nenhum aluno com matrícula ativa',
              descricao: 'A secretaria precisa matricular alunos nesta turma antes da chamada.',
              icon: <Users />,
            }}
          />
        </Coluna>
      )}

      {aba === 'conteudo' && (
        <Card titulo="Conteúdos trabalhados nesta aula">
          <Coluna>
            <Select
              label="Selecionar aula do plano de aula"
              options={opcoesAulasPlano}
              value={aulaAlvo?.id ?? null}
              clearable
              loading={requisicaoAulasPlano.loading}
              emptyText="Este plano de aula ainda não tem aulas cadastradas"
              hint="Conciliada automaticamente com a data e a disciplina escolhidas no topo — troque se não for a aula certa."
              onChange={(valor) => setAulaSelecionadaManualId(valor)}
            />

            <Grade>
              <Input
                label="Quantidade de horários"
                type="number"
                min={1}
                value={quantidadeHorarios}
                onChange={(evento) => setQuantidadeHorarios(evento.target.value)}
              />
              <DatePicker
                label="Data prevista"
                value={dataPrevista}
                onChange={(evento) => setDataPrevista(evento.target.value)}
              />
              <DatePicker label="Data publicação" value={data} disabled hint="Vem da data escolhida no topo." />
            </Grade>

            <div>
              <Button
                icon={<ListTree />}
                disabled={!aulaAlvo}
                onClick={() => setModalConteudoAberto(true)}
              >
                Vincular conteúdo do plano de ensino
              </Button>
              {!aulaAlvo && (
                <div style={{ fontSize: '12px', color: tokens.colors.textTertiary, marginTop: '4px' }}>
                  Salve a aula antes de vincular conteúdos.
                </div>
              )}
            </div>

            {requisicaoConteudosAula.isEmpty ? (
              <EstadoVazio
                titulo="Nenhum conteúdo registrado"
                descricao="Registrar o conteúdo alimenta o histórico do aluno e a repetição espaçada da IA."
                icon={<ListTree />}
              />
            ) : (
              <Chips>
                {(requisicaoConteudosAula.data ?? []).map((vinculo) => (
                  <Chip
                    key={vinculo.id}
                    variant="neutral"
                    onRemove={() => desvincularConteudo(vinculo.conteudoPlano.id)}
                    rotuloRemover={`Remover ${vinculo.conteudoPlano?.titulo}`}
                  >
                    {vinculo.conteudoPlano?.titulo ?? 'Conteúdo'}
                  </Chip>
                ))}
              </Chips>
            )}

            <TextArea
              label="Observações"
              placeholder="Materiais necessários, combinados com a turma, adaptações..."
              value={observacoes}
              maxLength={2000}
              rows={4}
              autoAltura
              onChange={(evento) => setObservacoes(evento.target.value)}
            />
          </Coluna>
        </Card>
      )}

      <Modal
        aberto={modalConteudoAberto}
        onClose={() => setModalConteudoAberto(false)}
        titulo="Vincular conteúdo"
        descricao="Selecione um ou mais conteúdos do plano de ensino para vincular a esta aula."
        largura="600px"
        rodape={
          <>
            <Button variant="secondary" onClick={() => setModalConteudoAberto(false)}>
              Cancelar
            </Button>
            <Button
              loading={vinculando}
              disabled={conteudosSelecionados.size === 0}
              onClick={vincularConteudos}
            >
              Salvar
            </Button>
          </>
        }
      >
        {requisicaoConteudosPlano.isEmpty ? (
          <EstadoVazio
            titulo="Nenhum conteúdo disponível"
            descricao="Todos os conteúdos do plano de ensino já foram vinculados a esta aula."
            icon={<ListTree />}
          />
        ) : (
          <Coluna>
            {conteudosDisponiveis.map((conteudo) => (
              <CheckBox
                key={conteudo.id}
                label={`${conteudo.ordem ? `${conteudo.ordem}. ` : ''}${conteudo.titulo ?? 'Conteúdo'}`}
                checked={conteudosSelecionados.has(conteudo.id)}
                onChange={() => alternarConteudoSelecionado(conteudo.id)}
              />
            ))}
          </Coluna>
        )}
      </Modal>
    </Layout>
  )
}
