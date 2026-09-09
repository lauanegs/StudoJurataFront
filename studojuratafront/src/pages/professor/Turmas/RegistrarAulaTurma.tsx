import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import { CheckCheck, ListTree, Plus, Save, UserX, Users } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { CheckBox } from '../../../components/ui/CheckBox'
import { DataTable } from '../../../components/ui/DataTable'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Header } from '../../../components/ui/Header'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Tab } from '../../../components/ui/Tab'
import { TextArea } from '../../../components/ui/TextArea'
import { VinculoConteudoAula } from '../../../components/ui/VinculoConteudo'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { EstadoVazio } from '../../../components/feedback/EstadoVazio'
import { useToast } from '../../../contexts/toastContexto'
import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import {
  aulas as servicoAulas,
  frequencias as servicoFrequencias,
  matriculas,
  planosAula,
  professores as servicoProfessores,
  turmas as servicoTurmas,
} from '../../../services/endpoints'
import { formatarCargaHoraria } from '../../../utils/format'
import type { AlunoTurma } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

type Aba = 'chamada' | 'conteudo'

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

/* Disciplina + aula do plano de aula + Salvar ficam juntos dentro do próprio
   cartão do Header. flex-wrap (não overflow-x: auto): quando o espaço aperta
   os campos quebram pra uma segunda linha, sempre abaixo do título — nunca
   viram uma faixa com scroll horizontal escondendo conteúdo. */
const CamposCabecalho = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
`

/* Largura fixa e concreta pra cada campo — o <Field> por baixo do
   Input/Select/DatePicker pede width:100% do pai pra preencher célula de
   grid de formulário; só max-width no campo (auto-width no pai) não é
   suficiente pra essa cadeia resolver de forma confiável (o pai encolhia
   demais em vez de assumir a largura máxima do filho). Um pai com largura
   já definida elimina essa ambiguidade. */
const CampoLargura = styled.div<{ $largura: string }>`
  width: ${({ $largura }) => $largura};
  max-width: 100%;
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

/* O Salvar não pode encolher junto com o resto da linha (Disciplina + Aula)
   quando o espaço aperta — senão o texto do botão corta. */
const BotaoSalvar = styled.div`
  flex-shrink: 0;
`

interface LinhaChamada {
  alunoId: number
  nome: string
  presente: boolean
  cargaHorariaAtingida: number
}

/**
 * Entrada rápida de "Registrar aula" a partir de Turmas: o professor escolhe
 * a disciplina (uma turma pode ter mais de uma disciplina/professor) e a
 * aula do plano de aula correspondente — sem precisar de um campo de data
 * solto no topo, que só duplicava a "Data publicação" já editável na aba de
 * conteúdo. Sem escolha manual, a próxima aula pendente (sem
 * dataPublicacao, por ordem) vem pré-selecionada sozinha.
 *
 * Chegando da tela "Aulas" de um Plano de Aula específico (ver
 * PlanoAula/Aulas.tsx — mesma tela de registro, não uma duplicata), a aula
 * exata clicada vem pré-selecionada via ?aulaId=/&vinculoId=.
 */
