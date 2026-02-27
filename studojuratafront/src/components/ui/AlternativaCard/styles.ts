import styled, { css } from 'styled-components'
import type { AlternativaStatus } from './types'

const statusColors = {
  default: {
    badge: '#1C8BA5',
    feedback: 'transparent',
    border: '#D9D9D9',
    text: '#666'
  },
  correta: {
    badge: '#22C55E',
    feedback: '#22C55E',
    border: '#BBF7D0',
    text: '#22C55E'
  },
  incorreta: {
    badge: '#EF4444',
    feedback: '#EF4444',
    border: '#FECACA',
    text: '#EF4444'
  }
}

export const Container = styled.div<{ status: AlternativaStatus }>`
  display: flex;
  align-items: center;
  width: 100%;
  height: 64px;

  border-radius: 10px;
  border: 1px solid ${({ status }) => statusColors[status].border};
  background: #F8F8F8;

  overflow: hidden;
`

export const Badge = styled.div<{ status: AlternativaStatus }>`
  min-width: 72px;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  font-weight: 700;
  color: white;
  font-size: 18px;

  background: ${({ status }) => statusColors[status].badge};
`

export const Texto = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  font-size: 16px;
  color: #666;
`

export const Feedback = styled.div<{ status: AlternativaStatus }>`
  min-width: 160px;
  padding-right: 16px;

  text-align: right;
  font-weight: 500;

  color: ${({ status }) => statusColors[status].text};

  ${({ status }) =>
    status === 'default' &&
    css`
      display: none;
    `}
`