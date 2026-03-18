import { useRef } from 'react'
import * as S from './styles'
import type { SeparadorCardProps } from './types'

export function SeparadorCard({
  title = "Título",
  icon,
  children,
  ...rest
}: SeparadorCardProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const childrenArray = Array.isArray(children) ? children : [children]
  const showArrow = childrenArray.length > 5

  const handleScroll = () => {
    scrollRef.current?.scrollBy({
      left: 200,
      behavior: 'smooth'
    })
  }

  return (
    <S.Container {...rest}>
      <S.Header>
        {icon && <S.Icon>{icon}</S.Icon>}
        <S.Title>{title}</S.Title>
      </S.Header>

      <S.ContentWrapper>
        <S.Content ref={scrollRef}>
          {children}
        </S.Content>

        {showArrow && (
          <S.ArrowButton onClick={handleScroll}>
            →
          </S.ArrowButton>
        )}
      </S.ContentWrapper>
    </S.Container>
  )
}