import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { Card } from '../../../components/atoms/Card';
import { EmptyState } from '../../../components/molecules/EmptyState';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import * as roteiroService from '../services/roteiroService';

export function RoteirosScreen({ navigation }) {
  const [roteiros, setRoteiros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      const dados = await roteiroService.listar();
      setRoteiros(dados || []);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Recarrega sempre que a tela volta ao foco (ex.: depois de criar um roteiro).
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  return (
    <ScreenTemplate
      sobretitulo="Minhas viagens"
      titulo="Roteiros"
      direita={<Button titulo="+ Novo" pequeno onPress={() => navigation.navigate('RoteiroForm')} />}
    >
      {carregando ? (
        <ActivityIndicator color={colors.acento} />
      ) : erro ? (
        <Text style={styles.erro}>{erro}</Text>
      ) : roteiros.length === 0 ? (
        <EmptyState
          titulo="Nenhum roteiro ainda"
          mensagem="Crie seu primeiro roteiro de viagem."
          acao={
            <Button
              titulo="+ Criar roteiro"
              variante="primario"
              onPress={() => navigation.navigate('RoteiroForm')}
            />
          }
        />
      ) : (
        roteiros.map((item) => (
          <Card key={item.id} onPress={() => navigation.navigate('RoteiroDetalhe', { roteiro: item })}>
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
