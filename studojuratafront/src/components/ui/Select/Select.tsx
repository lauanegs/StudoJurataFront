import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'

import { Field } from '../Field'
import { normalizar } from '../../../utils/format'
import * as S from './styles'
import type { SelectOption, SelectProps } from './types'

export function Select<V extends string | number = string | number>({
  options,
  value,
  onChange,
  label,
  required,
  hint,
  error,
  placeholder = 'Selecione...',
  disabled,
  loading,
  clearable = false,
  searchable = false,
  emptyText = 'Nenhuma opção disponível',
  maxWidth,
}: SelectProps<V>) {
  const fieldId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [search, setSearch] = useState('')

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  )

  const visible = useMemo(() => {
    if (!searchable || !search.trim()) return options
    const term = normalizar(search)
    return options.filter((option) => normalizar(option.label).includes(term))
  }, [options, search, searchable])

  useEffect(() => {
    if (!open) return

    function onClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  function openList() {
    setSearch('')
    setActiveIndex(options.findIndex((option) => option.value === value))
    setOpen(true)

    if (searchable) requestAnimationFrame(() => searchRef.current?.focus())
  }

  function toggle() {
    if (open) setOpen(false)
    else openList()
  }

  function select(option: SelectOption<V>) {
    if (option.disabled) return
    onChange(option.value)
    setOpen(false)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (disabled) return

    if (!open && ['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault()
      openList()
      return
    }

    if (!open) return

    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => Math.min(visible.length - 1, current + 1))
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) => Math.max(0, current - 1))
      return
    }

    if (event.key === 'Enter' && activeIndex >= 0 && visible[activeIndex]) {
      event.preventDefault()
      select(visible[activeIndex])
    }
  }

  const triggerText = loading ? 'Carregando...' : (selected?.label ?? placeholder)

  return (
    <Field label={label} htmlFor={fieldId} required={required} hint={hint} error={error}>
      <S.Container ref={containerRef} $maxWidth={maxWidth} onKeyDown={onKeyDown}>
        <S.Gatilho
          id={fieldId}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-invalid={error ? true : undefined}
          disabled={disabled || loading}
          $erro={Boolean(error)}
          $aberto={open}
          $vazio={!selected}
          onClick={toggle}
        >
          <S.Rotulo>{triggerText}</S.Rotulo>

          <S.Adornos>
            {clearable && selected && !disabled && (
              <S.Limpar
                role="button"
                aria-label="Limpar seleção"
                onClick={(event) => {
                  event.stopPropagation()
                  onChange(null)
                }}
              >
                <X />
              </S.Limpar>
            )}
            <S.Chevron $aberto={open} aria-hidden="true">
              <ChevronDown />
            </S.Chevron>
          </S.Adornos>
        </S.Gatilho>

        {open && (
          <S.Lista role="listbox" aria-labelledby={fieldId}>
            {searchable && (
              <S.CaixaBusca>
                <input
                  ref={searchRef}
                  value={search}
                  placeholder="Filtrar..."
                  aria-label="Filtrar opções"
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setActiveIndex(0)
                  }}
                />
              </S.CaixaBusca>
            )}

            {visible.length === 0 && <S.Vazio>{emptyText}</S.Vazio>}

            {visible.map((option, index) => (
              <S.Item
                key={String(option.value)}
                role="option"
                aria-selected={option.value === value}
                aria-disabled={option.disabled}
                $selecionada={option.value === value}
                $ativa={index === activeIndex}
                $disabled={option.disabled}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => select(option)}
              >
                {option.icon}
                <span style={{ flex: 1, minWidth: 0 }}>
                  {option.label}
                  {option.description && <S.Descricao>{option.description}</S.Descricao>}
                </span>
                {option.value === value && <Check size={16} />}
              </S.Item>
            ))}
          </S.Lista>
        )}
      </S.Container>
    </Field>
  )
}
