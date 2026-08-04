import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { BarChart3, CalendarCheck, ClipboardList, Pencil, Plus, Trash2 } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { BuscaInput } from '../../../components/ui/BuscaInput'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { IconButton } from '../../../components/ui/IconButton'
import { InfoCard } from '../../../components/ui/InfoCard'
import { Tag } from '../../../components/ui/Tag'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { Skeleton } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useDebounce } from '../../../hooks/useDebounce'
import { useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { aulas as servicoAulas, planosAula } from '../../../services/endpoints'
import { formatarCargaHoraria, formatarData, normalizar } from '../../../utils/format'
import type { Aula } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

const Indicadores = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

/** Formata os valores devolvidos por GET /plano-aula/{id}/estatisticas. */
function valorEstatistica(valor: unknown): string {
  if (valor === null || valor === undefined) return '—'
  if (typeof valor === 'number') return String(valor)
  return String(valor)
}

export default function Aulas() {
  const { planoAulaId } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const idPlano = Number(planoAulaId)

  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)

  const requisicaoPlano = useRequisicao(() => planosAula.buscar(idPlano), [idPlano])
  const requisicaoAulas = useRequisicao(() => servicoAulas.listarPorPlanoAula(idPlano), [idPlano])
  const requisicaoEstatisticas = useRequisicao(() => planosAula.estatisticas(idPlano), [idPlano])

  const filtradas = useMemo(() => {
    const lista = (requisicaoAulas.data ?? [])
      .filter((aula) => aula.status !== 'INATIVO')
      .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))

    if (!buscaAtrasada.trim()) return lista

    const termo = normalizar(buscaAtrasada)
    return lista.filter(
      (aula) => normalizar(aula.titulo).includes(termo) || String(aula.ordem ?? '').includes(termo),
    )
  }, [requisicaoAulas.data, buscaAtrasada])

  const estatisticas = requisicaoEstatisticas.data ?? {}

  const totalAulas = filtradas.length
  const ministradas = filtradas.filter((aula) => aula.dataPublicacao).length

  async function excluir(aula: Aula) {
    const confirmado = await confirmar({
      titulo: 'Excluir aula?',
      descricao: 'A aula será desativada. Frequências e conteúdos já registrados são preservados.',
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
    })

    if (!confirmado) return

    try {
      await servicoAulas.excluir(aula.id)
      toast.success('Aula excluída')
      await requisicaoAulas.reload()
    } catch (erroExclusao) {
      toast.error(
        'Não foi possível excluir',
        erroExclusao instanceof ApiError ? erroExclusao.message : undefined,
      )
    }
  }

  const colunas: Coluna<Aula>[] = [
    {
      key: 'ordem',
      cabecalho: '#',
      largura: '64px',
      alinhamento: 'center',
      ordenavel: true,
      valorOrdenacao: (aula) => aula.ordem ?? 0,
      render: (aula) => <Tag variant="purple">{aula.ordem ?? '—'}</Tag>,
    },
    {
      key: 'titulo',
      cabecalho: 'Título',
      render: (aula) => aula.titulo ?? `Aula ${aula.ordem ?? aula.id}`,
    },
    {
      key: 'dataPrevista',
      cabecalho: 'Data prevista',
      ordenavel: true,
      valorOrdenacao: (aula) => aula.dataPrevista ?? '',
      render: (aula) => formatarData(aula.dataPrevista),
    },
    {
      key: 'carga',
      cabecalho: 'Carga',
      ocultarEmTelaPequena: true,
      render: (aula) => formatarCargaHoraria(aula.cargaHoraria),
    },
    {
      key: 'situacao',
      cabecalho: 'Situação',
      render: (aula) =>
        aula.dataPublicacao ? (
          <Tag variant="success" ponto>
            Ministrada em {formatarData(aula.dataPublicacao)}
          </Tag>
        ) : (
          <Tag variant="neutral" ponto>
            Planejada
          </Tag>
        ),
    },
  ]

  if (requisicaoPlano.error) {
    return (
      <Layout>
        <Header titulo="Aulas" voltarPara="/professor/plano-aula" />
        <ErroCarregamento
          mensagem={requisicaoPlano.error}
          onRetry={requisicaoPlano.reload}
        />
      </Layout>
    )
  }

  const plano = requisicaoPlano.data

  return (
    <Layout>
      <Header
        titulo="Aulas do plano"
        subtitulo={
          plano && (
            <>
              <strong>{plano.turmaDisciplina?.turma?.titulo}</strong>
              <Tag variant="purple">{plano.turmaDisciplina?.disciplina?.titulo}</Tag>
              {plano.planoEnsino?.periodoLetivo && (
                <Tag variant="neutral">{plano.planoEnsino.periodoLetivo}</Tag>
              )}
            </>
          )
        }
        voltarPara="/professor/plano-aula"
        rotuloVoltar="Voltar para planos de aula"
        actions={
          <>
            <Button
              variant="secondary"
              icon={<Pencil />}
              onClick={() => navegar(`/professor/plano-aula/${idPlano}`)}
            >
              Editar plano
            </Button>
            <Button
              icon={<Plus />}
              onClick={() => navegar(`/professor/plano-aula/${idPlano}/aulas/nova`)}
            >
              Adicionar aula
            </Button>
          </>
        }
        filtros={<BuscaInput value={busca} onChange={setBusca} placeholder="Buscar aula..." />}
      />

      {requisicaoEstatisticas.loading ? (
        <Indicadores>
          <Skeleton $altura="80px" $raio="16px" />
          <Skeleton $altura="80px" $raio="16px" />
        </Indicadores>
      ) : (
        <Indicadores>
          <InfoCard
            value={`${ministradas}/${totalAulas}`}
            label="aulas ministradas"
            icon={<CalendarCheck />}
            tone="success"
          />

          {Object.entries(estatisticas)
            .filter(([chave]) => chave !== 'aulasRealizadas' && chave !== 'totalAulas')
            .slice(0, 3)
            .map(([chave, valor]) => (
              <InfoCard
                key={chave}
                value={valorEstatistica(valor)}
                label={rotuloEstatistica(chave)}
                icon={<BarChart3 />}
                tone="blue"
              />
            ))}
        </Indicadores>
      )}

      <Card semPadding>
        <DataTable
          descricao="Aulas do plano"
          columns={colunas}
          data={filtradas}
          rowKey={(aula) => aula.id}
          loading={requisicaoAulas.loading}
          error={requisicaoAulas.error}
          onReload={requisicaoAulas.reload}
          onRowClick={(aula) => navegar(`/professor/aulas/${aula.id}/registrar`)}
          empty={{
            titulo: busca ? 'Nenhuma aula encontrada' : 'Nenhuma aula cadastrada',
            descricao: busca
              ? 'Revise o termo buscado ou limpe o filtro.'
              : 'Cadastre as aulas previstas para poder registrar chamada e conteúdo.',
            icon: <ClipboardList />,
            acao: !busca && (
              <Button
                icon={<Plus />}
                onClick={() => navegar(`/professor/plano-aula/${idPlano}/aulas/nova`)}
              >
                Adicionar aula
              </Button>
            ),
          }}
          actions={(aula) => (
            <>
              <Button
                variant="subtle"
                size="small"
                onClick={() => navegar(`/professor/aulas/${aula.id}/registrar`)}
              >
                Registrar
              </Button>
              <IconButton
                label="Editar aula"
                icon={<Pencil />}
                onClick={() => navegar(`/professor/plano-aula/${idPlano}/aulas/${aula.id}`)}
              />
              <IconButton
                label="Excluir aula"
                icon={<Trash2 />}
                variant="danger"
                onClick={() => excluir(aula)}
              />
            </>
          )}
        />
      </Card>
    </Layout>
  )
}

/** Converte a chave crua do Map do back em um rótulo legível. */
function rotuloEstatistica(chave: string): string {
  const mapa: Record<string, string> = {
    cargaHorariaRealizada: 'carga horária realizada',
    cargaHorariaPrevista: 'carga horária prevista',
    aulasPrevistas: 'aulas previstas',
    percentualConcluido: '% concluído',
  }

  return mapa[chave] ?? chave.replace(/([A-Z])/g, ' $1').toLowerCase()
}
