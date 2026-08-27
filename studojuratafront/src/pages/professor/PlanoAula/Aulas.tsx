import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { BarChart3, CalendarPlus, ClipboardList, Pencil, Plus, Trash2 } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { BuscaInput } from '../../../components/ui/BuscaInput'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { Tag } from '../../../components/ui/Tag'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { Skeleton } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useDebounce } from '../../../hooks/useDebounce'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { aulas as servicoAulas, planosAula } from '../../../services/endpoints'
import { formatarCargaHoraria, formatarData, normalizar } from '../../../utils/format'
import type { Aula, AulaConteudo } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

/* Confirmado no Figma: "Adicionar aula" (150px) + busca (250px) coladas. */
const CamposCabecalho = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`

const LarguraBusca = styled.div`
  width: 250px;
`

/* Confirmado no Figma (node 1:1953): as duas estatísticas ficam lado a lado
   dentro do corpo tintado do Card (corpoComFundo). */
const CorpoEstatisticas = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.xl};
`

/* Cartão de estatística sem ícone (diferente do InfoCard genérico): rótulo em
   cima, valor grande centralizado embaixo — confirmado no Figma (nós 1:1954
   e 1:1959), específico desta tela. */
const Estatistica = styled.article`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  align-items: center;
  min-width: 0;

  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.08);
`

const EstatisticaConteudo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
`

const EstatisticaLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textSecondary};
  letter-spacing: -0.8px;
`

const EstatisticaValorBox = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.radius.sm};
`

const EstatisticaValor = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.title};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.textSecondary};
  letter-spacing: -1.6px;
  white-space: nowrap;
`

const EstatisticaValorSufixo = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
`

const ListaConteudos = styled.ul`
  margin: 0;
  padding-left: ${({ theme }) => theme.spacing.md};
