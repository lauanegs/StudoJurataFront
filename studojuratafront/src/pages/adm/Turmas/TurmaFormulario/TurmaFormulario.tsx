import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Archive, ArchiveRestore, Save } from 'lucide-react'

import { Layout } from '../../../../components/layout'
import { Button } from '../../../../components/ui/Button'
import { Header } from '../../../../components/ui/Header'
import { Tab } from '../../../../components/ui/Tab'
import { ErroCarregamento } from '../../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../../components/feedback/Skeleton'
import { useConfirm } from '../../../../contexts/confirmContexto'
import { useToast } from '../../../../contexts/toastContexto'
import { useEscola } from '../../../../hooks/useEscola'
import { useHidratar } from '../../../../hooks/useHidratar'
import { useRequisicao } from '../../../../hooks/useRequisicao'
import { ApiError } from '../../../../services/api'
import { cursos as servicoCursos } from '../../../../services/curriculo'
import { horariosTurma, matriculas, turmaDisciplinas, turmas as servicoTurmas } from '../../../../services/turmas'
import { useFormularioTurma } from '../../../../formularios/turmas'
import { AbaAlunos } from './AbaAlunos'
import { AbaDisciplinas } from './AbaDisciplinas'
import { AbaHistorico } from './AbaHistorico'
import { AbaHorarios } from './AbaHorarios'
import { DadosTurma } from './DadosTurma'
import { rotaDaTurmaCriada } from './destinoAposSalvar'

type Aba = 'data' | 'horarios' | 'disciplinas' | 'alunos' | 'historico'

