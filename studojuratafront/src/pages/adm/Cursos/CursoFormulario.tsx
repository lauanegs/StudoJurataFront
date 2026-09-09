import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Plus, Save, Trash2 } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { IconButton } from '../../../components/ui/IconButton'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Tab } from '../../../components/ui/Tab'
import { TextArea } from '../../../components/ui/TextArea'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useEscola } from '../../../hooks/useEscola'
import { useHidratar } from '../../../hooks/useHidratar'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import {
  cursoDisciplinas as servicoCursoDisciplinas,
  cursos as servicoCursos,
  disciplinas as servicoDisciplinas,
} from '../../../services/endpoints'
import { formatarCargaHoraria } from '../../../utils/format'
import { OPCOES_ATIVO_INATIVO } from '../../../utils/labels'
import type { CursoDisciplina, StatusAtivoInativo } from '../../../types'

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

/* Mesmo padrão de linha de vínculo já usado em TurmaFormulario (aba
   "Disciplinas e professores"): Select + Input + botão numa linha só. */
const LinhaVinculo = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  align-items: end;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`

const DescricaoGrade = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

type Aba = 'dados' | 'grade'

export default function CursoFormulario() {
  const { id } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()
  const { escola, loading: carregandoEscola } = useEscola()

  const edicao = Boolean(id)
  const cursoId = id ? Number(id) : null

  const [aba, setAba] = useState<Aba>('dados')
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [erros, setErros] = useState<{ nome?: string }>({})

  const [novaGrade, setNovaGrade] = useState<{ disciplinaId: number | null; cargaHoraria: string }>({
    disciplinaId: null,
    cargaHoraria: '',
  })

  const requisicao = useRequisicao(() => servicoCursos.buscar(cursoId as number), [cursoId], {
    ativo: Boolean(cursoId),
  })
  const requisicaoDisciplinas = useRequisicao(() => servicoDisciplinas.listar(), [])
  // Grade curricular (pedido explícito): quais disciplinas compõem este
  // curso e a carga horária de cada uma — reaproveitada pela tela de Turma
  // (restringe o seletor às disciplinas daqui) e pelo Plano de Ensino
  // (pré-preenche a carga horária).
  const requisicaoGrade = useRequisicao(
    () => servicoCursoDisciplinas.listarPorCurso(cursoId as number),
    [cursoId],
    { ativo: Boolean(cursoId) },
  )

  const gradeAtiva = (requisicaoGrade.data ?? []).filter((item) => item.status !== 'INATIVO')

  const opcoesDisciplinas = (requisicaoDisciplinas.data ?? [])
    .filter((disciplina) => disciplina.status !== 'INATIVO')
    .map((disciplina) => ({ value: disciplina.id, label: disciplina.titulo ?? '—' }))

  useHidratar(requisicao.data, (curso) => {
    setNome(curso.nome ?? '')
    setDescricao(curso.descricao ?? '')
    setAtivo(curso.status !== 'INATIVO')
  })

  function validar() {
    const encontrados: typeof erros = {}

    // Curso.nome é @Column(nullable = false).
    if (!nome.trim()) encontrados.nome = 'Informe o nome do curso'

    setErros(encontrados)
    return Object.keys(encontrados).length === 0
  }

  const { executar: salvar, executando: salvando } = useAcao(async () => {
    if (!validar()) return

    if (!escola) {
      toast.error('Escola não encontrada', 'Cadastre uma escola antes de criar cursos.')
      return
    }

    try {
      const corpo = {
        escola,
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        status: ativo ? ('ATIVO' as const) : ('INATIVO' as const),
      }

      if (edicao) {
        await servicoCursos.atualizar(cursoId as number, corpo)
        toast.success('Curso atualizado', nome.trim())
        navegar('/adm/cursos')
      } else {
        const criado = await servicoCursos.criar(corpo)
        toast.success('Curso cadastrado', 'Agora defina a grade curricular.')
        navegar(`/adm/cursos/${criado.id}`)
      }
    } catch (erroSalvar) {
      toast.error(
        'Não foi possível salvar',
        erroSalvar instanceof ApiError ? erroSalvar.message : undefined,
      )
    }
  })

  const { executar: excluir, executando: excluindo } = useAcao(async () => {
    if (!cursoId) return

    await confirmar({
      titulo: 'Excluir curso?',
      descricao: 'Turmas e planos de ensino já vinculados continuam existindo.',
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
      aoConfirmar: async () => {
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
      },
    })
  })

  async function adicionarDisciplina() {
    if (!cursoId || !requisicao.data) return

    if (!novaGrade.disciplinaId) {
      toast.warning('Selecione a disciplina')
      return
    }

    const cargaHoraria = Number(novaGrade.cargaHoraria)
    if (!novaGrade.cargaHoraria || !Number.isFinite(cargaHoraria) || cargaHoraria <= 0) {
      toast.warning('Informe uma carga horária maior que zero')
      return
    }

    const jaExiste = gradeAtiva.some((item) => item.disciplina?.id === novaGrade.disciplinaId)
    if (jaExiste) {
      toast.warning('Disciplina já vinculada', 'Remova o vínculo existente para trocar a carga horária.')
      return
    }

    try {
      await servicoCursoDisciplinas.criar({
        curso: requisicao.data,
        disciplina: (requisicaoDisciplinas.data ?? []).find((item) => item.id === novaGrade.disciplinaId),
        cargaHoraria,
        status: 'ATIVO',
      })

      toast.success('Disciplina adicionada à grade curricular')
      setNovaGrade({ disciplinaId: null, cargaHoraria: '' })
      await Promise.all([requisicaoGrade.reload(), requisicao.reload()])
    } catch (erroVincular) {
      toast.error(
        'Não foi possível adicionar',
        erroVincular instanceof ApiError ? erroVincular.message : undefined,
      )
    }
  }

  async function removerDisciplina(vinculo: CursoDisciplina) {
    await confirmar({
      titulo: 'Remover disciplina da grade curricular?',
      descricao: 'Turmas e planos de ensino já criados com esta disciplina continuam existindo.',
      rotuloConfirmar: 'Remover',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoCursoDisciplinas.excluir(vinculo.id)
          toast.success('Disciplina removida da grade curricular')
          await Promise.all([requisicaoGrade.reload(), requisicao.reload()])
        } catch (erroRemover) {
          toast.error(
            'Não foi possível remover',
            erroRemover instanceof ApiError ? erroRemover.message : undefined,
          )
        }
      },
    })
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
        rotuloVoltar="Cursos"
        actions={
          <>
            {edicao ? (
              <Button
                variant="danger"
                size="large"
                icon={<Trash2 />}
                loading={excluindo}
                onClick={excluir}
                disabled={salvando}
              >
                Excluir
              </Button>
            ) : (
              <Button
                variant="danger"
                size="large"
                onClick={() => navegar('/adm/cursos')}
                disabled={salvando}
              >
                Cancelar
              </Button>
            )}
            <Button
              variant="success"
              size="large"
              icon={<Save />}
              loading={salvando}
              disabled={carregandoEscola || excluindo}
              onClick={salvar}
            >
              Salvar
            </Button>
          </>
        }
      />

      {edicao && (
        <Tab<Aba>
          rotuloAcessivel="Seções do curso"
          value={aba}
          onChange={setAba}
          options={[
            { value: 'dados', label: 'Dados do curso' },
            { value: 'grade', label: 'Grade curricular', contador: gradeAtiva.length },
          ]}
        />
      )}

      {edicao && requisicao.loading ? (
        <SkeletonCartao />
      ) : (
        <>
          {(!edicao || aba === 'dados') && (
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
                  value={edicao ? formatarCargaHoraria(requisicao.data?.cargaHorariaTotal ?? 0) : '—'}
                  disabled
                  hint="Soma da grade curricular abaixo."
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

              <Select<StatusAtivoInativo>
                label="Situação"
                options={OPCOES_ATIVO_INATIVO}
                value={ativo ? 'ATIVO' : 'INATIVO'}
                hint="Cursos inativos não aparecem na criação de novas turmas."
                disabled={salvando}
                onChange={(valor) => setAtivo(valor !== 'INATIVO')}
              />
            </Coluna>
          </Card>
          )}

          {edicao && aba === 'grade' && (
          <Card titulo="Grade curricular">
              <Coluna>
                <DescricaoGrade>
                  Disciplinas que compõem este curso — usadas para restringir o
                  seletor de disciplina ao vincular uma turma e para pré-preencher
                  a carga horária ao criar um plano de ensino.
                </DescricaoGrade>

                <LinhaVinculo>
                  <Select<number>
                    label="Disciplina"
                    options={opcoesDisciplinas}
                    value={novaGrade.disciplinaId}
                    loading={requisicaoDisciplinas.loading}
                    searchable
                    placeholder="Selecionar disciplina..."
                    onChange={(value) => setNovaGrade((atual) => ({ ...atual, disciplinaId: value }))}
                  />

                  <Input
                    label="Carga horária (h)"
                    type="number"
                    min={1}
                    placeholder="Ex.: 30"
                    value={novaGrade.cargaHoraria}
                    onChange={(evento) =>
                      setNovaGrade((atual) => ({ ...atual, cargaHoraria: evento.target.value }))
                    }
                  />

                  <Button size="large" icon={<Plus />} onClick={adicionarDisciplina}>
                    Adicionar
                  </Button>
                </LinhaVinculo>

                <DataTable<CursoDisciplina>
                  descricao="Disciplinas do curso"
                  columns={[
                    {
                      key: 'disciplina',
                      cabecalho: 'Disciplina',
                      render: (vinculo) => vinculo.disciplina?.titulo ?? '—',
                    },
                    {
                      key: 'cargaHoraria',
                      cabecalho: 'Carga horária',
                      render: (vinculo) => formatarCargaHoraria(vinculo.cargaHoraria),
                    },
                  ]}
                  data={gradeAtiva}
                  rowKey={(vinculo) => vinculo.id}
                  loading={requisicaoGrade.loading}
                  error={requisicaoGrade.error}
                  onReload={requisicaoGrade.reload}
                  densidade="compacta"
                  empty={{
                    titulo: 'Nenhuma disciplina na grade curricular',
                    descricao: 'Adicione as disciplinas que compõem este curso.',
                  }}
                  actions={(vinculo) => (
                    <IconButton
                      label="Remover disciplina"
                      icon={<Trash2 />}
                      variant="danger"
                      onClick={() => removerDisciplina(vinculo)}
                    />
                  )}
                />
              </Coluna>
          </Card>
          )}
        </>
      )}
    </Layout>
  )
}
