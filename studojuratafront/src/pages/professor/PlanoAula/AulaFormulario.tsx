import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import { Save, Trash2, Users } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Header, SubtituloItem } from '../../../components/ui/Header'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { TextArea } from '../../../components/ui/TextArea'
import { TimePicker } from '../../../components/ui/TimePicker'
import { VinculoConteudoAula } from '../../../components/ui/VinculoConteudo'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useHidratar } from '../../../hooks/useHidratar'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { aulas as servicoAulas, horariosTurma, planosAula } from '../../../services/endpoints'
import { formatarCargaHoraria, formatarHora, horaParaMinutos, horasParaHHmm } from '../../../utils/format'
import { ROTULO_DIA_SEMANA_CURTO } from '../../../utils/labels'

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

export default function AulaFormulario() {
  const { planoAulaId, aulaId } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const idPlano = Number(planoAulaId)
  const edicao = Boolean(aulaId)
  const idAula = aulaId ? Number(aulaId) : null

  // Atalho vindo de "Registrar aula" (RegistrarAulaTurma) quando a disciplina
  // ainda não tem nenhuma aula pendente no plano: sem isso, salvar aqui
  // sempre mandava de volta pra lista de aulas do plano — o professor tinha
  // que sair, voltar em Turmas, entrar na disciplina de novo, só pra
  // finalmente registrar a chamada da aula que acabou de cadastrar.
  const [searchParams] = useSearchParams()
  const retornarPara = searchParams.get('retornarPara')
  const destinoPadrao = retornarPara || `/professor/plano-aula/${idPlano}/aulas`

  const [ordem, setOrdem] = useState('')
  const [titulo, setTitulo] = useState('')
  const [dataPrevista, setDataPrevista] = useState('')
  // Sem campo na tela (esta tela só planeja a aula, não registra chamada —
  // ver RegistrarAulaTurma.tsx) — mas precisa continuar guardado e voltando
  // no corpo do PUT: AulaService.atualizar faz save() completo, não merge,
  // então não reenviar apagaria silenciosamente a data de uma aula já
  // ministrada só por ter sido editada aqui (título, observações...).
  const [dataPublicacao, setDataPublicacao] = useState('')
  // Horário da turma escolhido — a carga horária vem calculada dele (hora
  // fim - hora início), não mais digitada. cargaHorariaManual (HH:mm, igual
  // ao TimePicker de HorarioTurma) só é usada quando a turma ainda não tem
  // NENHUM horário cadastrado — aí não há o que selecionar.
  const [horarioTurmaId, setHorarioTurmaId] = useState<number | null>(null)
  const [cargaHorariaManual, setCargaHorariaManual] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [erros, setErros] = useState<Record<string, string | undefined>>({})
  // Conteúdos escolhidos ANTES de a aula existir (sem idAula ainda) — fica só
  // aqui até salvar() criar a aula e vincular de verdade (confirmado pelo
  // usuário: exigir salvar a aula primeiro pra só então vincular conteúdo
  // era um impedimento — mesmo tratamento do QuestaoEditor, ver
  // VinculoConteudoAula).
  const [conteudoPlanoIdsPendentes, setConteudoPlanoIdsPendentes] = useState<number[]>([])

  const requisicaoPlano = useRequisicao(() => planosAula.buscar(idPlano), [idPlano])
  const requisicaoAula = useRequisicao(() => servicoAulas.buscar(idAula as number), [idAula], {
    ativo: Boolean(idAula),
  })
  const requisicaoAulas = useRequisicao(() => servicoAulas.listarPorPlanoAula(idPlano), [idPlano])

  const turmaId = requisicaoPlano.data?.turmaDisciplina?.turma?.id ?? null
  const requisicaoHorarios = useRequisicao(
    () => horariosTurma.listarPorTurma(turmaId as number),
    [turmaId],
    { ativo: Boolean(turmaId) },
  )

  useHidratar(requisicaoAula.data, (aula) => {
    setOrdem(aula.ordem?.toString() ?? '')
    setTitulo(aula.titulo ?? '')
    setDataPrevista(aula.dataPrevista?.slice(0, 10) ?? '')
    setDataPublicacao(aula.dataPublicacao?.slice(0, 10) ?? '')
    if (aula.horarioTurma?.id) {
      setHorarioTurmaId(aula.horarioTurma.id)
    } else if (aula.cargaHoraria) {
      setCargaHorariaManual(horasParaHHmm(aula.cargaHoraria))
    }
    setObservacoes(aula.observacoes ?? '')
  })

  const opcoesHorarios = useMemo(
    () =>
      (requisicaoHorarios.data ?? []).map((horario) => {
        const minutos = horaParaMinutos(horario.horaFim) - horaParaMinutos(horario.horaInicio)
        return {
          value: horario.id,
          label: `${ROTULO_DIA_SEMANA_CURTO[horario.diaSemana]} — ${formatarHora(horario.horaInicio)} às ${formatarHora(horario.horaFim)} (${formatarCargaHoraria(minutos / 60)})`,
        }
      }),
    [requisicaoHorarios.data],
  )

  const horarioSelecionado = (requisicaoHorarios.data ?? []).find((horario) => horario.id === horarioTurmaId)
  const cargaHorariaCalculada = horarioSelecionado
    ? (horaParaMinutos(horarioSelecionado.horaFim) - horaParaMinutos(horarioSelecionado.horaInicio)) / 60
    : null

  // Turma sem NENHUM horário cadastrado: não há o que selecionar, então a
  // carga horária é digitada (TimePicker, HH:mm) em vez do Select.
  const semHorarioCadastrado = !requisicaoHorarios.loading && opcoesHorarios.length === 0

  const proximaOrdem = useMemo(() => {
    const existentes = (requisicaoAulas.data ?? []).map((aula) => aula.ordem ?? 0)
    return existentes.length === 0 ? 1 : Math.max(...existentes) + 1
  }, [requisicaoAulas.data])

  // Em uma aula nova o campo aparece já preenchido com a próxima ordem livre,
  // sem precisar de estado extra: a sugestão só vale enquanto nada foi digitado.
  const ordemExibida = ordem || (edicao ? '' : String(proximaOrdem))

  function validar() {
    const encontrados: Record<string, string | undefined> = {}

    if (!titulo.trim()) encontrados.titulo = 'Informe o título da aula'

    if (ordemExibida && (!Number.isInteger(Number(ordemExibida)) || Number(ordemExibida) <= 0)) {
      encontrados.ordem = 'A ordem deve ser um número inteiro positivo'
    }

    if (semHorarioCadastrado) {
      if (!cargaHorariaManual || horaParaMinutos(cargaHorariaManual) <= 0) {
        encontrados.cargaHoraria = 'Informe a carga horária da aula'
      }
    } else if (!horarioTurmaId) {
      encontrados.horario = 'Selecione o horário da turma'
    }

    // Ordem duplicada confunde a sequência exibida na listagem.
    const duplicada = (requisicaoAulas.data ?? []).some(
      (aula) => aula.ordem === Number(ordemExibida) && aula.id !== idAula && aula.status !== 'INATIVO',
    )

    if (ordemExibida && duplicada) encontrados.ordem = 'Já existe uma aula com esta ordem'

    setErros(encontrados)
    return Object.keys(encontrados).filter((chave) => encontrados[chave]).length === 0
  }

  const { executar: salvar, executando: salvando } = useAcao(async () => {
    if (!validar() || !requisicaoPlano.data) return

    try {
      const corpo = {
        planoAula: requisicaoPlano.data,
        titulo: titulo.trim(),
        ordem: ordemExibida ? Number(ordemExibida) : undefined,
        dataPrevista: dataPrevista || undefined,
        dataPublicacao: dataPublicacao || undefined,
        // Com horário selecionado, o back recalcula cargaHoraria a partir
        // dele de qualquer forma (AulaService.validar) — manda o valor já
        // calculado aqui só pra não deixar o campo vazio até a resposta
        // voltar. Sem horário cadastrado na turma, horarioTurma vai null e
        // cargaHoraria é o que o professor digitou (HH:mm convertido em horas).
        horarioTurma: semHorarioCadastrado ? null : (horarioSelecionado ?? null),
        cargaHoraria: semHorarioCadastrado
          ? horaParaMinutos(cargaHorariaManual) / 60
          : (cargaHorariaCalculada ?? undefined),
        observacoes: observacoes.trim() || undefined,
        status: 'ATIVO' as const,
      }

      if (edicao) {
        await servicoAulas.atualizar(idAula as number, corpo)
      } else {
        const aulaCriada = await servicoAulas.criar(corpo)

        // Conteúdos escolhidos antes de a aula existir (VinculoConteudoAula
        // em modo local) — comitados agora que ela finalmente tem id.
        if (conteudoPlanoIdsPendentes.length > 0) {
          await Promise.all(
            conteudoPlanoIdsPendentes.map((conteudoPlanoId) =>
              servicoAulas.vincularConteudo(aulaCriada.id, conteudoPlanoId),
            ),
          )
        }
      }

      toast.success(edicao ? 'Aula atualizada' : 'Aula criada', corpo.titulo)
      navegar(destinoPadrao)
    } catch (erroSalvar) {
      toast.error(
        'Não foi possível salvar',
        erroSalvar instanceof ApiError ? erroSalvar.message : undefined,
      )
    }
  })

  const { executar: excluir, executando: excluindo } = useAcao(async () => {
    if (!idAula) return

    await confirmar({
      titulo: 'Excluir aula?',
      descricao: 'Frequências e conteúdos já registrados são preservados.',
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoAulas.excluir(idAula)
          toast.success('Aula excluída')
          navegar(destinoPadrao)
        } catch (erroExclusao) {
          toast.error(
            'Não foi possível excluir',
            erroExclusao instanceof ApiError ? erroExclusao.message : undefined,
          )
        }
      },
    })
  })

  if (requisicaoPlano.error) {
    return (
      <Layout>
        <Header titulo="Aula" voltarPara="/professor/plano-aula" />
        <ErroCarregamento
          mensagem={requisicaoPlano.error}
          onRetry={requisicaoPlano.reload}
        />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo={edicao ? 'Editar aula' : 'Nova aula'}
        subtitulo={
          requisicaoPlano.data?.turmaDisciplina?.turma?.titulo && (
            <SubtituloItem icon={<Users />}>Turma: {requisicaoPlano.data.turmaDisciplina.turma.titulo}</SubtituloItem>
          )
        }
        voltarPara={destinoPadrao}
        rotuloVoltar={retornarPara ? 'Registrar aula' : 'Aulas'}
        actions={
          <>
            {edicao ? (
              <Button
                size="large"
                variant="danger"
                icon={<Trash2 />}
                loading={excluindo}
                onClick={excluir}
                disabled={salvando}
              >
                Excluir
              </Button>
            ) : (
              <Button
                size="large"
                variant="danger"
                onClick={() => navegar(destinoPadrao)}
                disabled={salvando}
              >
                Cancelar
              </Button>
            )}
            <Button
              size="large"
              variant="success"
              icon={<Save />}
              loading={salvando}
              disabled={excluindo}
              onClick={salvar}
            >
              Salvar
            </Button>
          </>
        }
      />

      {edicao && requisicaoAula.loading ? (
        <SkeletonCartao />
      ) : (
        <Card titulo="Dados da aula">
          <Coluna>
            <Input
              label="Título da aula"
              required
              placeholder="Ex.: Aula 1 — Primeiros comandos"
              value={titulo}
              error={erros.titulo}
              disabled={salvando}
              maxLength={150}
              onChange={(evento) => setTitulo(evento.target.value)}
            />

            <Grade>
              <Input
                label="Ordem"
                type="number"
                min={1}
                value={ordemExibida}
                error={erros.ordem}
                disabled={salvando}
                hint="Sequência da aula no plano."
                onChange={(evento) => setOrdem(evento.target.value)}
              />

              {semHorarioCadastrado ? (
                <TimePicker
                  label="Carga horária"
                  required
                  value={cargaHorariaManual}
                  error={erros.cargaHoraria}
                  disabled={salvando}
                  hint="Esta turma ainda não tem horário cadastrado (Turmas, aba Horários) — digite a duração desta aula."
                  onChange={(evento) => setCargaHorariaManual(evento.target.value)}
                />
              ) : (
                <Select<number>
                  label="Horário"
                  required
                  options={opcoesHorarios}
                  value={horarioTurmaId}
                  loading={requisicaoHorarios.loading}
                  error={erros.horario}
                  disabled={salvando}
                  hint="A carga horária vem do horário escolhido."
                  placeholder="Selecionar horário..."
                  onChange={setHorarioTurmaId}
                />
              )}

              <DatePicker
                label="Data prevista"
                value={dataPrevista}
                disabled={salvando}
                onChange={(evento) => setDataPrevista(evento.target.value)}
              />
            </Grade>

            <TextArea
              label="Observações"
              placeholder="Materiais necessários, combinados com a turma, adaptações..."
              value={observacoes}
              disabled={salvando}
              maxLength={2000}
              rows={4}
              autoAltura
              onChange={(evento) => setObservacoes(evento.target.value)}
            />

            <VinculoConteudoAula
              aulaId={idAula ?? undefined}
              planoEnsinoId={requisicaoPlano.data?.planoEnsino?.id}
              conteudoPlanoIdsPendentes={conteudoPlanoIdsPendentes}
              onChangePendentes={setConteudoPlanoIdsPendentes}
            />
          </Coluna>
        </Card>
      )}
    </Layout>
  )
}
