import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { Card } from '../../../components/atoms/Card';
import { EmptyState } from '../../../components/molecules/EmptyState';
import { ErrorMessage } from '../../../components/molecules/ErrorMessage';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import { rotuloEscopo } from '../../destinos/validacao';
import { descreverNota, formatarNota } from '../notas';
import * as avaliacaoService from '../services/avaliacaoService';

// As notas que a pessoa deu. Tocar numa abre a edição (com "Excluir").
export function MinhasAvaliacoesScreen({ navigation }) {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      setAvaliacoes((await avaliacaoService.minhas()) || []);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const avaliar = () => navigation.navigate('AvaliacaoForm');

  return (
    <ScreenTemplate
      sobretitulo="Ranking"
      titulo="Minhas avaliações"
      aoVoltar={() => navigation.goBack()}
      direita={<Button titulo="+ Avaliar" pequeno onPress={avaliar} />}
    >
      {carregando ? (
        <ActivityIndicator color={colors.acento} />
      ) : erro ? (
        <>
          <ErrorMessage mensagem={erro} />
          <Button titulo="Tentar de novo" onPress={carregar} />
        </>
      ) : avaliacoes.length === 0 ? (
        <EmptyState
          titulo="Nenhuma avaliação ainda"
          mensagem="Dê uma nota de custo-benefício para os lugares que você já visitou."
          acao={<Button titulo="+ Avaliar destino" variante="primario" onPress={avaliar} />}
        />
      ) : (
        avaliacoes.map((a) => (
          <Card
            key={a.id}
            onPress={() => navigation.navigate('AvaliacaoForm', { avaliacao: a })}
            style={styles.card}
          >
            <View style={styles.textos}>
              <Text style={styles.cidade} numberOfLines={1}>
                {a.cidade}
              </Text>
              <Text style={styles.sub}>
                {a.pais} · {rotuloEscopo(a.escopo)}
              </Text>
              <Text style={styles.frase}>{descreverNota(Number(a.nota))}</Text>
            </View>
            <Text style={styles.nota}>{formatarNota(a.nota)}</Text>
          </Card>
        ))
      )}
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  textos: { flex: 1, gap: 2 },
  cidade: { fontFamily: fonts.titulo, fontSize: 18, color: colors.tinta },
  sub: { fontFamily: fonts.corpo, fontSize: 13, color: colors.suave },
  frase: { fontFamily: fonts.corpoSemi, fontSize: 12, color: colors.acento, marginTop: 2 },
  nota: { fontFamily: fonts.monoForte, fontSize: 26, color: colors.tinta },
});
