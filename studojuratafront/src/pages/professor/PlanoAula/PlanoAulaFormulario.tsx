import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { ClipboardList, Save, Trash2 } from 'lucide-react'

import { Layout } from '../../../components/layout'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Input } from '../../../components/ui/Input'
import { Header } from '../../../components/ui/Header'
import { Select } from '../../../components/ui/Select'
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

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

/* Pedido explícito: plano de aula não é mais criado/editado na mão — nasce
   sozinho junto com o plano de ensino (ver PlanoEnsinoService no back), e
   esta tela vira só leitura do vínculo + o único campo que ainda faz
   sentido editar aqui (Situação). 2 campos por linha, como no resto do
   sistema. */
const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

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
      titulo: 'Excluir plano de aula?',
      descricao: 'As aulas, frequências e conteúdos já registrados permanecem.',
      rotuloConfirmar: 'Excluir',
      tone: 'danger',
      aoConfirmar: async () => {
        try {
          await servicoPlanosAula.excluir(planoAulaId)
          toast.success('Plano de aula excluído')
          navegar('/professor/plano-aula')
        } catch (erroExclusao) {
          toast.error(
            'Não foi possível excluir',
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
            {/* Pedido explícito: quem menciona quem é o plano de aula — daqui
                dá pra voltar pro plano de ensino de origem. */}
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
              icon={<Trash2 />}
              loading={excluindo}
              onClick={excluir}
              disabled={salvando}
            >
              Excluir
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
          <Coluna>
            <Grade>
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
            </Grade>

            <Grade>
              <Input label="Turma" value={plano?.turmaDisciplina?.turma?.titulo ?? '—'} disabled />
              <Input label="Disciplina" value={plano?.turmaDisciplina?.disciplina?.titulo ?? '—'} disabled />
            </Grade>

            <Grade>
              <Select<StatusPlano>
                label="Situação"
                options={OPCOES_STATUS_PLANO}
                value={status}
                disabled={salvando}
                onChange={(valor) => setStatus(valor ?? 'ATIVO')}
              />
            </Grade>
          </Coluna>
        </Card>
      )}
    </Layout>
  )
}
