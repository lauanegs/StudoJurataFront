import { Layout } from '../../../components/layout/Layout'
import { Header } from '../../../components/ui/Header/Header'

import { Input } from '../../../components/ui/Input/Input'
import { Card } from '../../../components/ui/Card/Card'
import { TextArea } from '../../../components/ui/TextArea/TextArea'
import { Button } from '../../../components/ui/Button'
import { useState } from 'react'

interface Chip {
    id: string
    nome: string
}

export default function NovaAula() {
    const [titulo, setTitulo] = useState('')
    const [dataPrevista, setDataPrevista] = useState('')
    const [quantidadeHorarios, setQuantidadeHorarios] = useState('')
    const [dataPublicacao, setDataPublicacao] = useState('')
    const [observacoes, setObservacoes] = useState('')
    const [conteudos, setConteudos] = useState<Chip[]>([])
    const [metodologias, setMetodologias] = useState<Chip[]>([])

    return (
        <Layout perfil="professor">
            <Header titulo="Nova aula">
                <Button label='Salvar' />
            </Header>

            <Card>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Input placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
                    <Input type="date" value={dataPrevista} onChange={(e) => setDataPrevista(e.target.value)} />
                    <Input placeholder="Quantidade de horários" value={quantidadeHorarios} onChange={(e) => setQuantidadeHorarios(e.target.value)} />

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Button label="Vincular conteúdo do plano de ensino" onClick={() => setConteudos([{ id: '1', nome: 'conteudo1' }, { id: '2', nome: 'conteudo2' }])} />
                        {conteudos.map((c) => (
                            <span key={c.id} style={{ padding: '8px 14px', borderRadius: '999px', border: '1px solid #d1d5db', fontSize: '13px' }}>{c.nome}</span>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Button label="Vincular metodologia" onClick={() => setMetodologias([{ id: '1', nome: 'conteudo1' }, { id: '2', nome: 'conteudo2' }])} />
                        {metodologias.map((m) => (
                            <span key={m.id} style={{ padding: '8px 14px', borderRadius: '999px', border: '1px solid #d1d5db', fontSize: '13px' }}>{m.nome}</span>
                        ))}
                    </div>

                    <Input type="date" value={dataPublicacao} onChange={(e) => setDataPublicacao(e.target.value)} />
                    <TextArea placeholder="Observações..." value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
                </div>
            </Card>

        </Layout>
    )
}
