import styled from 'styled-components'

export const Container = styled.aside`
  width: 260px;
  height: 100vh;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  padding: 32px 20px;

  background: linear-gradient(180deg, #1aa6b8 0%, #197aa3 100%);
  color: white;
`

export const TopSection = styled.div`
  display: flex;
  flex-direction: column;
`

export const Profile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
`

export const UserName = styled.span`
  font-size: 18px;
  font-weight: 500;
`

export const UserRole = styled.span`
  font-size: 14px;
  opacity: 0.8;
`

export const Menu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 40px;
`

export const MenuItem = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 12px 16px;
  border-radius: 10px;

  cursor: pointer;

  background: ${({ active }) =>
    active ? 'rgba(255,255,255,0.2)' : 'transparent'};

  transition: 0.2s;

  &:hover {
    background: rgba(255,255,255,0.2);
  }
`

export const MenuLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  font-size: 15px;
`

export const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  padding: 12px;

  background: rgba(255,255,255,0.9);
  border-radius: 10px;

  color: #1c7fa0;

  text-align: left;
`

export const FooterLogo = styled.img`
  width: 40px;
  height: 40px;
`

export const FooterText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  span {
    font-weight: 600;
    font-size: 16px;
  }

  small {
    font-size: 12px;
  }
`