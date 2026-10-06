import { Search } from 'lucide-react'

import { Input } from '@/components/ui/Input'
import type { BuscaInputProps } from './types'

export function BuscaInput({ value, onChange, placeholder = 'Buscar...', ...rest }: BuscaInputProps) {
  return (
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
