import { Layout } from '../../components/layout/Layout'
import { Header } from '../../components/ui/Header/Header'
import { Button } from '../../components/ui/Button'
import { DropDown } from '../../components/ui/DropDown/DropDown'
import { Card } from '../../components/ui/Card/Card'

import { useState } from 'react'
import { Select } from '../../components/ui/Select/Select'

interface NotaItem {
    titulo: string
    nota: string
}

interface Disciplina {
    nome: string
    notaTotal: string
    itens: NotaItem[]
}

export default function AlunoNotas() {
    const [turma, setTurma] = useState('')
    const [disciplina, setDisciplina] = useState('')
    const [aluno, setAluno] = useState('')

    const dados: Disciplina[] = [
        {
            nome: 'Disciplina / Aluno',
            notaTotal: '18/20',
            itens: [
                { titulo: 'Simulado predicados', nota: '9/10' },
                { titulo: 'Simulado predicados', nota: '9/10' },
            ],
        },
        {
            nome: 'Programação gamificada',
            notaTotal: '9/10',
            itens: [],
        },
        {
            nome: 'Design',
            notaTotal: '9/10',
            itens: [],
        },
        {
            nome: 'Inglês',
            notaTotal: '9/10',
            itens: [],
        },
    ]

    return (
        <Layout>
            <Header titulo="Notas">

                <Button label="Buscar" />

                <Select options={[]} />

            </Header>

            <Card>
                {dados.map((item, index) => (
                    <DropDown
                        key={index}
                        title={item.nome}
                        grade={`Nota: ${item.notaTotal}`}
                        defaultOpen={index === 0}
                        items={item.itens.map((sub) => ({
                            label: sub.titulo,
                            value: `Nota: ${sub.nota}`,
                        }))}
                    />
                ))}
            </Card>
        </Layout>
    )
}