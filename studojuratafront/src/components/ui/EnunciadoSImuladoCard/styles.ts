import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  
  width: 100%;
  padding: 32px;
  background-color: #12a1c1; /* Azul do fundo */
  border-radius: 16px;
  position: relative;
`

export const Mascote = styled.img`
  width: 100px;
  height: auto;
  z-index: 2;
`

export const BalaoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  flex: 1;
  background-color: #ffffff;
  padding: 24px 32px;
  border-radius: 60px; /* Bordas bem arredondadas */
  position: relative;

  /* Triângulo do Balão */
  &::before {
    content: '';
    position: absolute;
    left: -15px;
    top: 50%;
    transform: translateY(-50%);
    border-top: 15px solid transparent;
    border-bottom: 15px solid transparent;
    border-right: 20px solid #ffffff;
  }
`

export const Texto = styled.p`
  color: #12a1c1;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  text-align: center;
  flex: 1;
`

export const AudioButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  
  width: 54px;
  height: 54px;
  background-color: #12a1c1;
  border: none;
  border-radius: 50%;
  color: #ffffff;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
    background-color: #0e8ca8;
  }
`