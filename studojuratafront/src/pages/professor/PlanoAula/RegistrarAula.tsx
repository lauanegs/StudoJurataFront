import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { CheckCheck, ListTree, Save, Send, UserX, Users } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { CheckBox } from '../../../components/ui/CheckBox'
import { Chip } from '../../../components/ui/Chip'
import { DataTable } from '../../../components/ui/DataTable'
import { Header } from '../../../components/ui/Header'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Tab } from '../../../components/ui/Tab'
import { Tag } from '../../../components/ui/Tag'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { EstadoVazio } from '../../../components/feedback/EstadoVazio'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { aulas as servicoAulas, conteudosPlano, matriculas } from '../../../services/endpoints'
import { formatarData } from '../../../utils/format'
import { theme as tokens } from '../../../styles/theme'
import type { AlunoTurma } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`

const LinhaVincular = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`

const Resumo = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`

type Aba = 'chamada' | 'conteudo'

interface LinhaChamada {
  alunoId: number
  nome: string
  presente: boolean
  justificativa: string
}

/**
 * Tela de registro da aula: chamada (POST em lote) e conteúdos ministrados.
 *
 * A chamada é enviada de uma vez só via /aulas/{id}/frequencias/chamada — o
 * back cria/atualiza uma Frequencia por aluno respeitando a unique
 * (aluno_id, aula_id).
 */
export default function RegistrarAula() {
  const { aulaId } = useParams()
  const toast = useToast()
  const confirmar = useConfirm()

  const idAula = Number(aulaId)

  const [aba, setAba] = useState<Aba>('chamada')
  const [edicoes, setEdicoes] = useState<Record<number, Partial<LinhaChamada>>>({})
  const [conteudoSelecionado, setConteudoSelecionado] = useState<number | null>(null)

  const requisicaoAula = useRequisicao(() => servicoAulas.buscar(idAula), [idAula])

  const turmaId = requisicaoAula.data?.planoAula?.turmaDisciplina?.turma?.id ?? null
  const planoEnsinoId = requisicaoAula.data?.planoAula?.planoEnsino?.id ?? null

  const requisicaoMatriculas = useRequisicao(
    () => matriculas.ativosPorTurma(turmaId as number),
    [turmaId],
    { ativo: Boolean(turmaId) },
  )
  const requisicaoFrequencias = useRequisicao(() => servicoAulas.listarFrequencias(idAula), [idAula])
  const requisicaoConteudosAula = useRequisicao(() => servicoAulas.listarConteudos(idAula), [idAula])
  const requisicaoConteudosPlano = useRequisicao(() => conteudosPlano.listar(), [])

  // Data de referência da aula, para não chamar quem matriculou depois dela.
  const dataAula = requisicaoAula.data?.dataPrevista ?? requisicaoAula.data?.dataPublicacao ?? null

  /**
   * A chamada é derivada dos alunos ativos + frequências já lançadas, e só o
   * que o professor alterou nesta sessão fica em estado (`edicoes`). Assim, um
   * recarregamento dos data não apaga o que ele acabou de marcar.
   *
   * Um aluno cuja matrícula começou depois da data desta aula não deveria
   * aparecer na chamada — ele ainda não fazia parte da turma naquele dia.
   */
  const linhas = useMemo<LinhaChamada[]>(() => {
    const lancadas = new Map(
      (requisicaoFrequencias.data ?? []).map((frequencia) => [frequencia.aluno?.id, frequencia]),
    )

    const elegiveis = (requisicaoMatriculas.data ?? []).filter((matricula: AlunoTurma) => {
      if (!dataAula || !matricula.dataInicio) return true
      return matricula.dataInicio.slice(0, 10) <= dataAula.slice(0, 10)
    })

    return elegiveis.map((matricula: AlunoTurma) => {
      const existente = lancadas.get(matricula.aluno?.id)
      const edicao = edicoes[matricula.aluno.id]

      return {
        alunoId: matricula.aluno.id,
        nome: matricula.aluno?.pessoa?.nome ?? `Aluno ${matricula.aluno.id}`,
        // Sem lançamento anterior, o padrão é presente — é o caso comum.
        presente: edicao?.presente ?? (existente ? Boolean(existente.presente) : true),
        justificativa: edicao?.justificativa ?? existente?.justificativa ?? '',
      }
    })
  }, [requisicaoMatriculas.data, requisicaoFrequencias.data, edicoes, dataAula])

  const conteudosDisponiveis = useMemo(() => {
    const vinculados = new Set(
      (requisicaoConteudosAula.data ?? []).map((item) => item.conteudoPlano?.id),
    )

    return (requisicaoConteudosPlano.data ?? [])
      .filter(
        (conteudo) =>
          conteudo.planoEnsino?.id === planoEnsinoId &&
          conteudo.status !== 'INATIVO' &&
          !vinculados.has(conteudo.id),
      )
      .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
      .map((conteudo) => ({
        value: conteudo.id,
        label: `${conteudo.ordem ? `${conteudo.ordem}. ` : ''}${conteudo.titulo ?? 'Conteúdo'}`,
      }))
  }, [requisicaoConteudosPlano.data, requisicaoConteudosAula.data, planoEnsinoId])

  const presentes = linhas.filter((linha) => linha.presente).length
  const ausentes = linhas.length - presentes

  function alternarPresenca(alunoId: number, presente: boolean) {
    setEdicoes((atuais) => ({
      ...atuais,
      [alunoId]: {
        ...atuais[alunoId],
        presente,
        ...(presente ? { justificativa: '' } : {}),
      },
    }))
  }

  function marcarTodos(presente: boolean) {
    setEdicoes(
      Object.fromEntries(
        linhas.map((linha) => [
          linha.alunoId,
          { presente, justificativa: presente ? '' : linha.justificativa },
        ]),
      ),
    )
  }

  function alterarJustificativa(alunoId: number, justificativa: string) {
    setEdicoes((atuais) => ({
      ...atuais,
      [alunoId]: { ...atuais[alunoId], justificativa },
    }))
  }

  const { executar: salvarChamada, executando: salvandoChamada } = useAcao(async () => {
    if (linhas.length === 0) {
      toast.warning('Sem alunos', 'Esta turma não tem alunos com matrícula ativa.')
      return
    }

    try {
      await servicoAulas.registrarChamada(idAula, {
        alunos: linhas.map((linha) => ({
          alunoId: linha.alunoId,
          presente: linha.presente,
          justificativa: linha.justificativa.trim() || undefined,
        })),
      })

      toast.success('Chamada registrada', `${presentes} presente(s) e ${ausentes} ausente(s).`)
      await requisicaoFrequencias.reload()
    } catch (erroSalvar) {
      toast.error(
        'Não foi possível registrar a chamada',
        erroSalvar instanceof ApiError ? erroSalvar.message : undefined,
      )
    }
  })

  const { executar: vincularConteudo, executando: vinculando } = useAcao(async () => {
    if (!conteudoSelecionado) {
      toast.warning('Selecione um conteúdo')
      return
    }

    try {
      await servicoAulas.vincularConteudo(idAula, conteudoSelecionado)
      toast.success('Conteúdo vinculado à aula')
      setConteudoSelecionado(null)
      await requisicaoConteudosAula.reload()
    } catch (erroVincular) {
      toast.error(
        'Não foi possível vincular',
        erroVincular instanceof ApiError ? erroVincular.message : undefined,
      )
    }
  })

  async function desvincularConteudo(conteudoPlanoId: number) {
    try {
      await servicoAulas.desvincularConteudo(idAula, conteudoPlanoId)
      toast.success('Conteúdo removido da aula')
      await requisicaoConteudosAula.reload()
    } catch (erroRemover) {
      toast.error(
        'Não foi possível remover',
        erroRemover instanceof ApiError ? erroRemover.message : undefined,
      )
    }
  }

  const { executar: publicar, executando: publicando } = useAcao(async () => {
    await confirmar({
      titulo: 'Marcar aula como ministrada?',
      descricao:
        'A data de hoje será registrada como data de publicação. A aula passa a contar nas estatísticas do plano.',
      rotuloConfirmar: 'Marcar como ministrada',
      aoConfirmar: async () => {
        try {
          await servicoAulas.publicar(idAula, new Date().toISOString().slice(0, 10))
          toast.success('Aula publicada')
          await requisicaoAula.reload()
        } catch (erroPublicar) {
          toast.error(
            'Não foi possível publicar',
            erroPublicar instanceof ApiError ? erroPublicar.message : undefined,
          )
        }
      },
    })
  })

  const colunas: Coluna<LinhaChamada>[] = [
    {
      key: 'presente',
      cabecalho: 'Presente',
      largura: '110px',
      alinhamento: 'center',
      render: (linha) => (
        <CheckBox
          checked={linha.presente}
          aria-label={`Presença de ${linha.nome}`}
          onChange={(evento) => alternarPresenca(linha.alunoId, evento.target.checked)}
        />
      ),
    },
    {
      key: 'nome',
      cabecalho: 'Aluno',
      render: (linha) => linha.nome,
    },
    {
      key: 'justificativa',
      cabecalho: 'Justificativa da falta',
      render: (linha) =>
        linha.presente ? (
          <span style={{ color: tokens.colors.textDisabled }}>—</span>
        ) : (
          <Input
            placeholder="Ex.: atestado médico"
            value={linha.justificativa}
            maxLength={500}
            aria-label={`Justificativa da falta de ${linha.nome}`}
            onChange={(evento) => alterarJustificativa(linha.alunoId, evento.target.value)}
          />
        ),
    },
  ]

  if (requisicaoAula.error) {
    return (
      <Layout>
        <Header titulo="Registrar aula" voltarPara="/professor/plano-aula" />
        <ErroCarregamento
          mensagem={requisicaoAula.error}
          onRetry={requisicaoAula.reload}
        />
      </Layout>
    )
  }

  const aula = requisicaoAula.data
  const planoAulaId = aula?.planoAula?.id

  return (
    <Layout>
      <Header
        titulo={aula?.titulo ?? 'Registrar aula'}
        subtitulo={
          aula && (
            <>
              <strong>{aula.planoAula?.turmaDisciplina?.turma?.titulo}</strong>
              <Tag variant="purple">{aula.planoAula?.turmaDisciplina?.disciplina?.titulo}</Tag>
              {aula.dataPrevista && <span>prevista para {formatarData(aula.dataPrevista)}</span>}
              {aula.dataPublicacao ? (
                <Tag variant="success" ponto>
                  Ministrada em {formatarData(aula.dataPublicacao)}
                </Tag>
              ) : (
                <Tag variant="neutral" ponto>
                  Planejada
                </Tag>
              )}
            </>
          )
        }
        voltarPara={planoAulaId ? `/professor/plano-aula/${planoAulaId}/aulas` : '/professor/plano-aula'}
        rotuloVoltar="Voltar para as aulas"
        actions={
          <>
            {!aula?.dataPublicacao && (
              <Button
                size="large"
                variant="secondary"
                icon={<Send />}
                loading={publicando}
                onClick={publicar}
              >
                Marcar como ministrada
              </Button>
            )}
            <Button size="large" variant="success" icon={<Save />} loading={salvandoChamada} onClick={salvarChamada}>
              Salvar chamada
            </Button>
          </>
        }
      />

      <Tab<Aba>
        rotuloAcessivel="Seções do registro de aula"
        value={aba}
        onChange={setAba}
        options={[
          { value: 'chamada', label: 'Realizar chamada', contador: linhas.length },
          {
            value: 'conteudo',
            label: 'Registrar conteúdo',
            contador: requisicaoConteudosAula.data?.length,
          },
        ]}
      />

      {aba === 'chamada' && (
        <Card
          titulo="Chamada"
          actions={
            <>
              <Button
                variant="subtle"
                size="small"
                icon={<CheckCheck />}
                onClick={() => marcarTodos(true)}
              >
                Marcar todos presentes
              </Button>
              <Button
                variant="subtle"
                size="small"
                icon={<UserX />}
                onClick={() => marcarTodos(false)}
              >
                Marcar todos ausentes
              </Button>
            </>
          }
          semPadding
        >
          <div style={{ padding: '16px 24px 0' }}>
            <Resumo>
              <Tag variant="success">{presentes} presente(s)</Tag>
              <Tag variant={ausentes > 0 ? 'error' : 'neutral'}>{ausentes} ausente(s)</Tag>
            </Resumo>
          </div>

          <DataTable
            descricao="Chamada da aula"
            columns={colunas}
            data={linhas}
            rowKey={(linha) => linha.alunoId}
            loading={requisicaoMatriculas.loading || requisicaoAula.loading}
            error={requisicaoMatriculas.error}
            onReload={requisicaoMatriculas.reload}
            densidade="compacta"
            empty={{
              titulo: 'Nenhum aluno com matrícula ativa',
              descricao: 'A secretaria precisa matricular alunos nesta turma antes da chamada.',
              icon: <Users />,
            }}
          />
        </Card>
      )}

      {aba === 'conteudo' && (
        <Card titulo="Conteúdos trabalhados nesta aula">
          <Coluna>
            <LinhaVincular>
              <Select<number>
                label="Conteúdo do plano de ensino"
                options={conteudosDisponiveis}
                value={conteudoSelecionado}
                loading={requisicaoConteudosPlano.loading}
                searchable
                placeholder="Selecionar conteúdo..."
                emptyText="Todos os conteúdos do plano já foram vinculados"
                hint="Só aparecem conteúdos do plano de ensino ligado a este plano de aula."
                onChange={setConteudoSelecionado}
              />

              <Button loading={vinculando} onClick={vincularConteudo}>
                Vincular
              </Button>
            </LinhaVincular>

            {requisicaoConteudosAula.isEmpty ? (
              <EstadoVazio
                titulo="Nenhum conteúdo registrado"
                descricao="Registrar o conteúdo alimenta o histórico do aluno e a repetição espaçada da IA."
                icon={<ListTree />}
              />
            ) : (
              <Chips>
                {(requisicaoConteudosAula.data ?? []).map((vinculo) => (
                  <Chip
                    key={vinculo.id}
                    variant="purple"
                    onRemove={() => desvincularConteudo(vinculo.conteudoPlano.id)}
                    rotuloRemover={`Remover ${vinculo.conteudoPlano?.titulo}`}
                  >
                    {vinculo.conteudoPlano?.titulo ?? 'Conteúdo'}
                  </Chip>
                ))}
              </Chips>
            )}
          </Coluna>
        </Card>
      )}
    </Layout>
  )
}
