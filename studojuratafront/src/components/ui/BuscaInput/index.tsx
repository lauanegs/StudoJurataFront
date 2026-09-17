import { Search } from 'lucide-react'

import { Input } from '../Input'
import type { InputProps } from '../Input/types'

interface BuscaInputProps extends Omit<InputProps, 'icon' | 'onClear' | 'label' | 'onChange'> {
  value: string
  onChange: (value: string) => void
}

export function BuscaInput({ value, onChange, placeholder = 'Buscar...', ...rest }: BuscaInputProps) {
  return (
    // Largura fixa: o pai usa max-content, onde `%` resolve para 0.
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
