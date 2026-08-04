import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Save, Trash2 } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Header } from '../../../components/ui/Header'
import { Input } from '../../../components/ui/Input'
import { TextArea } from '../../../components/ui/TextArea'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useHidratar } from '../../../hooks/useHidratar'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { aulas as servicoAulas, planosAula } from '../../../services/endpoints'

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

  const [ordem, setOrdem] = useState('')
  const [titulo, setTitulo] = useState('')
  const [dataPrevista, setDataPrevista] = useState('')
  const [cargaHoraria, setCargaHoraria] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [erros, setErros] = useState<Record<string, string | undefined>>({})
  const [salvando, setSalvando] = useState(false)

  const requisicaoPlano = useRequisicao(() => planosAula.buscar(idPlano), [idPlano])
  const requisicaoAula = useRequisicao(() => servicoAulas.buscar(idAula as number), [idAula], {
    ativo: Boolean(idAula),
  })
  const requisicaoAulas = useRequisicao(() => servicoAulas.listarPorPlanoAula(idPlano), [idPlano])

  useHidratar(requisicaoAula.data, (aula) => {
    setOrdem(aula.ordem?.toString() ?? '')
    setTitulo(aula.titulo ?? '')
    setDataPrevista(aula.dataPrevista?.slice(0, 10) ?? '')
    setCargaHoraria(aula.cargaHoraria?.toString() ?? '')
    setObservacoes(aula.observacoes ?? '')
  })

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

    if (cargaHoraria && (!Number.isFinite(Number(cargaHoraria)) || Number(cargaHoraria) <= 0)) {
      encontrados.cargaHoraria = 'Informe um número de horas maior que zero'
    }

    // Ordem duplicada confunde a sequência exibida na listagem.
    const duplicada = (requisicaoAulas.data ?? []).some(
      (aula) => aula.ordem === Number(ordemExibida) && aula.id !== idAula && aula.status !== 'INATIVO',
    )

    if (ordemExibida && duplicada) encontrados.ordem = 'Já existe uma aula com esta ordem'

    setErros(encontrados)
    return Object.keys(encontrados).filter((chave) => encontrados[chave]).length === 0
  }

  async function salvar() {
    if (!validar() || !requisicaoPlano.data) return

    setSalvando(true)

    try {
      const corpo = {
        planoAula: requisicaoPlano.data,
        titulo: titulo.trim(),
        ordem: ordemExibida ? Number(ordemExibida) : undefined,
        dataPrevista: dataPrevista || undefined,
        cargaHoraria: cargaHoraria ? Number(cargaHoraria) : undefined,
        observacoes: observacoes.trim() || undefined,
        status: 'ATIVO' as const,
      }

      if (edicao) {
        await servicoAulas.atualizar(idAula as number, corpo)
      } else {
        await servicoAulas.criar(corpo)
      }

      toast.success(edicao ? 'Aula atualizada' : 'Aula criada', corpo.titulo)
      navegar(`/professor/plano-aula/${idPlano}/aulas`)
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
    if (!idAula) return

    const confirmado = await confirmar({
      titulo: 'Excluir aula?',
      descricao: 'Frequências e conteúdos já registrados são preservados.',
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
    })

    if (!confirmado) return

    try {
      await servicoAulas.excluir(idAula)
      toast.success('Aula excluída')
      navegar(`/professor/plano-aula/${idPlano}/aulas`)
    } catch (erroExclusao) {
      toast.error(
        'Não foi possível excluir',
        erroExclusao instanceof ApiError ? erroExclusao.message : undefined,
      )
    }
  }

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
        subtitulo={requisicaoPlano.data?.turmaDisciplina?.turma?.titulo}
        voltarPara={`/professor/plano-aula/${idPlano}/aulas`}
        rotuloVoltar="Voltar para as aulas"
        actions={
          <>
            {edicao && (
              <Button variant="danger" icon={<Trash2 />} onClick={excluir} disabled={salvando}>
                Excluir
              </Button>
            )}
            <Button
              variant="danger"
              onClick={() => navegar(`/professor/plano-aula/${idPlano}/aulas`)}
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

      {edicao && requisicaoAula.loading ? (
        <SkeletonCartao />
      ) : (
        <Card
          titulo="Dados da aula"
          actions={
            <span style={{ fontSize: '12px', color: '#737373' }}>
              O conteúdo e a chamada são registrados na tela da aula.
            </span>
          }
        >
          <Coluna>
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

              <DatePicker
                label="Data prevista"
                value={dataPrevista}
                disabled={salvando}
                onChange={(evento) => setDataPrevista(evento.target.value)}
              />

              <Input
                label="Carga horária"
                type="number"
                min={1}
                placeholder="Ex.: 2"
                value={cargaHoraria}
                error={erros.cargaHoraria}
                disabled={salvando}
                hint="Em horas."
                onChange={(evento) => setCargaHoraria(evento.target.value)}
              />
            </Grade>

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
          </Coluna>
        </Card>
      )}
    </Layout>
  )
}
