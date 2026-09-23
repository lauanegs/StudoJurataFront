import * as yup from 'yup'

export const inteiroPositivoOpcional = (mensagem: string) =>
  yup.string().test('inteiro-positivo', mensagem, (valor) => !valor || (Number.isInteger(Number(valor)) && Number(valor) > 0))

/** Inteiro positivo obrigatório (ex.: capacidade máxima da turma). */
export const inteiroPositivoObrigatorio = (mensagemObrigatorio: string, mensagemInvalido: string) =>
  yup
    .string()
    .required(mensagemObrigatorio)
    .test(
      'inteiro-positivo',
      mensagemInvalido,
      (valor) => !valor || (Number.isInteger(Number(valor)) && Number(valor) > 0),
    )

/** Data final opcional que não pode ser anterior à data do campo `campoInicio`. */
export const dataFimNaoAnterior = (campoInicio: string) =>
  yup.string().test('intervalo', 'A data final deve ser posterior à data inicial', function (fim) {
    const inicio = this.parent[campoInicio] as string | undefined
    return !inicio || !fim || new Date(fim).getTime() >= new Date(inicio).getTime()
  })

export const numeroPositivoOpcional = (mensagem: string) =>
  yup.string().test('numero-positivo', mensagem, (valor) => !valor || (Number.isFinite(Number(valor)) && Number(valor) > 0))