export default function RegistrarAulaTurma() {
  const { turmaId } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const { professorId } = useProfessorLogado()

  const idTurma = Number(turmaId)

  const [searchParams] = useSearchParams()
  const aulaIdDaUrl = Number(searchParams.get('aulaId')) || null
  const vinculoIdDaUrl = Number(searchParams.get('vinculoId')) || null

  const [aba, setAba] = useState<Aba>('conteudo')
  const [turmaDisciplinaId, setTurmaDisciplinaId] = useState<number | null>(vinculoIdDaUrl)
  const [aulaSelecionadaManualId, setAulaSelecionadaManualId] = useState<number | null>(aulaIdDaUrl)
  const [quantidadeHorarios, setQuantidadeHorarios] = useState('')
  const [dataPrevista, setDataPrevista] = useState('')
  const [dataPublicacao, setDataPublicacao] = useState(() => new Date().toISOString().slice(0, 10))
  const [observacoes, setObservacoes] = useState('')
  const [edicoesChamada, setEdicoesChamada] = useState<Record<number, boolean>>({})

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

  // Sem escolha manual: a próxima aula pendente (sem dataPublicacao) do
  // plano, por ordem — o caso comum de "a próxima aula a dar".
  const aulaSugerida = useMemo(
    () =>
      [...aulasDoPlano]
        .filter((aula) => !aula.dataPublicacao && aula.status !== 'INATIVO')
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))[0] ?? null,
    [aulasDoPlano],
  )

  const aulaAlvo = aulaSelecionadaManualId
    ? (aulasDoPlano.find((aula) => aula.id === aulaSelecionadaManualId) ?? null)
    : aulaSugerida

  // Trocar de disciplina invalida a escolha manual anterior — a
  // reconciliação automática assume de novo a partir da nova aulaSugerida.
  // Comparação de valor (não uma flag "já rodei uma vez"): sob StrictMode o
  // React invoca o efeito duas vezes já na montagem, e uma flag booleana
  // simples é zerada na primeira chamada e já não protege a segunda —
  // descartando a pré-seleção vinda de ?aulaId= antes de qualquer render.
  const disciplinaAnterior = useRef(disciplinaAtiva)
  useEffect(() => {
    if (disciplinaAnterior.current === disciplinaAtiva) return

    disciplinaAnterior.current = disciplinaAtiva
    setAulaSelecionadaManualId(null)
  }, [disciplinaAtiva])

  // A chamada depende dos horários da aula (cada aluno é avaliado contra a
  // carga horária prevista) — só libera depois que "Quantidade de horários"
  // estiver preenchida na aba de conteúdo.
  const chamadaLiberada = Boolean(quantidadeHorarios)

  useEffect(() => {
    if (!chamadaLiberada && aba === 'chamada') setAba('conteudo')
  }, [chamadaLiberada, aba])

  // Os campos de "criar/ajustar aula" seguem a aula-alvo atual (selecionada
  // ou sugerida) — trocando de aula, os campos atualizam junto. Sem aula
  // já publicada, a data de publicação sugerida é hoje.
  useEffect(() => {
    setQuantidadeHorarios(aulaAlvo?.cargaHoraria?.toString() ?? '')
    setDataPrevista(aulaAlvo?.dataPrevista?.slice(0, 10) ?? '')
    setDataPublicacao(aulaAlvo?.dataPublicacao?.slice(0, 10) ?? new Date().toISOString().slice(0, 10))
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

  const { executar: salvar, executando: salvando } = useAcao(async () => {
    if (!planoAtual) {
      toast.warning('Sem plano de aula', 'Esta disciplina ainda não tem um plano de aula nesta turma.')
      return
    }

    // Regra pedagógica: a aula precisa já existir no plano de aula (com
    // horários e carga horária previstos) antes de registrar chamada — evita
    // aulas "avulsas" que não fecham a carga horária do plano. Cadastro de
    // aula é feito só na tela do Plano de Aula (AulaFormulario).
    if (!aulaAlvo) {
      toast.warning(
        'Nenhuma aula pendente no plano',
        'Cadastre a aula no Plano de Aula desta disciplina antes de registrar a chamada.',
      )
      return
    }

    try {
      await servicoAulas.atualizar(aulaAlvo.id, {
        dataPublicacao,
        dataPrevista: dataPrevista || undefined,
        cargaHoraria: quantidadeHorarios ? Number(quantidadeHorarios) : undefined,
        observacoes: observacoes.trim() || undefined,
      })

      await servicoAulas.registrarChamada(aulaAlvo.id, {
        alunos: linhasChamada.map((linha) => ({ alunoId: linha.alunoId, presente: linha.presente })),
      })

      toast.success('Aula registrada', 'Chamada e dados da aula salvos.')
      await requisicaoAulasPlano.reload()
    } catch (erroSalvar) {
      toast.error('Não foi possível salvar', erroSalvar instanceof ApiError ? erroSalvar.message : undefined)
    }
  })

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
        rotuloVoltar="Turma"
        filtros={
          <CamposCabecalho>
            <CampoLargura $largura="320px">
              <Select
                label="Disciplina"
                options={disciplinasDaTurma}
                value={disciplinaAtiva}
                loading={requisicaoVinculos.loading}
                emptyText="Você não leciona disciplinas nesta turma"
                onChange={setTurmaDisciplinaId}
              />
            </CampoLargura>

            <CampoLargura $largura="360px">
              <Select
                label="Aula do plano de aula"
                options={opcoesAulasPlano}
                value={aulaAlvo?.id ?? null}
                clearable
                loading={requisicaoAulasPlano.loading}
                disabled={!disciplinaAtiva}
                emptyText="Este plano de aula ainda não tem aulas cadastradas"
                onChange={setAulaSelecionadaManualId}
              />
            </CampoLargura>

            <BotaoSalvar>
              <Button
                size="large"
                variant="success"
                icon={<Save />}
                loading={salvando}
                disabled={!aulaAlvo}
                onClick={salvar}
              >
                Salvar
              </Button>
            </BotaoSalvar>
          </CamposCabecalho>
        }
      />

      {planoAtual && !aulaAlvo && !requisicaoAulasPlano.loading && (
        <Card>
          <EstadoVazio
            titulo="Nenhuma aula pendente no plano para esta disciplina"
            descricao="A aula precisa estar cadastrada no Plano de Aula antes de registrar chamada — isso garante que os horários e a carga horária do plano fechem corretamente."
            icon={<ListTree />}
            acao={
              <Button
                icon={<Plus />}
                onClick={() => {
                  // Sem isso, salvar a aula nova mandava o professor pra lista
                  // de aulas do plano — daí ele tinha que sair, voltar em
                  // Turmas, entrar na disciplina de novo só pra registrar a
                  // chamada da aula que acabou de cadastrar. `retornarPara`
                  // traz de volta direto pra cá, com a disciplina certa.
                  const aqui = `/professor/turmas/${idTurma}/registrar-aula?vinculoId=${disciplinaAtiva}`
                  navegar(
                    `/professor/plano-aula/${planoAtual.id}/aulas/nova?retornarPara=${encodeURIComponent(aqui)}`,
                  )
                }}
              >
                Cadastrar aula no plano
              </Button>
            }
          />
        </Card>
      )}

      <Tab<Aba>
        rotuloAcessivel="Seções do registro de aula"
        value={aba}
        onChange={setAba}
        options={[
          { value: 'conteudo', label: 'Registrar conteúdo' },
          {
            value: 'chamada',
            label: 'Realizar chamada',
            disabled: !chamadaLiberada,
          },
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
            <Grade>
              <Input
                label="Quantidade de horários"
                type="number"
                min={1}
                value={quantidadeHorarios}
                disabled={!aulaAlvo}
                onChange={(evento) => setQuantidadeHorarios(evento.target.value)}
              />
              <DatePicker
                label="Data prevista"
                value={dataPrevista}
                disabled={!aulaAlvo}
                onChange={(evento) => setDataPrevista(evento.target.value)}
              />
              <DatePicker
                label="Data publicação"
                value={dataPublicacao}
                disabled={!aulaAlvo}
                hint="Data em que a aula foi (ou será) realizada."
                onChange={(evento) => setDataPublicacao(evento.target.value)}
              />
            </Grade>

            <VinculoConteudoAula
              aulaId={aulaAlvo?.id}
              planoEnsinoId={planoAtual?.planoEnsino?.id}
              permitirModoLocal={false}
            />

            <TextArea
              label="Observações"
              placeholder="Materiais necessários, combinados com a turma, adaptações..."
              value={observacoes}
              disabled={!aulaAlvo}
              maxLength={2000}
              rows={4}
              autoAltura
              onChange={(evento) => setObservacoes(evento.target.value)}
            />
          </Coluna>
        </Card>
      )}
    </Layout>
  )
}
