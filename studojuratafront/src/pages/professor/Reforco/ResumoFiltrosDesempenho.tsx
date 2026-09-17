import { BookOpen, CalendarClock, GraduationCap, Users } from 'lucide-react'

import { ListaInfo } from '../../../components/ui/ListaInfo'
import { resumoFiltrosTexto, type RecorteDesempenho } from './resumoFiltrosTexto'

/** Descreve o recorte atual dos gráficos (ícone + texto, um por linha). */
export function ResumoFiltrosDesempenho(props: RecorteDesempenho) {
  const [turma, disciplina, aluno, periodo] = resumoFiltrosTexto(props)

  return (
    <ListaInfo
      itens={[
        { icon: <Users />, texto: turma },
        { icon: <BookOpen />, texto: disciplina },
        { icon: <GraduationCap />, texto: aluno },
        { icon: <CalendarClock />, texto: periodo },
      ]}
    />
  )
}
