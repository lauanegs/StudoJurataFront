import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Archive, Save, Users } from 'lucide-react'

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
import { Stack } from '../../../components/ui/Stack'
import { GradeAutoAjuste } from '../../../components/ui/GradeAutoAjuste'
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

export default function AulaFormulario() {
  const { planoAulaId, aulaId } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const idPlano = Number(planoAulaId)
  const edicao = Boolean(aulaId)
  const idAula = aulaId ? Number(aulaId) : null

  // Vindo de "Registrar aula", salvar volta para lá em vez da lista de aulas do plano.
  const [searchParams] = useSearchParams()
  const retornarPara = searchParams.get('retornarPara')
  const destinoPadrao = retornarPara || `/professor/plano-aula/${idPlano}/aulas`

  const [ordem, setOrdem] = useState('')
  const [titulo, setTitulo] = useState('')
  const [dataPrevista, setDataPrevista] = useState('')
  // Sem campo na tela, mas reenviado no PUT: AulaService.atualizar faz save()
  // completo e apagaria a data de uma aula já ministrada.
  const [dataPublicacao, setDataPublicacao] = useState('')
  // A carga horária vem do horário escolhido; cargaHorariaManual (HH:mm) só
  // quando a turma não tem nenhum horário cadastrado.
  const [horarioTurmaId, setHorarioTurmaId] = useState<number | null>(null)
  const [cargaHorariaManual, setCargaHorariaManual] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [erros, setErros] = useState<Record<string, string | undefined>>({})
  // Conteúdos escolhidos antes de a aula existir, vinculados em salvar().
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
        // Com horário, o back recalcula a carga horária de qualquer forma; sem
        // horário cadastrado, vale o que o professor digitou (HH:mm em horas).
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
      titulo: 'Inativar aula?',
      descricao: 'Frequências e conteúdos já registrados são preservados.',
      rotuloConfirmar: 'Inativar',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoAulas.excluir(idAula)
          toast.success('Aula inativada')
          navegar(destinoPadrao)
        } catch (erroExclusao) {
          toast.error(
            'Não foi possível inativar',
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
                icon={<Archive />}
                loading={excluindo}
                onClick={excluir}
                disabled={salvando}
              >
                Inativar
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
          <Stack gap="md">
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

            <GradeAutoAjuste $larguraMinima="200px">
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
            </GradeAutoAjuste>

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
          </Stack>
        </Card>
      )}
    </Layout>
  )
}
