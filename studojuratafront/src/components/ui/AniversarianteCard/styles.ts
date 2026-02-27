import styled from 'styled-components'

export const Container = styled.div`
  width: 220px;
  padding: 20px 16px;

  border-radius: 12px;
  background: #F4F4F4;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`

export const AvatarWrapper = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;

  border: 4px solid #D1D5DB;
  overflow: hidden;
`

export const Avatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

export const Nome = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #6B7280;
  margin: 0;
`

export const DataBadge = styled.div`
  padding: 6px 14px;
  border-radius: 8px;
  background: #E5E7EB;

  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
`