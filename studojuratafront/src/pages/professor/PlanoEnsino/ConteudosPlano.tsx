import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { ListTree, Pencil, Plus, Trash2, Upload } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { BuscaInput } from '../../../components/ui/BuscaInput'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { Tag } from '../../../components/ui/Tag'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useDebounce } from '../../../hooks/useDebounce'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { conteudosPlano, planosEnsino } from '../../../services/endpoints'
import { normalizar } from '../../../utils/format'
import type { ConteudoPlano } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

/* Confirmado no Figma: "Adicionar conteúdo" + "Importar conteúdo" (150px
   cada) + busca (250px) na mesma linha, coladas. */
const CamposCabecalho = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  width: fit-content;
  max-width: 100%;
  overflow-x: auto;
`

const LarguraBusca = styled.div`
  width: 250px;
`

export default function ConteudosPlano() {
  const { planoId } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const idPlano = Number(planoId)

  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)

  const requisicaoPlano = useRequisicao(() => planosEnsino.buscar(idPlano), [idPlano])
  const requisicaoConteudos = useRequisicao(() => conteudosPlano.listar(), [])

  const conteudos = useMemo(
    () =>
      (requisicaoConteudos.data ?? [])
        .filter((conteudo) => conteudo.planoEnsino?.id === idPlano)
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)),
    [requisicaoConteudos.data, idPlano],
  )

  const filtrados = useMemo(() => {
    if (!buscaAtrasada.trim()) return conteudos

    const termo = normalizar(buscaAtrasada)
    return conteudos.filter(
      (conteudo) => normalizar(conteudo.titulo).includes(termo) || normalizar(conteudo.descricao).includes(termo),
    )
  }, [conteudos, buscaAtrasada])

  const { executar: excluir, executando: excluindo } = useAcao(async (conteudo: ConteudoPlano) => {
    await confirmar({
      titulo: 'Excluir conteúdo?',
      descricao: `"${conteudo.titulo}" será desativado. Aulas que já o referenciam continuam válidas.`,
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await conteudosPlano.excluir(conteudo.id)
          toast.success('Conteúdo excluído')
          await requisicaoConteudos.reload()
        } catch (erroExclusao) {
          toast.error(
            'Não foi possível excluir',
            erroExclusao instanceof ApiError ? erroExclusao.message : undefined,
          )
        }
      },
    })
  })

  const colunas: Coluna<ConteudoPlano>[] = [
    {
      key: 'ordem',
      cabecalho: 'Ordem',
      largura: '80px',
      alinhamento: 'center',
      render: (conteudo) => <Tag variant="purple">{conteudo.ordem ?? '—'}</Tag>,
    },
    {
      key: 'titulo',
      cabecalho: 'Título',
      render: (conteudo) => conteudo.titulo ?? '—',
    },
    {
      key: 'descricao',
      cabecalho: 'Descrição',
      ocultarEmTelaPequena: true,
      render: (conteudo) => (
        <span
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {conteudo.descricao ?? '—'}
        </span>
      ),
    },
  ]

  if (requisicaoPlano.error) {
    return (
      <Layout>
        <Header titulo="Conteúdo do Plano de Ensino" voltarPara="/professor/plano-ensino" />
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
        titulo="Conteúdo do Plano de Ensino"
        subtitulo={
          requisicaoPlano.data && (
            <>
              <strong>{requisicaoPlano.data.titulo ?? `Plano #${requisicaoPlano.data.id}`}</strong>
              <Tag variant="neutral">{requisicaoPlano.data.periodoLetivo}</Tag>
            </>
          )
        }
        voltarPara="/professor/plano-ensino"
        rotuloVoltar="Voltar para planos de ensino"
        filtros={
          <CamposCabecalho>
            <Button icon={<Plus />} size="large" onClick={() => navegar(`/professor/plano-ensino/${idPlano}/conteudos/novo`)}>
              Adicionar conteúdo
            </Button>

            <Button icon={<Upload />} size="large" variant="secondary" disabled title="Em breve">
              Importar conteúdo
            </Button>

            <LarguraBusca>
              <BuscaInput value={busca} onChange={setBusca} placeholder="Buscar conteúdo..." />
            </LarguraBusca>
          </CamposCabecalho>
        }
      />

      <Card semPadding>
        <DataTable
          descricao="Conteúdos do plano de ensino"
          columns={colunas}
          data={filtrados}
          rowKey={(conteudo) => conteudo.id}
          loading={requisicaoConteudos.loading}
          error={requisicaoConteudos.error}
          onReload={requisicaoConteudos.reload}
          empty={{
            titulo: busca ? 'Nenhum conteúdo encontrado' : 'Nenhum conteúdo cadastrado',
            descricao: busca
              ? 'Revise o termo buscado ou limpe o filtro.'
              : 'Os conteúdos organizam o plano em unidades e alimentam a geração de questões pela IA.',
            icon: <ListTree />,
            acao: !busca && (
              <Button icon={<Plus />} onClick={() => navegar(`/professor/plano-ensino/${idPlano}/conteudos/novo`)}>
                Adicionar conteúdo
              </Button>
            ),
          }}
          actions={(conteudo) => (
            <>
              <Button
                variant="subtle"
                size="small"
                icon={<Pencil />}
                disabled={excluindo}
                onClick={() => navegar(`/professor/plano-ensino/${idPlano}/conteudos/${conteudo.id}`)}
              >
                Editar
              </Button>
              <Button
                variant="subtle"
                size="small"
                icon={<Trash2 />}
                disabled={excluindo}
                onClick={() => excluir(conteudo)}
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
