import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { BookOpen, Calendar, CheckCheck, Clock, Save, Send, UserX, Users } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { CheckBox } from '../../../components/ui/CheckBox'
import { DataTable } from '../../../components/ui/DataTable'
import { Header, SubtituloItem } from '../../../components/ui/Header'
import { Input } from '../../../components/ui/Input'
import { Tab } from '../../../components/ui/Tab'
import { Tag } from '../../../components/ui/Tag'
import { VinculoConteudoAula } from '../../../components/ui/VinculoConteudo'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { aulas as servicoAulas, matriculas } from '../../../services/endpoints'
import { formatarData } from '../../../utils/format'
import { theme as tokens } from '../../../styles/theme'
import type { AlunoTurma } from '../../../types'
import type { Coluna } from '../../../components/ui/DataTable/types'

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
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

  const requisicaoAula = useRequisicao(() => servicoAulas.buscar(idAula), [idAula])

  const turmaId = requisicaoAula.data?.planoAula?.turmaDisciplina?.turma?.id ?? null
  const planoEnsinoId = requisicaoAula.data?.planoAula?.planoEnsino?.id ?? null

  const requisicaoMatriculas = useRequisicao(
    () => matriculas.ativosPorTurma(turmaId as number),
    [turmaId],
    { ativo: Boolean(turmaId) },
  )
  const requisicaoFrequencias = useRequisicao(() => servicoAulas.listarFrequencias(idAula), [idAula])
  // Só pro contador da aba "Registrar conteúdo" abaixo — a lista em si (e
  // vincular/desvincular) fica com VinculoConteudoAula, que busca por conta própria.
  const requisicaoConteudosAula = useRequisicao(() => servicoAulas.listarConteudos(idAula), [idAula])

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
              <SubtituloItem icon={<Users />}>Turma: {aula.planoAula?.turmaDisciplina?.turma?.titulo}</SubtituloItem>
              <SubtituloItem icon={<BookOpen />}>
                Disciplina: {aula.planoAula?.turmaDisciplina?.disciplina?.titulo}
              </SubtituloItem>
              {aula.dataPrevista && (
                <SubtituloItem icon={<Calendar />}>Prevista para: {formatarData(aula.dataPrevista)}</SubtituloItem>
              )}
              {aula.dataPublicacao ? (
                <SubtituloItem icon={<CheckCheck />}>Ministrada em: {formatarData(aula.dataPublicacao)}</SubtituloItem>
              ) : (
                <SubtituloItem icon={<Clock />}>Status: Planejada</SubtituloItem>
              )}
            </>
          )
        }
        voltarPara={planoAulaId ? `/professor/plano-aula/${planoAulaId}/aulas` : '/professor/plano-aula'}
        rotuloVoltar="Aulas"
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
          <VinculoConteudoAula aulaId={idAula} planoEnsinoId={planoEnsinoId} />
        </Card>
      )}
    </Layout>
  )
}