export default function TurmaFormulario() {
  const { id } = useParams()
  const navegar = useNavigate()
  const localizacao = useLocation()
  const toast = useToast()
  const confirmar = useConfirm()
  const { escola, loading: carregandoEscola } = useEscola()

  const edicao = Boolean(id)
  const turmaId = id ? Number(id) : null

  const abaInicial = (localizacao.state as { aba?: Aba } | null)?.aba
  const [aba, setAba] = useState<Aba>(abaInicial ?? 'data')

  const form = useFormularioTurma()
  const { titulo, cursoId, capacidadeMaxima, dataInicio, dataFim, ativa } = form.values
  const [salvando, setSalvando] = useState(false)

  const requisicaoTurma = useRequisicao(() => servicoTurmas.buscar(turmaId as number), [turmaId], {
    ativo: Boolean(turmaId),
  })
  const requisicaoCursos = useRequisicao(() => servicoCursos.listar(), [])

  // Carregadas aqui porque os contadores das abas precisam delas.
  const requisicaoHorarios = useRequisicao(() => horariosTurma.listarPorTurma(turmaId as number), [turmaId], {
    ativo: Boolean(turmaId),
  })
  const requisicaoVinculos = useRequisicao(() => turmaDisciplinas.listar(), [], { ativo: Boolean(turmaId) })
  const requisicaoAtivos = useRequisicao(() => matriculas.ativosPorTurma(turmaId as number), [turmaId], {
    ativo: Boolean(turmaId),
  })
  const requisicaoHistorico = useRequisicao(() => matriculas.historicoPorTurma(turmaId as number), [turmaId], {
    ativo: Boolean(turmaId),
  })

  useHidratar(requisicaoTurma.data, (turma) => {
    form.setFieldValue('titulo', turma.titulo ?? '')
    form.setFieldValue('cursoId', turma.curso?.id ?? null)
    form.setFieldValue('capacidadeMaxima', turma.capacidadeMaxima?.toString() ?? '')
    form.setFieldValue('dataInicio', turma.dataInicio?.slice(0, 10) ?? '')
    form.setFieldValue('dataFim', turma.dataFim?.slice(0, 10) ?? '')
    form.setFieldValue('ativa', turma.status !== 'INATIVA')
  })

  /** turmaDisciplinas.excluir() é soft-delete, então o vínculo inativo precisa ser filtrado. */
  const vinculosDaTurma = useMemo(
    () =>
      (requisicaoVinculos.data ?? []).filter((vinculo) => vinculo.turma?.id === turmaId && vinculo.status !== 'INATIVO'),
    [requisicaoVinculos.data, turmaId],
  )

  const opcoesCursos = useMemo(
    () =>
      (requisicaoCursos.data ?? [])
        .filter((curso) => curso.status !== 'INATIVO')
        .map((curso) => ({ value: curso.id, label: curso.nome })),
    [requisicaoCursos.data],
  )

  async function salvar() {
    if ((await form.validate()).hasErrors) {
      setAba('data')
      return
    }

    if (!escola) {
      toast.error('Escola não encontrada', 'Cadastre uma escola antes de criar turmas.')
      return
    }

    const curso = (requisicaoCursos.data ?? []).find((item) => item.id === cursoId)
    if (!curso) return

    setSalvando(true)

    try {
      const corpo = {
        escola,
        curso,
        titulo: titulo.trim(),
        // Capacidade e data de início são obrigatórias na tela (e no schema).
        capacidadeMaxima: Number(capacidadeMaxima),
        dataInicio,
        // Turma ativa nunca tem data de término.
        dataFim: ativa ? undefined : dataFim || undefined,
        status: ativa ? ('ATIVA' as const) : ('INATIVA' as const),
      }

      if (edicao) {
        await servicoTurmas.atualizar(turmaId as number, corpo)
        toast.success('Turma atualizada', corpo.titulo)
        // Permanece na mesma tela e na aba atual; o reload traz o que o back
        // gravou (inclusive Situação) sem descartar o formulário.
        await requisicaoTurma.reload()
      } else {
        const criada = await servicoTurmas.criar(corpo)
        toast.success('Turma criada', 'Agora defina os horários e vincule as disciplinas.')
        const destino = rotaDaTurmaCriada(criada)
        if (destino) navegar(destino, { replace: true })
      }
    } catch (erroSalvar) {
      toast.error('Não foi possível salvar', erroSalvar instanceof ApiError ? erroSalvar.message : undefined)
    } finally {
      setSalvando(false)
    }
  }

  async function excluirTurma() {
    if (!turmaId) return

    await confirmar({
      titulo: 'Inativar turma?',
      descricao:
        'A turma será inativada. Só funciona se ela nunca teve aluno matriculado — se já teve, altere a Situação em "Dados da turma" para inativar preservando o histórico.',
      rotuloConfirmar: 'Inativar',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoTurmas.excluir(turmaId)
          toast.success('Turma inativada')
          navegar('/adm/turmas')
        } catch (erroExclusao) {
          toast.error('Não foi possível inativar', erroExclusao instanceof ApiError ? erroExclusao.message : undefined)
        }
      },
    })
  }

  async function ativarTurma() {
    if (!turmaId) return

    await confirmar({
      titulo: 'Ativar turma?',
      descricao: 'A turma voltará a ficar ativa.',
      rotuloConfirmar: 'Ativar',
      aoConfirmar: async () => {
        try {
          await servicoTurmas.ativar(turmaId)
          toast.success('Turma ativada')
          await requisicaoTurma.reload()
        } catch (erroAtivacao) {
          toast.error('Não foi possível ativar', erroAtivacao instanceof ApiError ? erroAtivacao.message : undefined)
        }
      },
    })
  }

  if (edicao && requisicaoTurma.error) {
    return (
      <Layout>
        <Header titulo="Turma" voltarPara="/adm/turmas" />
        <ErroCarregamento mensagem={requisicaoTurma.error} onRetry={requisicaoTurma.reload} />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo={edicao ? titulo || 'Editar turma' : 'Nova turma'}
        voltarPara="/adm/turmas"
        rotuloVoltar="Turmas"
        actions={
          <>
            {edicao && requisicaoTurma.data?.status === 'INATIVA' ? (
              <Button variant="success" size="large" icon={<ArchiveRestore />} onClick={ativarTurma} disabled={salvando}>
                Ativar
              </Button>
            ) : edicao ? (
              <Button variant="danger" size="large" icon={<Archive />} onClick={excluirTurma} disabled={salvando}>
                Inativar
              </Button>
            ) : (
              <Button variant="danger" size="large" onClick={() => navegar('/adm/turmas')} disabled={salvando}>
                Cancelar
              </Button>
            )}
            <Button
              variant="success"
              size="large"
              icon={<Save />}
              loading={salvando}
              disabled={carregandoEscola}
              onClick={salvar}
            >
              Salvar
            </Button>
          </>
        }
      />

      {edicao && (
        <Tab<Aba>
          rotuloAcessivel="Seções da turma"
          value={aba}
          onChange={setAba}
          options={[
            { value: 'data', label: 'Dados da turma' },
            { value: 'horarios', label: 'Horários', contador: requisicaoHorarios.data?.length },
            { value: 'disciplinas', label: 'Disciplinas', contador: vinculosDaTurma.length },
            { value: 'alunos', label: 'Alunos ativos', contador: requisicaoAtivos.data?.length ?? 0 },
            { value: 'historico', label: 'Histórico', contador: requisicaoHistorico.data?.length ?? 0 },
          ]}
        />
      )}

      {edicao && requisicaoTurma.loading ? (
        <SkeletonCartao />
      ) : (
        <>
          {(!edicao || aba === 'data') && (
            <DadosTurma
              form={form}
              salvando={salvando}
              opcoesCursos={opcoesCursos}
              carregandoCursos={requisicaoCursos.loading}
            />
          )}

          {turmaId && aba === 'horarios' && <AbaHorarios turmaId={turmaId} requisicaoHorarios={requisicaoHorarios} />}

          {requisicaoTurma.data && aba === 'disciplinas' && (
            <AbaDisciplinas
              turma={requisicaoTurma.data}
              cursoId={cursoId}
              vinculosDaTurma={vinculosDaTurma}
              requisicaoVinculos={requisicaoVinculos}
            />
          )}

          {turmaId && aba === 'alunos' && (
            <AbaAlunos
              turmaId={turmaId}
              requisicaoAtivos={requisicaoAtivos}
              historico={requisicaoHistorico.data ?? []}
              vinculos={requisicaoVinculos.data}
            />
          )}

          {turmaId && aba === 'historico' && (
            <AbaHistorico turmaId={turmaId} requisicaoHistorico={requisicaoHistorico} />
          )}
        </>
      )}
    </Layout>
  )
}
