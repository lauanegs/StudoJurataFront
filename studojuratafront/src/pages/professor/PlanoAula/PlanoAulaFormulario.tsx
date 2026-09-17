import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Archive, ClipboardList, Save } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Input } from '../../../components/ui/Input'
import { Header } from '../../../components/ui/Header'
import { Select } from '../../../components/ui/Select'
import { Stack } from '../../../components/ui/Stack'
import { GradeAutoAjuste } from '../../../components/ui/GradeAutoAjuste'
import { ErroCarregamento } from '../../../components/feedback/ErroCarregamento'
import { SkeletonCartao } from '../../../components/feedback/Skeleton'
import { useConfirm } from '../../../contexts/confirmContexto'
import { useToast } from '../../../contexts/toastContexto'
import { useHidratar } from '../../../hooks/useHidratar'
import { useAcao, useRequisicao } from '../../../hooks/useRequisicao'
import { ApiError } from '../../../services/api'
import { planosAula as servicoPlanosAula } from '../../../services/endpoints'
import { formatarCargaHoraria } from '../../../utils/format'
import { OPCOES_STATUS_PLANO } from '../../../utils/labels'
import type { StatusPlano } from '../../../types'

export default function PlanoAulaFormulario() {
  const { id } = useParams()
  const navegar = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()

  const planoAulaId = Number(id)

  const [status, setStatus] = useState<StatusPlano>('ATIVO')

  const requisicaoPlano = useRequisicao(() => servicoPlanosAula.buscar(planoAulaId), [planoAulaId])
  const plano = requisicaoPlano.data

  useHidratar(plano, (item) => {
    setStatus(item.status ?? 'ATIVO')
  })

  const { executar: salvar, executando: salvando } = useAcao(async () => {
    if (!plano) return

    try {
      await servicoPlanosAula.atualizar(planoAulaId, {
        turmaDisciplina: plano.turmaDisciplina,
        planoEnsino: plano.planoEnsino,
        status,
      })
      toast.success('Plano de aula atualizado')
      navegar(`/professor/plano-aula/${planoAulaId}/aulas`)
    } catch (erroSalvar) {
      toast.error(
        'Não foi possível salvar',
        erroSalvar instanceof ApiError ? erroSalvar.message : undefined,
      )
    }
  })

  const { executar: excluir, executando: excluindo } = useAcao(async () => {
    await confirmar({
      titulo: 'Encerrar plano de aula?',
      descricao: 'O plano será marcado como concluído. As aulas, frequências e conteúdos já registrados permanecem.',
      rotuloConfirmar: 'Encerrar',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoPlanosAula.excluir(planoAulaId)
          toast.success('Plano de aula encerrado')
          navegar('/professor/plano-aula')
        } catch (erroExclusao) {
          toast.error(
            'Não foi possível encerrar',
            erroExclusao instanceof ApiError ? erroExclusao.message : undefined,
          )
        }
      },
    })
  })

  if (requisicaoPlano.error) {
    return (
      <Layout>
        <Header titulo="Plano de aula" voltarPara="/professor/plano-aula" />
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
        titulo="Plano de aula"
        voltarPara="/professor/plano-aula"
        rotuloVoltar="Planos de aula"
        actions={
          <>
            {/* O plano de aula referencia o plano de ensino de origem, não o contrário. */}
            {plano?.planoEnsino && (
              <Button
                size="large"
                variant="secondary"
                icon={<ClipboardList />}
                onClick={() => navegar(`/professor/plano-ensino/${plano.planoEnsino.id}`)}
              >
                Plano de ensino
              </Button>
            )}
            <Button
              size="large"
              variant="danger"
              icon={<Archive />}
              loading={excluindo}
              onClick={excluir}
              disabled={salvando}
            >
              Encerrar
            </Button>
            <Button
              size="large"
              variant="success"
              icon={<Save />}
              loading={salvando}
              disabled={excluindo}
              onClick={salvar}
            >
              Salvar
            </Button>
          </>
        }
      />

      {requisicaoPlano.loading ? (
        <SkeletonCartao />
      ) : (
        <Card titulo="Vínculo do plano">
          <Stack gap="md">
            <GradeAutoAjuste $larguraMinima="280px">
              <Input
                label="Plano de ensino"
                value={
                  plano?.planoEnsino
                    ? `${plano.planoEnsino.curso?.nome ?? 'Sem curso'} — Plano nº ${plano.planoEnsino.id}`
                    : '—'
                }
                disabled
              />

              <Input
                label="Carga horária total"
                value={formatarCargaHoraria(plano?.planoEnsino?.cargaHoraria)}
                disabled
              />
            </GradeAutoAjuste>

            <GradeAutoAjuste $larguraMinima="280px">
              <Input label="Turma" value={plano?.turmaDisciplina?.turma?.titulo ?? '—'} disabled />
              <Input label="Disciplina" value={plano?.turmaDisciplina?.disciplina?.titulo ?? '—'} disabled />
            </GradeAutoAjuste>

            <GradeAutoAjuste $larguraMinima="280px">
              <Select<StatusPlano>
                label="Situação"
                options={OPCOES_STATUS_PLANO}
                value={status}
                disabled={salvando}
                onChange={(valor) => setStatus(valor ?? 'ATIVO')}
              />
            </GradeAutoAjuste>
          </Stack>
        </Card>
      )}
    </Layout>
  )
}
