import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { get } from '../../../api/api';
import { Button } from '../../../components/atoms/Button';
import { FormField } from '../../../components/molecules/FormField';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';

import * as roteiroService from '../services/roteiroService';

const STATUS = ['planejando', 'confirmado', 'concluido'];

export function RoteiroFormScreen() {
    const [titulo, setTitulo] = useState('');
    const [destinoId, setDestinoId] = useState(null);
    const [inicio, setInicio] = useState('');
    const [fim, setFim] = useState('');
    const [status, setStatus] = useState('planejando');
    const [obs, setObs] = useState('');

    const [destinos, setDestinos] = useState([]);
    const [salvando, setSalvando] = useState(false);
    const [erros, setErros] = useState({}); // NOVO: guarda os erros de cada campo

    useEffect(() => {
        get('/destinos')
            .then((lista) => setDestinos(lista || []))
            .catch(() => { });
    }, []);

    // NOVO: confere os campos e devolve um objeto de erros ({} = tudo certo)
    function validar() {
        const e = {};
        if (!titulo.trim()) e.titulo = 'Informe um título';
        if (!destinoId) e.destino = 'Escolha um destino';
        if (!inicio.trim()) {
            e.inicio = 'Informe a data de início';
        } else if (!/^\d{4}-\d{2}-\d{2}$/.test(inicio)) {
            e.inicio = 'Use o formato ano-mês-dia (ex.: 2026-12-01)';
        }
        if (fim && fim < inicio) e.fim = 'O fim não pode ser antes do início';
        return e;
    }

    async function salvar() {
        const e = validar();        // NOVO
        setErros(e);                // NOVO: mostra os erros nos campos
        if (Object.keys(e).length > 0) return; // NOVO: tem erro → não envia

        try {
            setSalvando(true);
            const dados = {
                titulo,
                destino_id: destinoId,
                inicio,
                fim: fim || null,
                status,
                obs,
            };
            await roteiroService.criar(dados);
            Alert.alert('Pronto', 'Roteiro criado!');
        } catch (err) {
            Alert.alert('Erro', err.message);
        } finally {
            setSalvando(false);
        }
    }

    return (
        <ScreenTemplate sobretitulo="Nova viagem" titulo="Novo roteiro">
            <FormField
                label="Título"
                placeholder="Férias em Paris"
                value={titulo}
                onChangeText={setTitulo}
                erro={erros.titulo}
            />

            <FormField label="Destino" erro={erros.destino}>
                <View style={styles.opcoes}>
                    {destinos.map((d) => (
                        <Button
                            key={d.id}
                            titulo={d.cidade}
                            pequeno
                            variante={destinoId === d.id ? 'primario' : 'secundario'}
                            onPress={() => setDestinoId(d.id)}
                        />
                    ))}
                </View>
            </FormField>

            <FormField
                label="Início"
                placeholder="2026-12-01"
                dica="Formato: ano-mês-dia"
                value={inicio}
                onChangeText={setInicio}
                erro={erros.inicio}
            />

            <FormField
                label="Fim (opcional)"
                placeholder="2026-12-10"
                value={fim}
                onChangeText={setFim}
                erro={erros.fim}
            />

            <FormField label="Status">
                <View style={styles.opcoes}>
                    {STATUS.map((s) => (
                        <Button
                            key={s}
                            titulo={s}
                            pequeno
                            variante={status === s ? 'primario' : 'secundario'}
                            onPress={() => setStatus(s)}
                        />
                    ))}
                </View>
            </FormField>

            <FormField
                label="Observações (opcional)"
                placeholder="Anotações da viagem"
                value={obs}
                onChangeText={setObs}
            />

            <Button
                titulo="Salvar roteiro"
                variante="primario"
                bloco
                carregando={salvando}
                onPress={salvar}
            />
        </ScreenTemplate>
    );
}

const styles = StyleSheet.create({
    opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
