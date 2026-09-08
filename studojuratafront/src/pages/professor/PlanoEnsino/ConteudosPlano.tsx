import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { BookOpen, ListTree, Pencil, Plus, Trash2, Upload } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { BuscaInput } from '../../../components/ui/BuscaInput'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { CheckBox } from '../../../components/ui/CheckBox'
import { DataTable } from '../../../components/ui/DataTable'
import { Header, SubtituloItem } from '../../../components/ui/Header'
import { Modal } from '../../../components/ui/Modal'
import { Tag } from '../../../components/ui/Tag'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { EstadoVazio } from '../../../components/feedback/EstadoVazio'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useDebounce } from '../../../hooks/useDebounce'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { aulas as servicoAulas, conteudosPlano, planosAula, planosEnsino } from '../../../services/endpoints'
import { formatarData, normalizar } from '../../../utils/format'
import type { ConteudoPlano } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

/* "Adicionar conteúdo" + "Importar conteúdo" + busca na mesma linha —
   flex-shrink:0 nos botões pra não cortar o texto quando a linha aperta
   (mesmo problema já visto em Registrar Aula). */
const CamposCabecalho = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  > button {
    flex-shrink: 0;
  }
`

const LarguraBusca = styled.div`
  width: 250px;
  flex-shrink: 0;
