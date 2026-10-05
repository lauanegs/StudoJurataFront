import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'

import { TelaComBanner } from '@/components/layout/TelaComBanner'
import { Button } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Tag'
import { ErroCarregamento } from '@/components/feedback/ErroCarregamento'
import { EstadoVazio } from '@/components/feedback/EstadoVazio'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useCursoAluno } from '@/hooks/useCursoAluno'
import { ROTULO_STATUS_MATRICULA, STATUS_MATRICULA_VARIANT } from '@/utils/labels'

import { Bloco, Logo, Titulos, Titulo, Subtitulo, Lista, CartaoCurso, IconeQuadrado, Textos, SituacaoDaMatricula, NomeCurso, NomeTurma } from './styles'

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
