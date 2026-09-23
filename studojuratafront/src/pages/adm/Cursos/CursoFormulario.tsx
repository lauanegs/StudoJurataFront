import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Archive, ArchiveRestore, Plus, Save } from 'lucide-react'

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
import { Stack } from '../../../components/ui/Stack'
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
} from '../../../services/curriculo'
import { formatarCargaHoraria } from '../../../utils/format'
import { useFormularioCurso, useFormularioGradeCurso } from '../../../formularios/curriculo'
import { OPCOES_ATIVO_INATIVO } from '../../../utils/labels'
import type { StatusAtivoInativo } from '../../../types/comum'
import type { CursoDisciplina } from '../../../types/curriculo'

const Grade = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`

/* Select + Input + botão numa linha, como em TurmaFormulario. */
const LinhaVinculo = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  align-items: end;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
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
  const form = useFormularioCurso()

  const gradeForm = useFormularioGradeCurso()
  const { disciplinaId: disciplinaDaGrade, cargaHoraria: cargaHorariaDaGrade } = gradeForm.values
  const errosGrade = gradeForm.errors as Record<string, string | undefined>

  const requisicao = useRequisicao(() => servicoCursos.buscar(cursoId as number), [cursoId], {
    ativo: Boolean(cursoId),
  })
  const requisicaoDisciplinas = useRequisicao(() => servicoDisciplinas.listar(), [])
  // A grade restringe as disciplinas das turmas do curso e pré-preenche a
  // carga horária do plano de ensino.
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
    form.setValues({ nome: curso.nome ?? '', descricao: curso.descricao ?? '', ativo: curso.status !== 'INATIVO' })
    form.resetDirty()
  })

  const { executar: salvar, executando: salvando } = useAcao(async () => {
    if ((await form.validate()).hasErrors) return
    const { nome, descricao, ativo } = form.getValues()

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
        // Permanece na tela: só recarrega o que o back gravou.
        await requisicao.reload()
      } else {
        const criado = await servicoCursos.criar(corpo)
        toast.success('Curso cadastrado', 'Agora defina a grade curricular.')
        // Continua no formulário, agora em modo de edição.
        navegar(`/adm/cursos/${criado.id}`, { replace: true })
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
      titulo: 'Inativar curso?',
      descricao: 'Turmas e planos de ensino já vinculados continuam existindo.',
      rotuloConfirmar: 'Inativar',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoCursos.excluir(cursoId)
          toast.success('Curso inativado')
          navegar('/adm/cursos')
        } catch (erroExclusao) {
          toast.error(
            'Não foi possível inativar',
            erroExclusao instanceof ApiError ? erroExclusao.message : undefined,
          )
        }
      },
    })
  })

  const { executar: ativar, executando: ativando } = useAcao(async () => {
    if (!cursoId) return

    await confirmar({
      titulo: 'Ativar curso?',
      descricao: 'O curso voltará a ficar ativo.',
      rotuloConfirmar: 'Ativar',
      aoConfirmar: async () => {
        try {
          await servicoCursos.ativar(cursoId)
          toast.success('Curso ativado')
          await requisicao.reload()
        } catch (erroAtivacao) {
          toast.error(
            'Não foi possível ativar',
            erroAtivacao instanceof ApiError ? erroAtivacao.message : undefined,
          )
        }
      },
    })
  })

  async function adicionarDisciplina() {
    if (!cursoId || !requisicao.data) return

    if ((await gradeForm.validate()).hasErrors || !disciplinaDaGrade) return

    const jaExiste = gradeAtiva.some((item) => item.disciplina?.id === disciplinaDaGrade)
    if (jaExiste) {
      toast.warning('Disciplina já vinculada', 'Remova o vínculo existente para trocar a carga horária.')
      return
    }

    try {
      await servicoCursoDisciplinas.criar({
        curso: requisicao.data,
        disciplina: (requisicaoDisciplinas.data ?? []).find((item) => item.id === disciplinaDaGrade),
        cargaHoraria: Number(cargaHorariaDaGrade),
        status: 'ATIVO',
      })

      toast.success('Disciplina adicionada à grade curricular')
      gradeForm.reset()
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
      titulo: 'Inativar disciplina na grade curricular?',
      descricao: 'A disciplina será inativada na grade. Turmas e planos de ensino já criados com ela continuam existindo.',
      rotuloConfirmar: 'Inativar',
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
            {edicao && requisicao.data?.status === 'INATIVO' ? (
              <Button
                variant="success"
                size="large"
                icon={<ArchiveRestore />}
                loading={ativando}
                onClick={ativar}
                disabled={salvando}
              >
                Ativar
              </Button>
            ) : edicao ? (
              <Button
                variant="danger"
                size="large"
                icon={<Archive />}
                loading={excluindo}
                onClick={excluir}
                disabled={salvando}
              >
                Inativar
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
            <Stack gap="md">
              <Grade>
                <Input
                  label="Nome do curso"
                  required
                  placeholder="Ex.: Geek Júnior"
                  {...form.getInputProps('nome')}
                  disabled={salvando}
                  maxLength={120}
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
                {...form.getInputProps('descricao')}
                disabled={salvando}
                maxLength={500}
                rows={4}
              />

              <Select<StatusAtivoInativo>
                label="Situação"
                options={OPCOES_ATIVO_INATIVO}
                value={form.values.ativo ? 'ATIVO' : 'INATIVO'}
                hint="Cursos inativos não aparecem na criação de novas turmas."
                disabled={salvando}
                onChange={(valor) => form.setFieldValue('ativo', valor !== 'INATIVO')}
              />
            </Stack>
          </Card>
          )}

          {edicao && aba === 'grade' && (
            <>
              <Card titulo="Grade curricular">
                <Stack gap="md">
                  <LinhaVinculo>
                    <Select<number>
                      label="Disciplina"
                      required
                      options={opcoesDisciplinas}
                      value={disciplinaDaGrade}
                      loading={requisicaoDisciplinas.loading}
                      error={errosGrade.disciplinaId}
                      searchable
                      placeholder="Selecionar disciplina..."
                      onChange={(value) => gradeForm.setFieldValue('disciplinaId', value)}
                    />

                    <Input
                      label="Carga horária (h)"
                      required
                      type="number"
                      min={1}
                      placeholder="Ex.: 30"
                      value={cargaHorariaDaGrade}
                      error={errosGrade.cargaHoraria}
                      onChange={(evento) => gradeForm.setFieldValue('cargaHoraria', evento.target.value)}
                    />

                    <Button size="large" icon={<Plus />} onClick={adicionarDisciplina}>
                      Adicionar
                    </Button>
                  </LinhaVinculo>
                </Stack>
              </Card>

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
                    label="Inativar disciplina na grade"
                    icon={<Archive />}
                    variant="danger"
                    onClick={() => removerDisciplina(vinculo)}
                  />
                )}
              />
            </>
          )}
        </>
      )}
    </Layout>
  )
}
