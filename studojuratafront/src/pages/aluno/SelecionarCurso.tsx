import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { ArrowLeft, BookOpen } from 'lucide-react'

import { TelaComBanner } from '../../components/layout/TelaComBanner'
import { Button } from '../../components/ui/Button'
import { Tag } from '../../components/ui/Tag'
import { ErroCarregamento } from '../../components/feedback/ErroCarregamento'
import { EstadoVazio } from '../../components/feedback/EstadoVazio'
import { Skeleton } from '../../components/feedback/Skeleton'
import { useAuth } from '../../hooks/useAuth'
import { useCursoAluno } from '../../hooks/useCursoAluno'
import { ROTULO_STATUS_MATRICULA, STATUS_MATRICULA_VARIANT } from '../../utils/labels'

const Bloco = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};

  width: 100%;
  max-width: 400px;
`

const Logo = styled.img`
  width: clamp(90px, 14vh, 140px);
  height: clamp(90px, 14vh, 140px);
  object-fit: cover;
`

const Titulos = styled.div`
  text-align: center;
`

const Titulo = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes.title};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textSecondary};
  letter-spacing: -0.6px;
`

const Subtitulo = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
`

/* Se houver muitos cursos a lista rola, sem fazer a tela inteira rolar. */
const Lista = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  width: 100%;
  max-height: 38vh;
  overflow-y: auto;
  padding: 2px;
`

const CartaoCurso = styled.button`
  display: flex;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing.md};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};

  background: ${({ theme }) => theme.colors.white};
  border: 2px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radius.md};
  text-align: left;
  cursor: pointer;
  transition: border-color ${({ theme }) => theme.transition.base};

  &:hover {
    border-color: ${({ theme }) => theme.colors.blue};
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadow.focus};
  }

`

/* Quadrado azul na altura útil do card (até o padding), com o símbolo em branco. */
const IconeQuadrado = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  align-self: stretch;
  aspect-ratio: 1;
  border-radius: ${({ theme }) => theme.radius.sm};

  background: ${({ theme }) => theme.colors.blue};
  color: ${({ theme }) => theme.colors.white};

  svg {
    width: 24px;
    height: 24px;
  }
`

const Textos = styled.span`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  flex: 1;
`

const SituacaoDaMatricula = styled.span`
  display: inline-flex;
  align-items: center;
`

const NomeCurso = styled.strong`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
`

const NomeTurma = styled.small`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`

/**
 * Logo após o login, quando o aluno tem mais de um curso (ativo ou concluído):
 * mesma casca do login, com os cursos como cards no lugar dos campos.
 */
export default function SelecionarCurso() {
  const navegar = useNavigate()
  const { sair } = useAuth()
  const { matriculas, selecionar, loading, error } = useCursoAluno()

  function abrir(turmaId: number) {
    selecionar(turmaId)
    navegar('/aluno', { replace: true })
  }

  // Voltar ao login encerra a sessão: sem isso o login redirecionaria de volta para o portal.
  async function voltarParaOLogin() {
    await sair()
    navegar('/', { replace: true })
  }

  return (
    <TelaComBanner>
      <Bloco>
        <Logo src="/images/logo.png" alt="Studo Jurata" />

        <Titulos>
          <Titulo>Studo Jurata</Titulo>
          <Subtitulo>Qual curso você quer abrir?</Subtitulo>
        </Titulos>

        {loading ? (
          <Skeleton $altura="140px" $raio="8px" />
        ) : error ? (
          <ErroCarregamento mensagem={error} />
        ) : matriculas.length === 0 ? (
          <EstadoVazio
            titulo="Nenhuma matrícula encontrada"
            descricao="Fale com a secretaria para confirmar a sua matrícula."
            icon={<BookOpen />}
          />
        ) : (
          <Lista role="list">
            {matriculas.map((matricula) => (
              <CartaoCurso key={matricula.id} type="button" role="listitem" onClick={() => abrir(matricula.turma.id)}>
                <IconeQuadrado aria-hidden="true">
                  <BookOpen />
                </IconeQuadrado>
                <Textos>
                  <NomeCurso>{matricula.turma.curso?.nome ?? matricula.turma.titulo}</NomeCurso>
                  <NomeTurma>{matricula.turma.titulo}</NomeTurma>
                </Textos>
                {matricula.status && (
                  <SituacaoDaMatricula>
                    <Tag variant={STATUS_MATRICULA_VARIANT[matricula.status]} size="small">
                      {ROTULO_STATUS_MATRICULA[matricula.status]}
                    </Tag>
                  </SituacaoDaMatricula>
                )}
              </CartaoCurso>
            ))}
          </Lista>
        )}

        <div style={{ width: '100%', maxWidth: '300px' }}>
          <Button variant="secondary" size="large" fullWidth icon={<ArrowLeft />} onClick={voltarParaOLogin}>
            Voltar
          </Button>
        </div>
      </Bloco>
    </TelaComBanner>
  )
}
