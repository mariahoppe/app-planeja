import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { Card } from '../../../components/atoms/Card';
import { EmptyState } from '../../../components/molecules/EmptyState';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import * as roteiroService from '../services/roteiroService';

export function RoteirosScreen() {
    // As 3 "memórias" da tela:
    const [roteiros, setRoteiros] = useState([]);       // a lista — começa vazia
    const [carregando, setCarregando] = useState(true); // começa carregando
    const [erro, setErro] = useState(null);             // sem erro no começo

    // Roda UMA vez, quando a tela abre:
    useEffect(() => {
        async function carregar() {
            try {
                const dados = await roteiroService.listar(); // chama o SEU service
                setRoteiros(dados || []);                    // guarda a lista na memória
            } catch (e) {
                setErro(e.message);                          // guarda a mensagem de erro
            } finally {
                setCarregando(false);                        // acabou de carregar (deu certo ou não)
            }
        }
        carregar();
    }, []);

    return (
        <ScreenTemplate sobretitulo="Minhas viagens" titulo="Roteiros">
            {carregando ? (
                <ActivityIndicator color={colors.acento} />
            ) : erro ? (
                <Text style={styles.erro}>{erro}</Text>
            ) : roteiros.length === 0 ? (
                <EmptyState
                    titulo="Nenhum roteiro ainda"
                    mensagem="Seus roteiros de viagem vão aparecer aqui."
                />
            ) : (
                roteiros.map((item) => (
                    <Card key={item.id}>
                        <Text style={styles.titulo}>{item.titulo}</Text>
                        <Text style={styles.sub}>
                            {item.destino?.cidade} · {item.status}
                        </Text>
                    </Card>
                ))
            )}
        </ScreenTemplate>
    );
}

const styles = StyleSheet.create({
    titulo: { fontFamily: fonts.tituloMedio, fontSize: 16, color: colors.tinta },
    sub: { fontFamily: fonts.corpo, fontSize: 13, color: colors.suave },
    erro: { fontFamily: fonts.corpo, fontSize: 14, color: colors.acento },
});
