import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'
import { Button } from '../../../components/ui/Button'
import { DropDown } from '../../../components/ui/DropDown/DropDown'
import { Card } from '../../../components/ui/Card/Card'

import { useState } from 'react'
import { Select } from '../../../components/ui/Select/Select'

interface NotaItem {
    titulo: string
    nota: string
}

interface Disciplina {
    nome: string
    notaTotal: string
    itens: NotaItem[]
}

export default function Notas() {
    const [turma, setTurma] = useState<string | number>('')
    const [contexto, setContexto] = useState<string | number>('')
    const [contextoEspecifico, setContextoEspecifico] = useState<string | number>('')

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
        <Layout perfil="professor">
            <Header titulo="Notas">
                <Select options={[{ value: '1', label: 'Geek Junior' }]} value={turma} onChange={setTurma} placeholder="Turma" />
                <Select
                    options={[{ value: 'disciplina', label: 'Disciplina' }, { value: 'aluno', label: 'Aluno' }]}
                    value={contexto}
                    onChange={setContexto}
                    placeholder="Disciplina / Aluno"
                />
                <Select options={[{ value: '1', label: 'Robótica' }]} value={contextoEspecifico} onChange={setContextoEspecifico} placeholder="Disciplina / Aluno (Específico)" />
                <Button label="Buscar" />
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
