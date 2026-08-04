import { useMemo, useState } from 'react'
import styled from 'styled-components'
import { NotebookPen, RefreshCcw } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Tag } from '../../../components/ui/Tag'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useProfessorLogado } from '../../../hooks/usePerfilLogado'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { matriculas, notas as servicoNotas, professores } from '../../../services/endpoints'
import { formatarNota } from '../../../utils/format'
import type { Nota } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

const Filtros = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  align-items: end;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
`

interface LinhaNota {
  alunoId: number
  alunoNome: string
  nota: Nota | null
}

/**
 * Notas por turma/disciplina.
 *
 * Nota é sempre derivada dos simulados concluídos: o back removeu o POST/PUT
 * de total livre e só expõe POST /notas/recalcular. A tela reflete isso — não
 * há campo editável de nota, apenas o recálculo.
 */
export default function Notas() {
  const toast = useToast()
  const confirmar = useConfirm()
  const { professorId } = useProfessorLogado()

  const [turmaDisciplinaEscolhida, setTurmaDisciplinaId] = useState<number | null>(null)
  const [periodo, setPeriodo] = useState('')
  const [recalculando, setRecalculando] = useState(false)

  const requisicaoVinculos = useRequisicao(
    () => professores.turmasLecionadas(professorId as number),
    [professorId],
    { ativo: Boolean(professorId) },
  )

  const turmaDisciplinaId =
    turmaDisciplinaEscolhida ?? requisicaoVinculos.data?.[0]?.id ?? null

  const vinculo = useMemo(
    () => (requisicaoVinculos.data ?? []).find((item) => item.id === turmaDisciplinaId) ?? null,
    [requisicaoVinculos.data, turmaDisciplinaId],
  )

  const turmaId = vinculo?.turma?.id ?? null
  const disciplinaId = vinculo?.disciplina?.id ?? null

  const requisicaoMatriculas = useRequisicao(
    () => matriculas.ativosPorTurma(turmaId as number),
    [turmaId],
    { ativo: Boolean(turmaId) },
  )

  const requisicaoNotas = useRequisicao(() => servicoNotas.listar(), [])

  const opcoesVinculos = useMemo(
    () =>
      (requisicaoVinculos.data ?? []).map((item) => ({
        value: item.id,
        label: `${item.turma?.titulo ?? 'Turma'} · ${item.disciplina?.titulo ?? 'Disciplina'}`,
      })),
    [requisicaoVinculos.data],
  )

  const linhas = useMemo<LinhaNota[]>(() => {
    const alunos = requisicaoMatriculas.data ?? []
    const todasNotas = requisicaoNotas.data ?? []

    return alunos.map((matricula) => {
      const nota =
        todasNotas.find(
          (item) =>
            item.aluno?.id === matricula.aluno?.id &&
            item.disciplina?.id === disciplinaId &&
            (!periodo.trim() || item.periodoLetivo === periodo.trim()),
        ) ?? null

      return {
        alunoId: matricula.aluno.id,
        alunoNome: matricula.aluno?.pessoa?.nome ?? `Aluno ${matricula.aluno.id}`,
        nota,
      }
    })
  }, [requisicaoMatriculas.data, requisicaoNotas.data, disciplinaId, periodo])

  const media = useMemo(() => {
    const comNota = linhas.filter((linha) => typeof linha.nota?.total === 'number')
    if (comNota.length === 0) return null

    const soma = comNota.reduce((total, linha) => total + (linha.nota?.total ?? 0), 0)
    return soma / comNota.length
  }, [linhas])

  async function recalcular(alunoId?: number) {
    if (!disciplinaId) {
      toast.warning('Selecione a turma e a disciplina')
      return
    }

    if (!periodo.trim()) {
      toast.warning('Informe o período letivo', 'O recálculo é sempre por período (ex.: 2026/1).')
      return
    }

    const alvos = alunoId ? [alunoId] : linhas.map((linha) => linha.alunoId)

    if (!alunoId) {
      const confirmado = await confirmar({
        titulo: 'Recalcular notas da turma?',
        descricao: `As notas de ${alvos.length} aluno(s) serão recalculadas a partir dos simulados concluídos no período ${periodo.trim()}.`,
        rotuloConfirmar: 'Recalcular',
      })

      if (!confirmado) return
    }

    setRecalculando(true)

    try {
      await Promise.all(
        alvos.map((id) => servicoNotas.recalcular(id, disciplinaId, periodo.trim())),
      )

      toast.success(
        'Notas recalculadas',
        `${alvos.length} aluno(s) atualizados com base nos simulados concluídos.`,
      )
      await requisicaoNotas.reload()
    } catch (erroRecalcular) {
      toast.error(
        'Não foi possível recalcular',
        erroRecalcular instanceof ApiError ? erroRecalcular.message : undefined,
      )
    } finally {
      setRecalculando(false)
    }
  }

  const colunas: Coluna<LinhaNota>[] = [
    {
      key: 'aluno',
      cabecalho: 'Aluno',
      ordenavel: true,
      valorOrdenacao: (linha) => linha.alunoNome,
      render: (linha) => linha.alunoNome,
    },
    {
      key: 'nota',
      cabecalho: 'Nota total',
      alinhamento: 'center',
      ordenavel: true,
      valorOrdenacao: (linha) => linha.nota?.total ?? -1,
      render: (linha) =>
        typeof linha.nota?.total === 'number' ? (
          <Tag
            variant={
              linha.nota.total >= 7 ? 'success' : linha.nota.total >= 5 ? 'warning' : 'error'
            }
          >
            {formatarNota(linha.nota.total)}
          </Tag>
        ) : (
          <Tag variant="neutral">Sem nota</Tag>
        ),
    },
    {
      key: 'simulados',
      cabecalho: 'Simulados considerados',
      alinhamento: 'center',
      ocultarEmTelaPequena: true,
      render: (linha) => linha.nota?.quantidadeSimuladosConsiderados ?? '—',
    },
    {
      key: 'periodo',
      cabecalho: 'Período',
      ocultarEmTelaPequena: true,
      render: (linha) => linha.nota?.periodoLetivo ?? '—',
    },
  ]

  if (requisicaoVinculos.error) {
    return (
      <Layout>
        <Header titulo="Notas" />
        <ErroCarregamento
          mensagem={requisicaoVinculos.error}
          onRetry={requisicaoVinculos.reload}
        />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo="Notas"
        subtitulo={
          media !== null ? (
            <>
              <span>Média da turma</span>
              <Tag variant={media >= 7 ? 'success' : media >= 5 ? 'warning' : 'error'}>
                {formatarNota(media)}
              </Tag>
            </>
          ) : undefined
        }
        actions={
          <Button
            icon={<RefreshCcw />}
            loading={recalculando}
            disabled={!turmaDisciplinaId || linhas.length === 0}
            onClick={() => recalcular()}
          >
            Recalcular turma
          </Button>
        }
        filtros={
          <Filtros>
            <Select<number>
              label="Turma e disciplina"
              options={opcoesVinculos}
              value={turmaDisciplinaId}
              loading={requisicaoVinculos.loading}
              searchable
              placeholder="Selecionar..."
              emptyText="Você ainda não leciona em nenhuma turma"
              onChange={setTurmaDisciplinaId}
            />

            <Input
              label="Período letivo"
              placeholder="Ex.: 2026/1"
              value={periodo}
              maxLength={10}
              hint="Obrigatório para recalcular."
              onChange={(evento) => setPeriodo(evento.target.value)}
            />
          </Filtros>
        }
      />

      <Card
        semPadding
        actions={
          <span style={{ fontSize: '12px', color: '#737373' }}>
            A nota é derivada automaticamente dos simulados concluídos — não há lançamento manual.
          </span>
        }
        titulo={vinculo ? `${vinculo.turma?.titulo} · ${vinculo.disciplina?.titulo}` : 'Selecione uma turma'}
      >
        <DataTable
          descricao="Notas dos alunos"
          columns={colunas}
          data={linhas}
          rowKey={(linha) => linha.alunoId}
          loading={requisicaoMatriculas.loading || requisicaoNotas.loading}
          error={requisicaoNotas.error}
          onReload={requisicaoNotas.reload}
          empty={{
            titulo: turmaDisciplinaId ? 'Nenhum aluno matriculado' : 'Selecione uma turma',
            descricao: turmaDisciplinaId
              ? 'A secretaria precisa matricular alunos nesta turma.'
              : 'Escolha a turma e a disciplina para ver as notas.',
            icon: <NotebookPen />,
          }}
          actions={(linha) => (
            <Button
              variant="subtle"
              size="small"
              icon={<RefreshCcw />}
              disabled={recalculando || !periodo.trim()}
              onClick={() => recalcular(linha.alunoId)}
            >
              Recalcular
            </Button>
          )}
        />
      </Card>
    </Layout>
  )
}