`

export default function ConteudosPlano() {
  const { planoId } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const idPlano = Number(planoId)

  const [busca, setBusca] = useState('')
  const buscaAtrasada = useDebounce(busca)
  const [modalImportarAberto, setModalImportarAberto] = useState(false)
  const [conteudosParaImportar, setConteudosParaImportar] = useState<Set<number>>(new Set())

  const requisicaoPlano = useRequisicao(() => planosEnsino.buscar(idPlano), [idPlano])
  const requisicaoConteudos = useRequisicao(() => conteudosPlano.listar(), [])
  const requisicaoPlanosAula = useRequisicao(() => planosAula.listar(), [])
  const requisicaoPlanosEnsino = useRequisicao(() => planosEnsino.listar(), [], { ativo: modalImportarAberto })

  const conteudos = useMemo(
    () =>
      (requisicaoConteudos.data ?? [])
        .filter((conteudo) => conteudo.planoEnsino?.id === idPlano)
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)),
    [requisicaoConteudos.data, idPlano],
  )

  // Um plano de ensino pode ter mais de um plano de aula ao longo do tempo
  // (ex.: plano anterior encerrado + um novo criado) — todos contam para
  // saber o que já foi ministrado, não só o ativo.
  const planosAulaDoEnsino = useMemo(
    () => (requisicaoPlanosAula.data ?? []).filter((plano) => plano.planoEnsino?.id === idPlano),
    [requisicaoPlanosAula.data, idPlano],
  )

  const requisicaoAulasDosPlanos = useRequisicao(
    async () => {
      const listas = await Promise.all(
        planosAulaDoEnsino.map((plano) => servicoAulas.listarPorPlanoAula(plano.id)),
      )
      return listas.flat()
    },
    [planosAulaDoEnsino],
    { ativo: planosAulaDoEnsino.length > 0 },
  )

  // "Conteúdo já ministrado" = tem pelo menos um vínculo com uma aula que já
  // aconteceu (dataPublicacao preenchida) — permite acompanhar o avanço do
  // plano de ensino independente de quantas aulas/planos de aula existirem.
  const requisicaoVinculosConteudo = useRequisicao(
    async () => {
      const todasAulas = requisicaoAulasDosPlanos.data ?? []
      const listas = await Promise.all(todasAulas.map((aula) => servicoAulas.listarConteudos(aula.id)))
      return listas.flat()
    },
    [requisicaoAulasDosPlanos.data],
    { ativo: Boolean(requisicaoAulasDosPlanos.data) },
  )

  // Um mesmo conteúdo pode ser retomado em várias aulas (reforço, conteúdo
  // extenso dividido em mais de um encontro) — guarda todas as datas em que
  // apareceu, não só a mais recente, para não esconder esse histórico.
  const datasMinistracaoPorConteudo = useMemo(() => {
    const mapa = new Map<number, string[]>()
    for (const vinculo of requisicaoVinculosConteudo.data ?? []) {
      const dataPublicacao = vinculo.aula?.dataPublicacao
      if (!dataPublicacao) continue

      const datas = mapa.get(vinculo.conteudoPlano.id) ?? []
      datas.push(dataPublicacao)
      mapa.set(vinculo.conteudoPlano.id, datas)
    }
    for (const datas of mapa.values()) datas.sort()
    return mapa
  }, [requisicaoVinculosConteudo.data])

  const totalMinistrados = conteudos.filter((conteudo) => datasMinistracaoPorConteudo.has(conteudo.id)).length

  const filtrados = useMemo(() => {
    if (!buscaAtrasada.trim()) return conteudos

    const termo = normalizar(buscaAtrasada)
    return conteudos.filter(
      (conteudo) => normalizar(conteudo.titulo).includes(termo) || normalizar(conteudo.descricao).includes(termo),
    )
  }, [conteudos, buscaAtrasada])

  // Importar conteúdo: reaproveita conteúdos de outros planos de ensino do
  // MESMO CURSO (ex.: turmas/ciclos anteriores da mesma disciplina), pra não
  // reescrever do zero um conteúdo que já existe em outro lugar.
  const conteudosImportaveis = useMemo(() => {
    const cursoId = requisicaoPlano.data?.curso?.id
    if (!cursoId) return []

    const outrosPlanosDoCurso = new Set(
      (requisicaoPlanosEnsino.data ?? [])
        .filter((plano) => plano.curso?.id === cursoId && plano.id !== idPlano)
        .map((plano) => plano.id),
    )

    return (requisicaoConteudos.data ?? [])
      .filter(
        (conteudo) =>
          conteudo.planoEnsino?.id !== undefined &&
          outrosPlanosDoCurso.has(conteudo.planoEnsino.id) &&
          conteudo.status !== 'INATIVO',
      )
      .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
  }, [requisicaoConteudos.data, requisicaoPlanosEnsino.data, requisicaoPlano.data, idPlano])

  function alternarImportar(id: number) {
    setConteudosParaImportar((atuais) => {
      const novos = new Set(atuais)
      if (novos.has(id)) novos.delete(id)
      else novos.add(id)
      return novos
    })
  }

  const { executar: importarConteudos, executando: importando } = useAcao(async () => {
    if (!requisicaoPlano.data || conteudosParaImportar.size === 0) return

    const selecionados = conteudosImportaveis.filter((conteudo) => conteudosParaImportar.has(conteudo.id))
    let proximaOrdem = conteudos.length === 0 ? 1 : Math.max(...conteudos.map((c) => c.ordem ?? 0)) + 1

    try {
      for (const conteudo of selecionados) {
        await conteudosPlano.criar({
          planoEnsino: requisicaoPlano.data,
          titulo: conteudo.titulo,
          descricao: conteudo.descricao,
          ordem: proximaOrdem++,
          status: 'ATIVO',
        })
      }
      toast.success(
        selecionados.length === 1 ? 'Conteúdo importado' : `${selecionados.length} conteúdos importados`,
      )
      setConteudosParaImportar(new Set())
      setModalImportarAberto(false)
      await requisicaoConteudos.reload()
    } catch (erroImportar) {
      toast.error(
        'Não foi possível importar',
        erroImportar instanceof ApiError ? erroImportar.message : undefined,
      )
    }
  })

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
    {
      key: 'situacao',
      cabecalho: 'Ministrado em',
      render: (conteudo) => {
        const datas = datasMinistracaoPorConteudo.get(conteudo.id)
        if (!datas || datas.length === 0) {
          return (
            <Tag variant="warning">
              Pendente
            </Tag>
          )
        }

        // Uma tag por dia, não uma só resumida — o professor precisa ver
        // exatamente quais dias esse conteúdo foi retomado (reforço,
        // conteúdo extenso dividido em mais de um encontro), sem precisar
        // passar o mouse em cima pra descobrir.
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {datas.map((data) => (
              <Tag key={data} variant="success">
                {formatarData(data)}
              </Tag>
            ))}
          </div>
        )
      },
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
              <SubtituloItem icon={<BookOpen />}>
                Plano: {requisicaoPlano.data.titulo ?? `Plano #${requisicaoPlano.data.id}`}
              </SubtituloItem>
              {conteudos.length > 0 && (
                <SubtituloItem icon={<ListTree />}>
                  Progresso: {totalMinistrados}/{conteudos.length} conteúdos já ministrados
                </SubtituloItem>
              )}
            </>
          )
        }
        voltarPara="/professor/plano-ensino"
        rotuloVoltar="Planos de ensino"
        filtros={
          <CamposCabecalho>
            <Button icon={<Plus />} size="large" onClick={() => navegar(`/professor/plano-ensino/${idPlano}/conteudos/novo`)}>
              Adicionar conteúdo
            </Button>

            <Button
              icon={<Upload />}
              size="large"
              variant="secondary"
              onClick={() => setModalImportarAberto(true)}
            >
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

      <Modal
        aberto={modalImportarAberto}
        onClose={() => {
          setModalImportarAberto(false)
          setConteudosParaImportar(new Set())
        }}
        titulo="Importar conteúdo"
        descricao="Reaproveite conteúdos já cadastrados em outros planos de ensino do mesmo curso."
        largura="600px"
        rodape={
          <>
            <Button variant="secondary" onClick={() => setModalImportarAberto(false)}>
              Cancelar
            </Button>
            <Button
              variant="success"
              loading={importando}
              disabled={conteudosParaImportar.size === 0}
              onClick={importarConteudos}
            >
              Importar
            </Button>
          </>
        }
      >
        {conteudosImportaveis.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum conteúdo pra importar"
            descricao="Não há conteúdos cadastrados em outros planos de ensino deste curso ainda."
            icon={<Upload />}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {conteudosImportaveis.map((conteudo) => (
              <CheckBox
                key={conteudo.id}
                label={`${conteudo.titulo ?? 'Conteúdo'} (${conteudo.planoEnsino?.titulo ?? `Plano #${conteudo.planoEnsino?.id}`})`}
                checked={conteudosParaImportar.has(conteudo.id)}
                onChange={() => alternarImportar(conteudo.id)}
              />
            ))}
          </div>
        )}
      </Modal>
    </Layout>
  )
}
