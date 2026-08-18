import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Save } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Header } from '../../../components/ui/Header'
import { Select } from '../../../components/ui/Select'
import { Tag } from '../../../components/ui/Tag'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { useToast } from '../../../contexts/toastContexto'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { alunos as servicoAlunos, matriculas, turmas as servicoTurmas } from '../../../services/endpoints'
import { formatarCpf } from '../../../utils/format'
import { intervaloDeDatas } from '../../../utils/validacao'

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

const Aviso = styled.p`
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.warningBackground};
  border-radius: ${({ theme }) => theme.radius.md};

  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.warningText};
`

export default function MatricularAluno() {
  const { turmaId } = useParams()
  const navegar = useNavigate()
  const toast = useToast()

  const idTurma = Number(turmaId)

  const [alunoId, setAlunoId] = useState<number | null>(null)
  const [dataInicio, setDataInicio] = useState(() => new Date().toISOString().slice(0, 10))
  const [dataFim, setDataFim] = useState('')
  const [erros, setErros] = useState<Record<string, string | undefined>>({})

  const requisicaoTurma = useRequisicao(() => servicoTurmas.buscar(idTurma), [idTurma])
  const requisicaoAlunos = useRequisicao(() => servicoAlunos.listar(), [])
  const requisicaoAtivos = useRequisicao(() => matriculas.ativosPorTurma(idTurma), [idTurma])

  const opcoesAlunos = useMemo(() => {
    const jaMatriculados = new Set(
      (requisicaoAtivos.data ?? []).map((matricula) => matricula.aluno?.id),
    )

    return (requisicaoAlunos.data ?? [])
      .filter((aluno) => !jaMatriculados.has(aluno.id))
      .map((aluno) => ({
        value: aluno.id,
        label: aluno.pessoa?.nome ?? `Aluno ${aluno.id}`,
        descricao: formatarCpf(aluno.pessoa?.cpf),
      }))
  }, [requisicaoAlunos.data, requisicaoAtivos.data])

  const turma = requisicaoTurma.data
  const ativos = requisicaoAtivos.data ?? []
  const lotada = Boolean(turma?.capacidadeMaxima && ativos.length >= turma.capacidadeMaxima)

  function validar() {
    const encontrados: Record<string, string | undefined> = {}

    if (!alunoId) encontrados.alunoId = 'Selecione o aluno'
    if (!dataInicio) encontrados.dataInicio = 'Informe a data de início'

    const erroPeriodo = intervaloDeDatas(dataInicio, dataFim)
    if (erroPeriodo) encontrados.dataFim = erroPeriodo

    setErros(encontrados)
    return Object.keys(encontrados).filter((chave) => encontrados[chave]).length === 0
  }

  const { executar: salvar, executando: salvando } = useAcao(async () => {
    if (!validar() || !turma) return

    const aluno = (requisicaoAlunos.data ?? []).find((item) => item.id === alunoId)
    if (!aluno) return

    try {
      await matriculas.matricular({
        aluno,
        turma,
        dataInicio,
        dataFim: dataFim || undefined,
        status: 'ATIVA',
      })

      toast.success('Aluno matriculado', `${aluno.pessoa?.nome} entrou em ${turma.titulo}.`)
      navegar(`/adm/turmas/${idTurma}`)
    } catch (erroSalvar) {
      toast.error(
        'Não foi possível matricular',
        erroSalvar instanceof ApiError ? erroSalvar.message : undefined,
      )
    }
  })

  if (requisicaoTurma.error) {
    return (
      <Layout>
        <Header titulo="Matricular aluno" voltarPara="/adm/turmas" />
        <ErroCarregamento
          mensagem={requisicaoTurma.error}
          onRetry={requisicaoTurma.reload}
        />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo="Matricular aluno"
        subtitulo={
          turma && (
            <>
              <strong>{turma.titulo}</strong>
              {turma.capacidadeMaxima && (
                <Tag variant={lotada ? 'error' : 'neutral'}>
                  {ativos.length} / {turma.capacidadeMaxima} vagas
                </Tag>
              )}
            </>
          )
        }
        voltarPara={`/adm/turmas/${idTurma}`}
        rotuloVoltar="Voltar para a turma"
        actions={
          <>
            <Button
              variant="danger"
              onClick={() => navegar(`/adm/turmas/${idTurma}`)}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button variant="success" icon={<Save />} loading={salvando} onClick={salvar}>
              Matricular
            </Button>
          </>
        }
      />

      <Card titulo="Dados da matrícula">
        <Coluna>
          {lotada && (
            <Aviso role="status">
              A turma atingiu a capacidade máxima informada. A matrícula ainda é possível, mas
              confirme com a coordenação antes de prosseguir.
            </Aviso>
          )}

          <Select<number>
            label="Aluno"
            required
            options={opcoesAlunos}
            value={alunoId}
            loading={requisicaoAlunos.loading}
            error={erros.alunoId}
            searchable
            placeholder="Selecionar aluno..."
            emptyText="Todos os alunos já estão matriculados nesta turma"
            onChange={setAlunoId}
          />

          <Grade>
            <DatePicker
              label="Início da matrícula"
              required
              value={dataInicio}
              error={erros.dataInicio}
              disabled={salvando}
              onChange={(evento) => setDataInicio(evento.target.value)}
            />

            <DatePicker
              label="Término previsto"
              value={dataFim}
              error={erros.dataFim}
              disabled={salvando}
              hint="Opcional. Deixe em branco para matrícula em aberto."
              onChange={(evento) => setDataFim(evento.target.value)}
            />
          </Grade>
        </Coluna>
      </Card>
    </Layout>
  )
}
