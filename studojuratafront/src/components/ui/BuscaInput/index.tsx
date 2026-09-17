import { Search } from 'lucide-react'

import { Input } from '../Input'
import type { InputProps } from '../Input/types'

interface BuscaInputProps extends Omit<InputProps, 'icon' | 'onClear' | 'label' | 'onChange'> {
  value: string
  onChange: (value: string) => void
}

export function BuscaInput({ value, onChange, placeholder = 'Buscar...', ...rest }: BuscaInputProps) {
  return (
    // Largura concreta porque o <Field> ocupa 100% do pai. Fixa e não
    // `min(320px, 100%)`: o pai (Header/Filtros) usa max-content, onde `%`
    // resolve para 0. Menos que 320px corta placeholders longos.
    <div style={{ width: '320px', maxWidth: '100%' }}>
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
