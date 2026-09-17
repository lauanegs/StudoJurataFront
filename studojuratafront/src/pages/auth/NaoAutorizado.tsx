import { useNavigate } from 'react-router-dom'
import { useTheme } from 'styled-components'
import { ShieldAlert } from 'lucide-react'

import { Button } from '../../components/ui/Button'
import { ROTA_INICIAL_POR_PERFIL } from '../../contexts/authContexto'
import { useAuth } from '../../hooks/useAuth'
import { TelaAviso } from './TelaAviso'

export default function NaoAutorizado() {
  const navegar = useNavigate()
  const { colors } = useTheme()
  const { usuario, cargo } = useAuth()

  return (
    <TelaAviso
      icone={<ShieldAlert />}
      corIcone={colors.error}
      fundoIcone={colors.errorBackground}
      titulo="Acesso não autorizado"
      descricao={
        usuario
          ? `Seu perfil (${cargo}) não tem permissão para abrir esta página. Se você precisa desse acesso, fale com a coordenação da escola.`
          : 'Faça login para continuar.'
      }
      larguraDescricao="460px"
      acao={
        <Button
          onClick={() =>
            navegar(usuario ? ROTA_INICIAL_POR_PERFIL[usuario.tipoUsuario] : '/', { replace: true })
          }
        >
          {usuario ? 'Voltar para o início' : 'Ir para o login'}
        </Button>
      }
    />
  )
}
