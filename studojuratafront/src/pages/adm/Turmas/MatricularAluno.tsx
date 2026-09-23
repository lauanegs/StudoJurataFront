import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Check, Save, UserPlus, Users, UserX } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Header, SubtituloItem } from '../../../components/ui/Header'
import { Select } from '../../../components/ui/Select'
import { Stepper } from '../../../components/ui/Stepper'
import { Tab } from '../../../components/ui/Tab'
import { Tag } from '../../../components/ui/Tag'
import { Stack } from '../../../components/ui/Stack'
import { GradeAutoAjuste } from '../../../components/ui/GradeAutoAjuste'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useToast } from '../../../contexts/toastContexto'
import { useHidratar } from '../../../hooks/useHidratar'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import {
  alunos as servicoAlunos,
  pessoas as servicoPessoas,
  responsaveis as servicoResponsaveis,
  vinculosResponsavel,
} from '../../../services/pessoas'
import { matriculas, turmas as servicoTurmas } from '../../../services/turmas'
import { formatarCpf } from '../../../utils/format'
import { OPCOES_PARENTESCO } from '../../../utils/labels'
import type { Parentesco } from '../../../types/pessoas'
import type { StatusMatricula } from '../../../types/turmas'
import { PessoaCampos } from '../../../components/pessoas/PessoaCampos'
import { paraPayloadPessoa, useFormularioPessoa } from '../../../formularios/pessoas'
import { useFormularioMatricula } from '../../../formularios/turmas'

/* Não há transferência entre turmas. Reativar uma matrícula CONCLUIDA também é feito aqui. */
const OPCOES_STATUS_MATRICULA_EDITAVEL: { value: StatusMatricula; label: string }[] = [
  { value: 'ATIVA', label: 'Ativa' },
  { value: 'CONCLUIDA', label: 'Concluída' },
  { value: 'CANCELADA', label: 'Cancelada' },
]

const Aviso = styled.p`
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.warningBackground};
  border-radius: ${({ theme }) => theme.radius.md};

  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.warningText};
`