`

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

  const aulasAtivas = useMemo(
    () =>
      (requisicaoAulas.data ?? [])
        .filter((aula) => aula.status !== 'INATIVO')
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)),
    [requisicaoAulas.data],
  )

  // Conteúdos vinculados de cada aula — pra montar a coluna "Conteúdo" da
  // tabela (bullet list), uma busca por aula ativa.
  const requisicaoConteudosPorAula = useRequisicao(
    async () => {
      const listas = await Promise.all(aulasAtivas.map((aula) => servicoAulas.listarConteudos(aula.id)))
      return new Map<number, AulaConteudo[]>(aulasAtivas.map((aula, indice) => [aula.id, listas[indice]]))
    },
    [aulasAtivas],
    { ativo: aulasAtivas.length > 0 },
  )

  const filtradas = useMemo(() => {
    if (!buscaAtrasada.trim()) return aulasAtivas

    const termo = normalizar(buscaAtrasada)
    return aulasAtivas.filter(
      (aula) => normalizar(aula.titulo).includes(termo) || String(aula.ordem ?? '').includes(termo),
    )
  }, [aulasAtivas, buscaAtrasada])

  const totalAulas = aulasAtivas.length
  const ministradas = aulasAtivas.filter((aula) => aula.dataPublicacao).length
  const cargaHorariaRealizada = requisicaoEstatisticas.data?.cargaHorariaRealizada

  const { executar: excluir, executando: excluindo } = useAcao(async (aula: Aula) => {
    await confirmar({
      titulo: 'Excluir aula?',
      descricao: 'A aula será desativada. Frequências e conteúdos já registrados são preservados.',
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
      aoConfirmar: async () => {
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
      },
    })
  })

  const colunas: Coluna<Aula>[] = [
    {
      key: 'dataPrevista',
      cabecalho: 'Data prevista',
      ordenavel: true,
      valorOrdenacao: (aula) => aula.dataPrevista ?? '',
      render: (aula) => formatarData(aula.dataPrevista),
    },
    {
      key: 'carga',
      cabecalho: 'Qt. horários',
      alinhamento: 'center',
      render: (aula) => formatarCargaHoraria(aula.cargaHoraria),
    },
    {
      key: 'conteudo',
      cabecalho: 'Conteúdo',
      ocultarEmTelaPequena: true,
      render: (aula) => {
        const vinculos = requisicaoConteudosPorAula.data?.get(aula.id) ?? []
        if (vinculos.length === 0) return '—'

        return (
          <ListaConteudos>
            {vinculos.map((vinculo) => (
              <li key={vinculo.id}>{vinculo.conteudoPlano?.titulo ?? 'Conteúdo'}</li>
            ))}
          </ListaConteudos>
        )
      },
    },
    {
      key: 'titulo',
      cabecalho: 'Título',
      render: (aula) => aula.titulo ?? `Aula ${aula.ordem ?? aula.id}`,
    },
    {
      key: 'dataRealizacao',
      cabecalho: 'Data realização',
      ordenavel: true,
      valorOrdenacao: (aula) => aula.dataPublicacao ?? '',
      render: (aula) =>
        aula.dataPublicacao ? (
          formatarData(aula.dataPublicacao)
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
        titulo="Aulas"
        subtitulo={
          plano && (
            <>
              <strong>{plano.turmaDisciplina?.turma?.titulo}</strong>
              <Tag variant="purple">{plano.turmaDisciplina?.disciplina?.titulo}</Tag>
            </>
          )
        }
        voltarPara="/professor/plano-aula"
        rotuloVoltar="Voltar para planos de aula"
        filtros={
          <CamposCabecalho>
            <Button icon={<Plus />} size="large" onClick={() => navegar(`/professor/plano-aula/${idPlano}/aulas/nova`)}>
              Adicionar aula
            </Button>

            <LarguraBusca>
              <BuscaInput value={busca} onChange={setBusca} placeholder="Buscar aula..." />
            </LarguraBusca>
          </CamposCabecalho>
        }
      />

      <Card titulo="Estatísticas" icon={<BarChart3 />} semPadding corpoComFundo>
        <CorpoEstatisticas>
          {requisicaoEstatisticas.loading ? (
            <>
              <Skeleton $altura="132px" $raio="8px" />
              <Skeleton $altura="132px" $raio="8px" />
            </>
          ) : (
            <>
              <Estatistica>
                <EstatisticaConteudo>
                  <EstatisticaLabel>Aulas realizadas</EstatisticaLabel>
                  <EstatisticaValorBox>
                    <EstatisticaValor>{ministradas}</EstatisticaValor>
                    <EstatisticaValorSufixo>/{totalAulas}</EstatisticaValorSufixo>
                  </EstatisticaValorBox>
                </EstatisticaConteudo>
              </Estatistica>

              <Estatistica>
                <EstatisticaConteudo>
                  <EstatisticaLabel>Carga horária realizada</EstatisticaLabel>
                  <EstatisticaValorBox>
                    <EstatisticaValor>
                      {typeof cargaHorariaRealizada === 'number'
                        ? formatarCargaHoraria(cargaHorariaRealizada)
                        : '—'}
                    </EstatisticaValor>
                  </EstatisticaValorBox>
                </EstatisticaConteudo>
              </Estatistica>
            </>
          )}
        </CorpoEstatisticas>
      </Card>

      <Card semPadding>
        <DataTable
          descricao="Aulas do plano"
          columns={colunas}
          data={filtradas}
          rowKey={(aula) => aula.id}
          loading={requisicaoAulas.loading}
          error={requisicaoAulas.error}
          onReload={requisicaoAulas.reload}
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
                icon={<CalendarPlus />}
                disabled={!plano?.turmaDisciplina?.turma?.id}
                onClick={() =>
                  navegar(
                    `/professor/turmas/${plano?.turmaDisciplina?.turma?.id}/registrar-aula` +
                      `?aulaId=${aula.id}&vinculoId=${plano?.turmaDisciplina?.id}`,
                  )
                }
              >
                Registrar
              </Button>
              <Button
                variant="subtle"
                size="small"
                icon={<Pencil />}
                disabled={excluindo}
                onClick={() => navegar(`/professor/plano-aula/${idPlano}/aulas/${aula.id}`)}
              >
                Editar
              </Button>
              <Button
                variant="subtle"
                size="small"
                icon={<Trash2 />}
                disabled={excluindo}
                onClick={() => excluir(aula)}
              >
                Excluir
              </Button>
            </>
          )}
        />
      </Card>
    </Layout>
  )
}
