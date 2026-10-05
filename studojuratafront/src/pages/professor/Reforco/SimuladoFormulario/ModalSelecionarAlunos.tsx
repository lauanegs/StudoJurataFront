import { Button } from '@/components/ui/Button'
import { CheckBox } from '@/components/ui/CheckBox'
import { Modal } from '@/components/ui/Modal'
import { EstadoVazio } from '@/components/feedback/EstadoVazio'
import { ListaAlunos } from './styles'
import type { ModalSelecionarAlunosProps } from './types'

export function ModalSelecionarAlunos({
  aberto,
  onClose,
  matriculas,
  carregando,
  vazio,
  selecionados,
  onChange,
}: ModalSelecionarAlunosProps) {
  return (
    <Modal
      aberto={aberto}
      onClose={onClose}
      titulo="Selecionar alunos"
      descricao="Apenas alunos com matrícula ativa na turma escolhida."
      largura="520px"
      rodape={
        <>
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={onClose}>Confirmar ({selecionados.length})</Button>
        </>
      }
    >
      <ListaAlunos>
        {carregando && <span>Carregando alunos...</span>}

        {vazio && (
          <EstadoVazio titulo="Nenhum aluno ativo" descricao="Escolha uma turma que tenha alunos matriculados." />
        )}

        {matriculas.map((matricula) => (
          <CheckBox
            key={matricula.id}
            label={matricula.aluno?.pessoa?.nome}
            checked={selecionados.includes(matricula.aluno.id)}
            onChange={(evento) =>
              onChange(
                evento.target.checked
                  ? [...selecionados, matricula.aluno.id]
                  : selecionados.filter((item) => item !== matricula.aluno.id),
              )
            }
          />
        ))}
      </ListaAlunos>
    </Modal>
  )
}
