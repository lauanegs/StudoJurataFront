import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { BookOpen, CalendarPlus, CalendarRange, ClipboardCheck, ClipboardList, Clock, Pencil, Plus, Trash2, Users } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { BuscaInput } from '../../../components/ui/BuscaInput'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DataTable } from '../../../components/ui/DataTable'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Header, SubtituloItem } from '../../../components/ui/Header'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { Tag } from '../../../components/ui/Tag'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useDebounce } from '../../../hooks/useDebounce'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { aulas as servicoAulas, planosAula } from '../../../services/endpoints'
import { formatarCargaHoraria, formatarData, normalizar } from '../../../utils/format'
import type { Aula, AulaConteudo } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

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

  // Geração em lote (pedido explícito: gerar de uma vez, no início do
  // curso, em vez de cadastrar aula por aula) — segue os horários já
  // cadastrados na turma (HorarioTurma), ver AulaService.gerarLote.
  const [modalGerarAberto, setModalGerarAberto] = useState(false)
  const [quantidadeGerar, setQuantidadeGerar] = useState('10')
  const [dataInicioGerar, setDataInicioGerar] = useState(() => new Date().toISOString().slice(0, 10))
  const [tituloBaseGerar, setTituloBaseGerar] = useState('')
  const [erroGerar, setErroGerar] = useState<string | undefined>()

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
  const cargaHorariaPrevista = requisicaoEstatisticas.data?.cargaHorariaPrevista

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

  const { executar: gerarAulas, executando: gerando } = useAcao(async () => {
    const quantidade = Number(quantidadeGerar)
    if (!quantidadeGerar || !Number.isInteger(quantidade) || quantidade <= 0) {
      setErroGerar('Informe uma quantidade inteira maior que zero')
      return
    }
    setErroGerar(undefined)

    try {
      const geradas = await servicoAulas.gerarLote(idPlano, {
        quantidade,
        dataInicio: dataInicioGerar || undefined,
        tituloBase: tituloBaseGerar.trim() || undefined,
      })
      toast.success(`${geradas.length} aula(s) gerada(s)`, 'Revise e ajuste o que precisar em cada uma.')
      setModalGerarAberto(false)
      setTituloBaseGerar('')
      await Promise.all([requisicaoAulas.reload(), requisicaoEstatisticas.reload()])
    } catch (erroGeracao) {
      toast.error(
        'Não foi possível gerar as aulas',
        erroGeracao instanceof ApiError ? erroGeracao.message : undefined,
      )
    }
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
      cabecalho: 'Carga horária',
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
          <Tag variant="neutral">
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
              <SubtituloItem icon={<Users />}>Turma: {plano.turmaDisciplina?.turma?.titulo}</SubtituloItem>
              <SubtituloItem icon={<BookOpen />}>Disciplina: {plano.turmaDisciplina?.disciplina?.titulo}</SubtituloItem>
              <SubtituloItem icon={<ClipboardCheck />}>
                Aulas realizadas: {ministradas}/{totalAulas}
              </SubtituloItem>
              <SubtituloItem icon={<Clock />}>
                Carga horária:{' '}
                {typeof cargaHorariaRealizada === 'number' ? formatarCargaHoraria(cargaHorariaRealizada) : '—'}
                {typeof cargaHorariaPrevista === 'number' && `/${formatarCargaHoraria(cargaHorariaPrevista)}`}
              </SubtituloItem>
            </>
          )
        }
        voltarPara="/professor/plano-aula"
        rotuloVoltar="Planos de aula"
        filtros={
          <CamposCabecalho>
            <Button icon={<Plus />} size="large" onClick={() => navegar(`/professor/plano-aula/${idPlano}/aulas/nova`)}>
              Adicionar aula
            </Button>

            <Button
              variant="secondary"
              icon={<CalendarRange />}
              size="large"
              onClick={() => setModalGerarAberto(true)}
            >
              Gerar aulas
            </Button>

            <LarguraBusca>
              <BuscaInput value={busca} onChange={setBusca} placeholder="Buscar aula..." />
            </LarguraBusca>
          </CamposCabecalho>
        }
      />

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

      <Modal
        aberto={modalGerarAberto}
        onClose={() => setModalGerarAberto(false)}
        titulo="Gerar aulas"
        descricao="Gera várias aulas de uma vez, seguindo os horários já cadastrados na turma (aba Horários, em Turmas) — depois é só ajustar cada uma conforme precisar."
        largura="480px"
        rodape={
          <>
            <Button variant="secondary" onClick={() => setModalGerarAberto(false)}>
              Cancelar
            </Button>
            <Button variant="success" loading={gerando} onClick={gerarAulas}>
              Gerar
            </Button>
          </>
        }
      >
        <Coluna>
          <Input
            label="Quantidade de aulas"
            type="number"
            min={1}
            value={quantidadeGerar}
            error={erroGerar}
            onChange={(evento) => setQuantidadeGerar(evento.target.value)}
          />
          <DatePicker
            label="Data de início"
            value={dataInicioGerar}
            hint="A primeira aula gerada cai no primeiro dia, a partir desta data, que bater com um dos horários da turma."
            onChange={(evento) => setDataInicioGerar(evento.target.value)}
          />
          <Input
            label="Título base"
            placeholder="Ex.: Aula de Robótica"
            value={tituloBaseGerar}
            hint='Cada aula vira "{título base} {número}" — ex.: "Aula de Robótica 1". Vazio usa só "Aula".'
            maxLength={100}
            onChange={(evento) => setTituloBaseGerar(evento.target.value)}
          />
        </Coluna>
      </Modal>
    </Layout>
  )
}