const LinhaRodape = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`

type Passo = 'aluno' | 'responsavel' | 'matricula'

/**
 * Nada é gravado até "Concluir matrícula": só então aluno, responsável e
 * matrícula são criados em sequência, evitando registro órfão se o fluxo for
 * abandonado. Editar uma matrícula existente usa um formulário simples.
 */
export default function MatricularAluno() {
  const { turmaId, matriculaId } = useParams()
  const navegar = useNavigate()
  const toast = useToast()

  const idTurma = Number(turmaId)
  const edicao = Boolean(matriculaId)
  const idMatricula = matriculaId ? Number(matriculaId) : null

  const [passo, setPasso] = useState<Passo>('aluno')

  // --- Passo 1: aluno -------------------------------------------------------
  const [modoAluno, setModoAluno] = useState<'existente' | 'novo'>('existente')
  const [alunoIdExistente, setAlunoIdExistente] = useState<number | null>(null)
  // Aluno exige data de nascimento: é ela que define a exigência de responsável.
  const formularioAluno = useFormularioPessoa({ exigirDataNascimento: true })

  // --- Passo 2: responsável ---------------------------------------------------
  const [modoResponsavel, setModoResponsavel] = useState<'existente' | 'novo'>('existente')
  const [responsavelIdExistente, setResponsavelIdExistente] = useState<number | null>(null)
  const [parentesco, setParentesco] = useState<Parentesco | null>(null)
  const formularioResponsavel = useFormularioPessoa()

  // --- Passo 3: matrícula ------------------------------------------------------
  const formularioMatricula = useFormularioMatricula()

  const requisicaoTurma = useRequisicao(() => servicoTurmas.buscar(idTurma), [idTurma])
  const requisicaoAlunos = useRequisicao(() => servicoAlunos.listar(), [])
  const requisicaoResponsaveis = useRequisicao(() => servicoResponsaveis.listar(), [])
  const requisicaoAtivos = useRequisicao(() => matriculas.ativosPorTurma(idTurma), [idTurma])
  const requisicaoMatricula = useRequisicao(
    () => matriculas.buscar(idMatricula as number),
    [idMatricula],
    { ativo: Boolean(idMatricula) },
  )

  // Responsáveis já vinculados ao aluno EXISTENTE selecionado — se já tem
  // pelo menos um, o passo "Responsável" fica opcional (só informativo).
  const requisicaoVinculosDoAluno = useRequisicao(
    () => vinculosResponsavel.porAluno(alunoIdExistente as number),
    [alunoIdExistente],
    { ativo: Boolean(alunoIdExistente) && modoAluno === 'existente' },
  )

  useHidratar(requisicaoMatricula.data, (matricula) => {
    setAlunoIdExistente(matricula.aluno?.id ?? null)
    formularioMatricula.setValues({
      dataInicio: matricula.dataInicio?.slice(0, 10) ?? '',
      dataFim: matricula.dataFim?.slice(0, 10) ?? '',
      status: matricula.status ?? 'ATIVA',
    })
  })

  const opcoesAlunos = useMemo(() => {
    const jaMatriculados = new Set(
      (requisicaoAtivos.data ?? [])
        .filter((matricula) => matricula.id !== idMatricula)
        .map((matricula) => matricula.aluno?.id),
    )

    return (requisicaoAlunos.data ?? [])
      .filter((aluno) => !jaMatriculados.has(aluno.id))
      .map((aluno) => ({
        value: aluno.id,
        label: aluno.pessoa?.nome ?? `Aluno ${aluno.id}`,
        descricao: formatarCpf(aluno.pessoa?.cpf),
      }))
  }, [requisicaoAlunos.data, requisicaoAtivos.data, idMatricula])

  const opcoesResponsaveis = useMemo(
    () =>
      (requisicaoResponsaveis.data ?? []).map((responsavel) => ({
        value: responsavel.id,
        label: responsavel.pessoa?.nome ?? `Responsável ${responsavel.id}`,
        descricao: responsavel.pessoa?.cpf,
      })),
    [requisicaoResponsaveis.data],
  )

  const turma = requisicaoTurma.data
  const ativos = requisicaoAtivos.data ?? []
  const lotada = Boolean(turma?.capacidadeMaxima && ativos.length >= turma.capacidadeMaxima)

  const responsaveisDoAlunoExistente = requisicaoVinculosDoAluno.data ?? []
  // Passo "Responsável" é obrigatório pra aluno novo (nunca teve nenhum) ou
  // pra aluno existente que ainda não tem nenhum responsável vinculado.
  const responsavelObrigatorio =
    !edicao && (modoAluno === 'novo' || (modoAluno === 'existente' && responsaveisDoAlunoExistente.length === 0))

  async function avancar() {
    if (passo === 'aluno') {
      if (modoAluno === 'existente') {
        if (!alunoIdExistente) {
          toast.warning('Selecione o aluno')
          return
        }
      } else {
        const { hasErrors } = await formularioAluno.validate()
        if (hasErrors) {
          toast.warning('Revise os campos', 'Há informações obrigatórias pendentes.')
          return
        }
      }

      setPasso('responsavel')
      return
    }

    if (passo === 'responsavel') {
      if (responsavelObrigatorio) {
        if (!parentesco) {
          toast.warning('Selecione o parentesco do responsável')
          return
        }

        if (modoResponsavel === 'existente') {
          if (!responsavelIdExistente) {
            toast.warning('Selecione o responsável')
            return
          }
        } else {
          const { hasErrors } = await formularioResponsavel.validate()
          if (hasErrors) {
            toast.warning('Revise os campos', 'Há informações obrigatórias pendentes.')
            return
          }
        }
      }

      setPasso('matricula')
    }
  }

  const { executar: salvarEdicao, executando: salvandoEdicao } = useAcao(async () => {
    if ((await formularioMatricula.validate()).hasErrors || !turma) return
    const { dataInicio, dataFim, status } = formularioMatricula.getValues()
    const aluno = (requisicaoAlunos.data ?? []).find((item) => item.id === alunoIdExistente)
    if (!aluno) return

    try {
      await matriculas.atualizar(idMatricula as number, {
        aluno,
        turma,
        dataInicio,
        dataFim: dataFim || undefined,
        status,
      })
      toast.success('Matrícula atualizada', aluno.pessoa?.nome)
      navegar(`/adm/turmas/${idTurma}`, { state: { aba: 'alunos' } })
    } catch (erroSalvar) {
      toast.error('Não foi possível salvar', erroSalvar instanceof ApiError ? erroSalvar.message : undefined)
    }
  })

  const { executar: concluirMatricula, executando: concluindo } = useAcao(async () => {
    if ((await formularioMatricula.validate()).hasErrors || !turma) return
    const { dataInicio, dataFim } = formularioMatricula.getValues()

    try {
      // 1) Aluno — usa o existente ou cria Pessoa + Aluno.
      let alunoFinal = (requisicaoAlunos.data ?? []).find((item) => item.id === alunoIdExistente)

      if (modoAluno === 'novo') {
        const payloadPessoa = paraPayloadPessoa(formularioAluno.getValues())
        const pessoaSalva = await servicoPessoas.criar(payloadPessoa)
        // A matrícula é gerada pelo backend (ano + sequência).
        alunoFinal = await servicoAlunos.criar({ pessoa: pessoaSalva })
      }

      if (!alunoFinal) {
        toast.error('Aluno não encontrado')
        return
      }

      // 2) Responsável — só quando o passo era obrigatório.
      if (responsavelObrigatorio) {
        let responsavelFinal = (requisicaoResponsaveis.data ?? []).find(
          (item) => item.id === responsavelIdExistente,
        )

        if (modoResponsavel === 'novo') {
          const payloadPessoa = paraPayloadPessoa(formularioResponsavel.getValues())
          const pessoaSalva = await servicoPessoas.criar(payloadPessoa)
          responsavelFinal = await servicoResponsaveis.criar({ pessoa: pessoaSalva })
        }

        if (!responsavelFinal) {
          toast.error('Responsável não encontrado')
          return
        }

        await vinculosResponsavel.criar({
          aluno: alunoFinal,
          responsavel: responsavelFinal,
          parentesco: parentesco as Parentesco,
        })
      }

      // 3) Matrícula.
      await matriculas.matricular({
        aluno: alunoFinal,
        turma,
        dataInicio,
        dataFim: dataFim || undefined,
        status: 'ATIVA',
      })

      toast.success('Aluno matriculado', `${alunoFinal.pessoa?.nome} entrou em ${turma.titulo}.`)
      navegar(`/adm/turmas/${idTurma}`, { state: { aba: 'alunos' } })
    } catch (erroSalvar) {
      toast.error('Não foi possível matricular', erroSalvar instanceof ApiError ? erroSalvar.message : undefined)
    }
  })

  if (requisicaoTurma.error || (edicao && requisicaoMatricula.error)) {
    return (
      <Layout>
        <Header titulo={edicao ? 'Editar matrícula' : 'Matricular aluno'} voltarPara="/adm/turmas" />
        <ErroCarregamento
          mensagem={requisicaoTurma.error ?? requisicaoMatricula.error ?? 'Erro ao carregar'}
          onRetry={requisicaoTurma.reload}
        />
      </Layout>
    )
  }

  const subtitulo = turma && (
    <>
      <SubtituloItem icon={<Users />}>Turma: {turma.titulo}</SubtituloItem>
      {turma.capacidadeMaxima && (
        <SubtituloItem icon={lotada ? <UserX /> : <Users />}>
          Vagas: {ativos.length} / {turma.capacidadeMaxima}
        </SubtituloItem>
      )}
    </>
  )

  // Editar matrícula existente: formulário simples, sem os passos.
  if (edicao) {
    return (
      <Layout>
        <Header
          titulo="Editar matrícula"
          subtitulo={subtitulo}
          voltarPara={`/adm/turmas/${idTurma}`}
          rotuloVoltar="Turma"
          actions={
            <Button variant="success" size="large" icon={<Save />} loading={salvandoEdicao} onClick={salvarEdicao}>
              Salvar
            </Button>
          }
        />

        {requisicaoMatricula.loading ? (
          <SkeletonCartao />
        ) : (
          <Card titulo="Dados da matrícula">
            <Stack gap="md">
              <Select<number>
                label="Aluno"
                required
                options={opcoesAlunos}
                value={alunoIdExistente}
                loading={requisicaoAlunos.loading}
                disabled
                onChange={setAlunoIdExistente}
              />

              <GradeAutoAjuste $larguraMinima="220px">
                <DatePicker
                  label="Início da matrícula"
                  required
                  value={formularioMatricula.values.dataInicio}
                  error={formularioMatricula.errors.dataInicio as string | undefined}
                  onChange={(evento) => formularioMatricula.setFieldValue('dataInicio', evento.target.value)}
                />

                <DatePicker
                  label="Término previsto"
                  value={formularioMatricula.values.dataFim}
                  error={formularioMatricula.errors.dataFim as string | undefined}
                  hint="Opcional. Deixe em branco para matrícula em aberto."
                  onChange={(evento) => formularioMatricula.setFieldValue('dataFim', evento.target.value)}
                />
              </GradeAutoAjuste>

              <Select<StatusMatricula>
                label="Situação da matrícula"
                options={OPCOES_STATUS_MATRICULA_EDITAVEL}
                value={formularioMatricula.values.status}
                onChange={(valor) => valor && formularioMatricula.setFieldValue('status', valor)}
              />
            </Stack>
          </Card>
        )}
      </Layout>
    )
  }

  return (
    <Layout>
      <Header
        titulo="Matricular aluno"
        subtitulo={subtitulo}
        voltarPara={`/adm/turmas/${idTurma}`}
        rotuloVoltar="Turma"
      />

      <Stepper<Passo>
        rotuloAcessivel="Passos da matrícula"
        value={passo}
        onChange={setPasso}
        options={[
          { value: 'aluno', label: 'Aluno', description: 'Quem vai ser matriculado' },
          { value: 'responsavel', label: 'Responsável', description: 'Vínculo e termo' },
          { value: 'matricula', label: 'Matrícula', description: 'Turma e datas' },
        ]}
      />

      {passo === 'aluno' && (
        <>
          <Tab<'existente' | 'novo'>
            rotuloAcessivel="Aluno já cadastrado ou novo"
            value={modoAluno}
            onChange={setModoAluno}
            options={[
              { value: 'existente', label: 'Aluno já cadastrado' },
              { value: 'novo', label: 'Cadastrar novo aluno' },
            ]}
          />

          <Card titulo="Quem vai ser matriculado?">
            <Stack gap="md">
              {lotada && (
                <Aviso role="status">
                  A turma atingiu a capacidade máxima informada. A matrícula ainda é possível, mas
                  confirme com a coordenação antes de prosseguir.
                </Aviso>
              )}

              {modoAluno === 'existente' ? (
                <Select<number>
                  label="Aluno"
                  required
                  options={opcoesAlunos}
                  value={alunoIdExistente}
                  loading={requisicaoAlunos.loading}
                  searchable
                  placeholder="Selecionar aluno..."
                  emptyText="Nenhum aluno disponível — cadastre um novo"
                  onChange={setAlunoIdExistente}
                />
              ) : (
                <>
                  <PessoaCampos
                    form={formularioAluno}
                    rotuloNome="Nome do aluno"
                    exigirDataNascimento
                  />
                </>
              )}
            </Stack>
          </Card>

          <LinhaRodape>
            <span />
            <Button icon={<UserPlus />} onClick={avancar}>
              Próximo: Responsável
            </Button>
          </LinhaRodape>
        </>
      )}

      {passo === 'responsavel' && (
        <>
          {responsavelObrigatorio && (
            <Tab<'existente' | 'novo'>
              rotuloAcessivel="Responsável já cadastrado ou novo"
              value={modoResponsavel}
              onChange={setModoResponsavel}
              options={[
                { value: 'existente', label: 'Responsável já cadastrado' },
                { value: 'novo', label: 'Cadastrar novo responsável' },
              ]}
            />
          )}

          <Card titulo="Responsável pelo aluno">
            <Stack gap="md">
              {!responsavelObrigatorio ? (
                <>
                  <Aviso role="status">
                    Este aluno já tem {responsaveisDoAlunoExistente.length} responsável(is) vinculado(s) —
                    este passo é opcional aqui. Vincule ou troque responsáveis depois, na ficha do aluno.
                  </Aviso>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {responsaveisDoAlunoExistente.map((vinculo) => (
                      <Tag key={vinculo.id} variant="neutral">
                        {vinculo.responsavel?.pessoa?.nome} ({vinculo.parentesco})
                      </Tag>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {modoResponsavel === 'existente' ? (
                    <Select<number>
                      label="Responsável"
                      required
                      options={opcoesResponsaveis}
                      value={responsavelIdExistente}
                      loading={requisicaoResponsaveis.loading}
                      searchable
                      placeholder="Selecionar responsável..."
                      emptyText="Cadastre um novo responsável"
                      onChange={setResponsavelIdExistente}
                    />
                  ) : (
                    <PessoaCampos
                      form={formularioResponsavel}
                      rotuloNome="Nome do responsável"
                    />
                  )}

                  <Select<Parentesco>
                    label="Parentesco"
                    required
                    options={OPCOES_PARENTESCO.map((opcao) => ({ value: opcao.value, label: opcao.label }))}
                    value={parentesco}
                    placeholder="Selecione..."
                    onChange={setParentesco}
                  />

                </>
              )}
            </Stack>
          </Card>

          <LinhaRodape>
            <Button variant="secondary" onClick={() => setPasso('aluno')}>
              Voltar
            </Button>
            <Button icon={<Check />} onClick={avancar}>
              Próximo: Matrícula
            </Button>
          </LinhaRodape>
        </>
      )}

      {passo === 'matricula' && (
        <>
          <Card titulo="Dados da matrícula">
            <Stack gap="md">
              <GradeAutoAjuste $larguraMinima="220px">
                <DatePicker
                  label="Início da matrícula"
                  required
                  value={formularioMatricula.values.dataInicio}
                  error={formularioMatricula.errors.dataInicio as string | undefined}
                  disabled={concluindo}
                  onChange={(evento) => formularioMatricula.setFieldValue('dataInicio', evento.target.value)}
                />

                <DatePicker
                  label="Término previsto"
                  value={formularioMatricula.values.dataFim}
                  error={formularioMatricula.errors.dataFim as string | undefined}
                  disabled={concluindo}
                  hint="Opcional. Deixe em branco para matrícula em aberto."
                  onChange={(evento) => formularioMatricula.setFieldValue('dataFim', evento.target.value)}
                />
              </GradeAutoAjuste>
            </Stack>
          </Card>

          <LinhaRodape>
            <Button variant="secondary" onClick={() => setPasso('responsavel')} disabled={concluindo}>
              Voltar
            </Button>
            <Button variant="success" icon={<Save />} loading={concluindo} onClick={concluirMatricula}>
              Concluir matrícula
            </Button>
          </LinhaRodape>
        </>
      )}
    </Layout>
  )
}
