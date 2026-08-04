import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Save, Trash2 } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Header } from '../../../components/ui/Header'
import { Input } from '../../../components/ui/Input'
import { TextArea } from '../../../components/ui/TextArea'
import { Toggle } from '../../../components/ui/Toggle'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useEscola } from '../../../hooks/useEscola'
import { useHidratar } from '../../../hooks/useHidratar'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { cursos as servicoCursos } from '../../../services/endpoints'

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const Grade = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`

export default function CursoFormulario() {
  const { id } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()
  const { escola, loading: carregandoEscola } = useEscola()

  const edicao = Boolean(id)
  const cursoId = id ? Number(id) : null

  const [nome, setNome] = useState('')
  const [cargaHoraria, setCargaHoraria] = useState('')
  const [descricao, setDescricao] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [erros, setErros] = useState<{ nome?: string; cargaHoraria?: string }>({})
  const [salvando, setSalvando] = useState(false)

  const requisicao = useRequisicao(() => servicoCursos.buscar(cursoId as number), [cursoId], {
    ativo: Boolean(cursoId),
  })

  useHidratar(requisicao.data, (curso) => {
    setNome(curso.nome ?? '')
    setCargaHoraria(curso.cargaHorariaTotal?.toString() ?? '')
    setDescricao(curso.descricao ?? '')
    setAtivo(curso.status !== 'INATIVO')
  })

  function validar() {
    const encontrados: typeof erros = {}

    // Curso.nome é @Column(nullable = false).
    if (!nome.trim()) encontrados.nome = 'Informe o nome do curso'

    if (cargaHoraria && (!Number.isFinite(Number(cargaHoraria)) || Number(cargaHoraria) <= 0)) {
      encontrados.cargaHoraria = 'Informe um número de horas maior que zero'
    }

    setErros(encontrados)
    return Object.keys(encontrados).length === 0
  }

  async function salvar() {
    if (!validar()) return

    if (!escola) {
      toast.error('Escola não encontrada', 'Cadastre uma escola antes de criar cursos.')
      return
    }

    setSalvando(true)

    try {
      const corpo = {
        escola,
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        cargaHorariaTotal: cargaHoraria ? Number(cargaHoraria) : undefined,
        status: ativo ? ('ATIVO' as const) : ('INATIVO' as const),
      }

      if (edicao) {
        await servicoCursos.atualizar(cursoId as number, corpo)
      } else {
        await servicoCursos.criar(corpo)
      }

      toast.success(edicao ? 'Curso atualizado' : 'Curso cadastrado', nome.trim())
      navegar('/adm/cursos')
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
    if (!cursoId) return

    const confirmado = await confirmar({
      titulo: 'Excluir curso?',
      descricao: 'Turmas e planos de ensino já vinculados continuam existindo.',
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
    })

    if (!confirmado) return

    try {
      await servicoCursos.excluir(cursoId)
      toast.success('Curso excluído')
      navegar('/adm/cursos')
    } catch (erroExclusao) {
      toast.error(
        'Não foi possível excluir',
        erroExclusao instanceof ApiError ? erroExclusao.message : undefined,
      )
    }
  }

  if (edicao && requisicao.error) {
    return (
      <Layout>
        <Header titulo="Curso" voltarPara="/adm/cursos" />
        <ErroCarregamento mensagem={requisicao.error} onRetry={requisicao.reload} />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo={edicao ? 'Editar curso' : 'Novo curso'}
        voltarPara="/adm/cursos"
        rotuloVoltar="Voltar para cursos"
        actions={
          <>
            {edicao && (
              <Button variant="danger" icon={<Trash2 />} onClick={excluir} disabled={salvando}>
                Excluir
              </Button>
            )}
            <Button variant="danger" onClick={() => navegar('/adm/cursos')} disabled={salvando}>
              Cancelar
            </Button>
            <Button
              variant="success"
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

      {edicao && requisicao.loading ? (
        <SkeletonCartao />
      ) : (
        <Card titulo="Dados do curso">
          <Coluna>
            <Grade>
              <Input
                label="Nome do curso"
                required
                placeholder="Ex.: Geek Júnior"
                value={nome}
                error={erros.nome}
                disabled={salvando}
                maxLength={120}
                onChange={(evento) => setNome(evento.target.value)}
              />

              <Input
                label="Carga horária total"
                type="number"
                min={1}
                placeholder="Ex.: 80"
                value={cargaHoraria}
                error={erros.cargaHoraria}
                disabled={salvando}
                hint="Em horas."
                onChange={(evento) => setCargaHoraria(evento.target.value)}
              />
            </Grade>

            <TextArea
              label="Descrição"
              placeholder="Descreva o objetivo e o público do curso..."
              value={descricao}
              disabled={salvando}
              maxLength={500}
              rows={4}
              onChange={(evento) => setDescricao(evento.target.value)}
            />

            <Toggle
              ligado={ativo}
              onChange={setAtivo}
              label="Situação"
              textoLigado="Ativo"
              textoDesligado="Inativo"
              descricao="Cursos inativos não aparecem na criação de novas turmas."
              disabled={salvando}
            />
          </Coluna>
        </Card>
      )}
    </Layout>
  )
}
