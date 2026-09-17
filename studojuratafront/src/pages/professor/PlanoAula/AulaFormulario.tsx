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
import { VinculoConteudoAula } from '../../../components/planejamento/VinculoConteudo'
import { Stack } from '../../../components/ui/Stack'
import { GradeAutoAjuste } from '../../../components/ui/GradeAutoAjuste'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useHidratar } from '../../../hooks/useHidratar'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { aulas as servicoAulas, planosAula } from '../../../services/planejamento'
import { horariosTurma } from '../../../services/turmas'
import { formatarCargaHoraria, formatarHora, horaParaMinutos, horasParaHHmm } from '../../../utils/format'
import { ROTULO_DIA_SEMANA_CURTO } from '../../../utils/labels'
import { useFormularioAula } from '../../../formularios/planejamento'

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

  // Turma sem nenhum horário cadastrado: a carga horária é digitada (HH:mm) em vez de escolhida.
  const semHorarioCadastrado = !requisicaoHorarios.loading && opcoesHorarios.length === 0

  const proximaOrdem = useMemo(() => {
    const existentes = (requisicaoAulas.data ?? []).map((aula) => aula.ordem ?? 0)
    return existentes.length === 0 ? 1 : Math.max(...existentes) + 1
  }, [requisicaoAulas.data])

  const ordensOcupadas = useMemo(
    () =>
      (requisicaoAulas.data ?? [])
        .filter((aula) => aula.id !== idAula && aula.status !== 'INATIVO' && aula.ordem !== undefined)
        .map((aula) => aula.ordem as number),
    [requisicaoAulas.data, idAula],
  )

  const form = useFormularioAula({
    semHorarioCadastrado,
    ordensOcupadas,
    ordemSugerida: edicao ? '' : String(proximaOrdem),
  })

  useHidratar(requisicaoAula.data, (aula) => {
    form.setValues({
      ordem: aula.ordem?.toString() ?? '',
      titulo: aula.titulo ?? '',
      dataPrevista: aula.dataPrevista?.slice(0, 10) ?? '',
      dataPublicacao: aula.dataPublicacao?.slice(0, 10) ?? '',
      horarioTurmaId: aula.horarioTurma?.id ?? null,
      cargaHorariaManual: !aula.horarioTurma?.id && aula.cargaHoraria ? horasParaHHmm(aula.cargaHoraria) : '',
      observacoes: aula.observacoes ?? '',
    })
    form.resetDirty()
  })

  const horarioSelecionado = (requisicaoHorarios.data ?? []).find((horario) => horario.id === form.values.horarioTurmaId)
  const cargaHorariaCalculada = horarioSelecionado
    ? (horaParaMinutos(horarioSelecionado.horaFim) - horaParaMinutos(horarioSelecionado.horaInicio)) / 60
    : null

  const ordemExibida = form.values.ordem || (edicao ? '' : String(proximaOrdem))

  const { executar: salvar, executando: salvando } = useAcao(async () => {
    if ((await form.validate()).hasErrors || !requisicaoPlano.data) return
    const { titulo, dataPrevista, dataPublicacao, cargaHorariaManual, observacoes } = form.getValues()

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
              {...form.getInputProps('titulo')}
              disabled={salvando}
              maxLength={150}
            />

            <GradeAutoAjuste $larguraMinima="200px">
              <Input
                label="Ordem"
                type="number"
                min={1}
                {...form.getInputProps('ordem')}
                value={ordemExibida}
                disabled={salvando}
                hint="Sequência da aula no plano."
              />

              {semHorarioCadastrado ? (
                <TimePicker
                  label="Carga horária"
                  required
                  value={form.values.cargaHorariaManual}
                  error={form.errors.cargaHorariaManual as string | undefined}
                  disabled={salvando}
                  hint="Esta turma ainda não tem horário cadastrado (Turmas, aba Horários) — digite a duração desta aula."
                  onChange={(evento) => form.setFieldValue('cargaHorariaManual', evento.target.value)}
                />
              ) : (
                <Select<number>
                  label="Horário"
                  required
                  options={opcoesHorarios}
                  value={form.values.horarioTurmaId}
                  loading={requisicaoHorarios.loading}
                  error={form.errors.horarioTurmaId as string | undefined}
                  disabled={salvando}
                  hint="A carga horária vem do horário escolhido."
                  placeholder="Selecionar horário..."
                  onChange={(valor) => form.setFieldValue('horarioTurmaId', valor)}
                />
              )}

              <DatePicker
                label="Data prevista"
                value={form.values.dataPrevista}
                disabled={salvando}
                onChange={(evento) => form.setFieldValue('dataPrevista', evento.target.value)}
              />
            </GradeAutoAjuste>

            <TextArea
              label="Observações"
              placeholder="Materiais necessários, combinados com a turma, adaptações..."
              {...form.getInputProps('observacoes')}
              disabled={salvando}
              maxLength={2000}
              rows={4}
              autoAltura
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
