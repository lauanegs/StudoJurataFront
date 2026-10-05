import styled from 'styled-components'

/*
 * A curva/banner é uma camada decorativa absoluta, fora do fluxo — assim o
 * card fica livre pra ser centralizado verticalmente em 100vh e a tela nunca
 * precisa de scroll, independente da altura da janela.
 *
 * A altura usa `min(vw, vh)` em vez de só `vh`: numa tela alta e estreita
 * (celular em pé), só vh faz a curva crescer desproporcional à largura —
 * "subir demais". Amarrando também à largura, ela cresce em telas largas
 * (desktop, onde a foto pode ocupar mais da página) sem inflar em telas
 * estreitas e altas.
 */
export const Tela = styled.div`
  position: relative;
  overflow: hidden;

  width: 100%;
  height: 100vh;

  background: ${({ theme }) => theme.colors.white};
`

/*
 * O recorte da curva tem 368px fixos colados na base; abaixo de ~196px de
 * altura o arco seria cortado e a curva viraria um "pico".
 */
export const Banner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 0;

  height: clamp(230px, min(28vw, 38vh), 360px);
  overflow: hidden;
`

/* Gradiente azul → roxo por baixo da foto, preenchendo toda a faixa. */
export const Gradiente = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.gradients.border};
`

export const ImagemBanner = styled.img`
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.15;
`

/*
 * Tamanho fixo (escala 1:1 do frame do Figma, 1280×367.5) — não usa % nem
 * vh, então a mordida ao redor do logo não muda de tamanho com a tela,
 * só sua posição (sempre centralizada, alinhada à base da faixa).
 */
export const Recorte = styled.img`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);

  width: 1280px;
  height: 368px;
  pointer-events: none;
`

export const Conteudo = styled.div`
  position: relative;
  z-index: 1;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
`
