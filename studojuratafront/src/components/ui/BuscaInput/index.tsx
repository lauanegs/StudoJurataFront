import { Search } from 'lucide-react'

import { Input } from '../Input'
import type { InputProps } from '../Input/types'

interface BuscaInputProps extends Omit<InputProps, 'icon' | 'onClear' | 'label' | 'onChange'> {
  value: string
  onChange: (value: string) => void
}

export function BuscaInput({ value, onChange, placeholder = 'Buscar...', ...rest }: BuscaInputProps) {
  return (
    // O <Field> por baixo do Input pede width:100% do pai (pensado pra
    // preencher célula de grid de formulário). Dentro do slot de filtros do
    // Header, o "pai" é um container mais largo que a busca deveria ocupar —
    // só o maxWidth do campo em si não bastava, porque o <Field> ainda
    // reivindicava o espaço todo do container (sobrava vazio à direita da
    // busca, em vez dela ficar encostada na borda). Uma largura concreta
    // aqui fora resolve essa cadeia sem ambiguidade.
    <div style={{ width: 'min(250px, 100%)' }}>
      <Input
        type="search"
        icon={<Search />}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onClear={() => onChange('')}
        aria-label={placeholder}
        {...rest}
      />
    </div>
  )
}
