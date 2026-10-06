import { Search } from 'lucide-react'

import { Input } from '@/components/ui/Input'
import { Container } from './styles'
import type { BuscaInputProps } from './types'

export function BuscaInput({ value, onChange, placeholder = 'Buscar...', ...rest }: BuscaInputProps) {
  return (
    <Container>
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
    </Container>
  )
}
