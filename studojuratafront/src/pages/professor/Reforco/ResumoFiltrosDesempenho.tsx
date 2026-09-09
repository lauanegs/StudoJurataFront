import { BookOpen, CalendarClock, User, Users } from 'lucide-react'

import { ListaInfo } from '../../../components/ui/ListaInfo'
import { resumoFiltrosTexto, type RecorteDesempenho } from './resumoFiltrosTexto'

/**
 * Campo inicial (mesmo padrão do DetalheSimuladoModal: ícone + texto, um por
 * linha) descrevendo o recorte atual dos gráficos abaixo — confirmado pelo
 * usuário, pras 3 telas de detalhamento de desempenho (Visão geral,
 * Evolução, Por simulado), que já filtram por turma/disciplina/aluno/período
 * mas não deixavam explícito, perto do gráfico, a que exatamente aquele
 * recorte se referia.
 */
export function ResumoFiltrosDesempenho(props: RecorteDesempenho) {
  const [turma, disciplina, aluno, periodo] = resumoFiltrosTexto(props)

  return (
    <ListaInfo
      itens={[
        { icon: <Users />, texto: turma },
        { icon: <BookOpen />, texto: disciplina },
        { icon: <User />, texto: aluno },
        { icon: <CalendarClock />, texto: periodo },
      ]}
    />
  )
}
