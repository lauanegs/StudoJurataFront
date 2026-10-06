import { useMemo } from 'react'
import { schemaResolver, useForm } from '@mantine/form'
import * as yup from 'yup'

import { dataFimNaoAnterior, inteiroPositivoOpcional, numeroPositivoOpcional } from '@/dominios/comum/formulario'
import { horaParaMinutos } from '@/utils/format'

import type { DadosConteudo, DadosAula, ContextoAula, DadosPlanoEnsino } from './types'
const conteudoSchema = yup.object({
  ordem: inteiroPositivoOpcional('A ordem deve ser um número inteiro positivo'),
  titulo: yup.string().trim().required('Informe o título do conteúdo'),
  descricao: yup
    .string()
    .trim()
    .required('Descreva o conteúdo — a IA usa este texto para gerar as questões')
    .min(30, 'Descreva com mais detalhe (mínimo de 30 caracteres)'),
})

export function useFormularioConteudo() {
  return useForm<DadosConteudo>({
    initialValues: { ordem: '', titulo: '', descricao: '' },
    validate: schemaResolver(conteudoSchema),
    validateInputOnBlur: true,
  })
}

export function useFormularioAula({ semHorarioCadastrado, ordensOcupadas, ordemSugerida }: ContextoAula) {
  const validate = useMemo(
    () =>
      schemaResolver(
        yup.object({
          titulo: yup.string().trim().required('Informe o título da aula'),
          ordem: yup
            .string()
            .transform((valor: string) => valor || ordemSugerida)
            .concat(inteiroPositivoOpcional('A ordem deve ser um número inteiro positivo'))
            .test('ordem-unica', 'Já existe uma aula com esta ordem', (valor) => !valor || !ordensOcupadas.includes(Number(valor))),
          horarioTurmaId: semHorarioCadastrado ? yup.number().nullable() : yup.number().nullable().required('Selecione o horário da turma'),
          cargaHorariaManual: semHorarioCadastrado
            ? yup.string().test('carga', 'Informe a carga horária da aula', (valor) => Boolean(valor) && horaParaMinutos(valor as string) > 0)
            : yup.string(),
        }),
      ),
    [semHorarioCadastrado, ordensOcupadas, ordemSugerida],
  )

  return useForm<DadosAula>({
    initialValues: { ordem: '', titulo: '', dataPrevista: '', dataPublicacao: '', horarioTurmaId: null, cargaHorariaManual: '', observacoes: '' },
    validate,
    validateInputOnBlur: true,
  })
}

const planoEnsinoSchema = yup.object({
  cursoId: yup.number().nullable().required('Selecione o curso'),
  turmaId: yup.number().nullable().required('Selecione a turma'),
  disciplinaId: yup.number().nullable().required('Selecione a disciplina'),
  cargaHoraria: numeroPositivoOpcional('Informe um número de horas maior que zero'),
  dataFim: dataFimNaoAnterior('dataInicio'),
})

export function useFormularioPlanoEnsino() {
  return useForm<DadosPlanoEnsino>({
    initialValues: {
      cursoId: null,
      turmaId: null,
      disciplinaId: null,
      cargaHoraria: '',
      dataInicio: '',
      dataFim: '',
      ementa: '',
      objetivoGeral: '',
      metodologia: '',
      status: 'ATIVO',
    },
    validate: schemaResolver(planoEnsinoSchema),
  })
}
