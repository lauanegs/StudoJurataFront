import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { ListTree, Save, Trash2 } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Header } from '../../../components/ui/Header'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { TextArea } from '../../../components/ui/TextArea'
import { Toggle } from '../../../components/ui/Toggle'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useHidratar } from '../../../hooks/useHidratar'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import {
  cursos as servicoCursos,
  planosEnsino as servicoPlanos,
  professores as servicoProfessores,
} from '../../../services/endpoints'
import { intervaloDeDatas, periodoLetivo as validarPeriodo } from '../../../utils/validacao'

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

export default function PlanoEnsinoFormulario() {
  const { id } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()
  const { professorId } = useProfessorLogado()

  const edicao = Boolean(id)
  const planoId = id ? Number(id) : null

  const [titulo, setTitulo] = useState('')
  const [cursoId, setCursoId] = useState<number | null>(null)
  const [turmaDisciplinaId, setTurmaDisciplinaId] = useState<number | null>(null)
  const [periodo, setPeriodo] = useState('')
  const [cargaHoraria, setCargaHoraria] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [ementa, setEmenta] = useState('')
  const [objetivoGeral, setObjetivoGeral] = useState('')
  const [metodologia, setMetodologia] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [erros, setErros] = useState<Record<string, string | undefined>>({})
  const [salvando, setSalvando] = useState(false)

  const requisicaoPlano = useRequisicao(() => servicoPlanos.buscar(planoId as number), [planoId], {
    ativo: Boolean(planoId),
  })
  const requisicaoCursos = useRequisicao(() => servicoCursos.listar(), [])
  const requisicaoVinculos = useRequisicao(
    () => servicoProfessores.turmasLecionadas(professorId as number),
    [professorId],
    { ativo: Boolean(professorId) },
  )

  useHidratar(requisicaoPlano.data, (plano) => {
    setTitulo(plano.titulo ?? '')
    setCursoId(plano.curso?.id ?? null)
    setTurmaDisciplinaId(plano.turmaDisciplina?.id ?? null)
    setPeriodo(plano.periodoLetivo ?? '')
    setCargaHoraria(plano.cargaHoraria?.toString() ?? '')
    setDataInicio(plano.dataInicio?.slice(0, 10) ?? '')
    setDataFim(plano.dataFim?.slice(0, 10) ?? '')
    setEmenta(plano.ementa ?? '')
    setObjetivoGeral(plano.objetivoGeral ?? '')
    setMetodologia(plano.metodologia ?? '')
    setAtivo(plano.status !== 'INATIVO')
  })

  const opcoesCursos = useMemo(
    () => (requisicaoCursos.data ?? []).map((curso) => ({ value: curso.id, label: curso.nome })),
    [requisicaoCursos.data],
  )

  const opcoesVinculos = useMemo(
    () =>
      (requisicaoVinculos.data ?? []).map((vinculo) => ({
        value: vinculo.id,
        label: `${vinculo.turma?.titulo ?? 'Turma'} · ${vinculo.disciplina?.titulo ?? 'Disciplina'}`,
      })),
    [requisicaoVinculos.data],
  )

  function validar() {
    const encontrados: Record<string, string | undefined> = {}

    // PlanoEnsino.curso é obrigatório e periodoLetivo é @Column(nullable = false).
    if (!cursoId) encontrados.cursoId = 'Selecione o curso'

    if (!periodo.trim()) {
      encontrados.periodo = 'Informe o período letivo'
    } else {
      const erroPeriodo = validarPeriodo(periodo)
      if (erroPeriodo) encontrados.periodo = erroPeriodo
    }

    if (cargaHoraria && (!Number.isFinite(Number(cargaHoraria)) || Number(cargaHoraria) <= 0)) {
      encontrados.cargaHoraria = 'Informe um número de horas maior que zero'
    }

    const erroDatas = intervaloDeDatas(dataInicio, dataFim)
    if (erroDatas) encontrados.dataFim = erroDatas

    setErros(encontrados)
    return Object.keys(encontrados).filter((chave) => encontrados[chave]).length === 0
  }

  async function salvar() {
    if (!validar()) return

    const curso = (requisicaoCursos.data ?? []).find((item) => item.id === cursoId)
    if (!curso) return

    setSalvando(true)

    try {
      const corpo = {
        curso,
        turmaDisciplina: (requisicaoVinculos.data ?? []).find(
          (item) => item.id === turmaDisciplinaId,
        ),
        titulo: titulo.trim() || undefined,
        periodoLetivo: periodo.trim(),
        cargaHoraria: cargaHoraria ? Number(cargaHoraria) : undefined,
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
        ementa: ementa.trim() || undefined,
        objetivoGeral: objetivoGeral.trim() || undefined,
        metodologia: metodologia.trim() || undefined,
        status: ativo ? ('ATIVO' as const) : ('INATIVO' as const),
      }

      if (edicao) {
        await servicoPlanos.atualizar(planoId as number, corpo)
        toast.success('Plano de ensino atualizado')
        navegar(`/professor/plano-ensino/${planoId}/conteudos`)
      } else {
        const criado = await servicoPlanos.criar(corpo)
        toast.success('Plano de ensino criado', 'Agora cadastre os conteúdos do plano.')
        navegar(`/professor/plano-ensino/${criado.id}/conteudos`)
      }
    } catch (erroSalvar) {
      toast.error(
        'Não foi possível salvar',
        erroSalvar instanceof ApiError ? erroSalvar.message : undefined,
      )
    } finally {
      setSalvando(false)
    }
  }

  async function excluir() {
    if (!planoId) return

    const confirmado = await confirmar({
      titulo: 'Excluir plano de ensino?',
      descricao: 'Os conteúdos e planos de aula vinculados permanecem.',
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
    })

    if (!confirmado) return

    try {
      await servicoPlanos.excluir(planoId)
      toast.success('Plano excluído')
      navegar('/professor/plano-ensino')
    } catch (erroExclusao) {
      toast.error(
        'Não foi possível excluir',
        erroExclusao instanceof ApiError ? erroExclusao.message : undefined,
      )
    }
  }

  if (edicao && requisicaoPlano.error) {
    return (
      <Layout>
        <Header titulo="Plano de ensino" voltarPara="/professor/plano-ensino" />
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
        titulo={edicao ? 'Editar plano de ensino' : 'Novo plano de ensino'}
        voltarPara="/professor/plano-ensino"
        rotuloVoltar="Voltar para planos de ensino"
        actions={
          <>
            {edicao && (
              <>
                <Button
                  variant="secondary"
                  icon={<ListTree />}
                  onClick={() => navegar(`/professor/plano-ensino/${planoId}/conteudos`)}
                >
                  Conteúdos
                </Button>
                <Button variant="danger" icon={<Trash2 />} onClick={excluir} disabled={salvando}>
                  Excluir
                </Button>
              </>
            )}
            <Button
              variant="danger"
              onClick={() => navegar('/professor/plano-ensino')}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button variant="success" icon={<Save />} loading={salvando} onClick={salvar}>
              Salvar
            </Button>
          </>
        }
      />

      {edicao && requisicaoPlano.loading ? (
        <SkeletonCartao />
      ) : (
        <>
          <Card titulo="Identificação">
            <Coluna>
              <Grade>
                <Input
                  label="Título do plano"
                  placeholder="Ex.: Robótica — 1º semestre"
                  value={titulo}
                  disabled={salvando}
                  maxLength={120}
                  onChange={(evento) => setTitulo(evento.target.value)}
                />

                <Select<number>
                  label="Curso"
                  required
                  options={opcoesCursos}
                  value={cursoId}
                  loading={requisicaoCursos.loading}
                  error={erros.cursoId}
                  searchable
                  placeholder="Selecionar curso..."
                  onChange={setCursoId}
                />

                <Select<number>
                  label="Turma e disciplina"
                  options={opcoesVinculos}
                  value={turmaDisciplinaId}
                  loading={requisicaoVinculos.loading}
                  searchable
                  clearable
                  placeholder="Selecionar turma/disciplina..."
                  hint="Opcional: vincule para que o plano apareça na turma."
                  emptyText="Você ainda não leciona em nenhuma turma"
                  onChange={setTurmaDisciplinaId}
                />

                <Input
                  label="Período letivo"
                  required
                  placeholder="Ex.: 2026 ou 2026/1"
                  value={periodo}
                  error={erros.periodo}
                  disabled={salvando}
                  maxLength={10}
                  onChange={(evento) => setPeriodo(evento.target.value)}
                />

                <Input
                  label="Carga horária"
                  type="number"
                  min={1}
                  placeholder="Ex.: 40"
                  value={cargaHoraria}
                  error={erros.cargaHoraria}
                  disabled={salvando}
                  hint="Em horas."
                  onChange={(evento) => setCargaHoraria(evento.target.value)}
                />

                <DatePicker
                  label="Início"
                  value={dataInicio}
                  disabled={salvando}
                  onChange={(evento) => setDataInicio(evento.target.value)}
                />

                <DatePicker
                  label="Término"
                  value={dataFim}
                  error={erros.dataFim}
                  disabled={salvando}
                  onChange={(evento) => setDataFim(evento.target.value)}
                />
              </Grade>

              <Toggle
                ligado={ativo}
                onChange={setAtivo}
                label="Situação"
                textoLigado="Ativo"
                textoDesligado="Inativo"
                disabled={salvando}
              />
            </Coluna>
          </Card>

          <Card titulo="Proposta pedagógica">
            <Coluna>
              <TextArea
                label="Ementa"
                placeholder="Resumo dos temas abordados no período..."
                value={ementa}
                disabled={salvando}
                maxLength={2000}
                rows={4}
                autoAltura
                onChange={(evento) => setEmenta(evento.target.value)}
              />

              <TextArea
                label="Objetivo geral"
                placeholder="O que o aluno deve ser capaz de fazer ao final..."
                value={objetivoGeral}
                disabled={salvando}
                maxLength={2000}
                rows={3}
                autoAltura
                onChange={(evento) => setObjetivoGeral(evento.target.value)}
              />

              <TextArea
                label="Metodologia"
                placeholder="Estratégias, recursos e forma de avaliação..."
                value={metodologia}
                disabled={salvando}
                maxLength={2000}
                rows={3}
                autoAltura
                onChange={(evento) => setMetodologia(evento.target.value)}
              />
            </Coluna>
          </Card>
        </>
      )}
    </Layout>
  )
}
