import { useNavigate } from 'react-router-dom'
import { useTheme } from 'styled-components'
import { Compass } from 'lucide-react'

import { Button } from '../../components/ui/Button'
import { ROTA_INICIAL_POR_PERFIL } from '../../contexts/authContexto'
import { useAuth } from '../../hooks/useAuth'
import { TelaAviso } from './TelaAviso'

export default function NaoEncontrada() {
  const navegar = useNavigate()
  const { colors } = useTheme()
  const { usuario } = useAuth()

  return (
    <TelaAviso
      icone={<Compass />}
      corIcone={colors.purple}
      fundoIcone={colors.purpleSoft}
      titulo="Página não encontrada"
      descricao="O endereço acessado não existe ou foi movido."
      larguraDescricao="420px"
      acao={
        <Button
          onClick={() =>
            navegar(usuario ? ROTA_INICIAL_POR_PERFIL[usuario.tipoUsuario] : '/', { replace: true })
          }
        >
          Voltar para o início
        </Button>
      }
    />
  )
}
