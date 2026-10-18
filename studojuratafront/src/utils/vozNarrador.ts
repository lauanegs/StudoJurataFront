const PONTUACAO_VOZES: [RegExp, number][] = [
  [/natural|neural/i, 10],
  [/francisca|thalita/i, 5],
  [/google/i, 4],
  [/luciana|joana|fernanda/i, 3],
  [/online/i, 2],
]

function pontuar(voz: SpeechSynthesisVoice) {
  return PONTUACAO_VOZES.reduce((total, [padrao, pontos]) => (padrao.test(voz.name) ? total + pontos : total), 0)
}

function escolherVoz() {
  const vozes = window.speechSynthesis.getVoices().filter((voz) => voz.lang.replace('_', '-').toLowerCase() === 'pt-br')
  return vozes.sort((a, b) => pontuar(b) - pontuar(a))[0]
}

export function criarFalaDivertida(texto: string) {
  const fala = new SpeechSynthesisUtterance(texto)
  fala.lang = 'pt-BR'
  fala.voice = escolherVoz() ?? null
  fala.pitch = 1.3
  fala.rate = 1.02
  return fala
}
