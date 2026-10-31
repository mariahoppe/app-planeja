import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { Card } from '../../../components/atoms/Card';
import { Input } from '../../../components/atoms/Input';
import { EmptyState } from '../../../components/molecules/EmptyState';
import { ErrorMessage } from '../../../components/molecules/ErrorMessage';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import * as destinoService from '../services/destinoService';
import { rotuloEscopo } from '../validacao';

const FILTROS = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'nacional', rotulo: 'Nacional' },
  { valor: 'internacional', rotulo: 'Internacional' },
];

export function DestinosScreen({ navigation }) {
  const [destinos, setDestinos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [busca, setBusca] = useState('');
  const [buscaAplicada, setBuscaAplicada] = useState('');
  const [escopo, setEscopo] = useState('todos');

  // Espera a pessoa parar de digitar antes de consultar a API.
  useEffect(() => {
    const espera = setTimeout(() => setBuscaAplicada(busca.trim()), 400);
    return () => clearTimeout(espera);
  }, [busca]);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      const filtros = { escopo };
      if (buscaAplicada) filtros.busca = buscaAplicada;
      const dados = await destinoService.listar(filtros);
      setDestinos(dados || []);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [buscaAplicada, escopo]);

  // Recarrega ao voltar ao foco (ex.: depois de salvar) e quando a busca ou o filtro mudam.
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const filtrando = Boolean(buscaAplicada) || escopo !== 'todos';
  const abrirNovo = () => navigation.navigate('DestinoForm');

  return (
    <ScreenTemplate
      sobretitulo="Para onde vou"
      titulo="Destinos"
      aoVoltar={() => navigation.goBack()}
      direita={<Button titulo="+ Novo" pequeno onPress={abrirNovo} />}
    >
      <Input
        placeholder="Buscar cidade ou país"
        value={busca}
        onChangeText={setBusca}
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Buscar cidade ou país"
      />

      <View style={styles.filtros}>
        {FILTROS.map((f) => (
          <Button
            key={f.valor}
            titulo={f.rotulo}
            pequeno
            variante={escopo === f.valor ? 'primario' : 'secundario'}
            onPress={() => setEscopo(f.valor)}
          />
        ))}
      </View>

      {carregando ? (
        <ActivityIndicator color={colors.acento} />
      ) : erro ? (
        <>
          <ErrorMessage mensagem={erro} />
          <Button titulo="Tentar de novo" onPress={carregar} />
        </>
      ) : destinos.length === 0 ? (
        filtrando ? (
          <EmptyState titulo="Nada encontrado" mensagem="Nenhum destino combina com a busca ou o filtro." />
        ) : (
          <EmptyState
            titulo="Nenhum destino ainda"
            mensagem="Cadastre as cidades que você quer visitar. Depois é só criar roteiros para elas."
            acao={<Button titulo="+ Cadastrar destino" variante="primario" onPress={abrirNovo} />}
          />
        )
      ) : (
        destinos.map((item) => (
          <Card key={item.id} onPress={() => navigation.navigate('DestinoForm', { destino: item })}>
            <View style={styles.linhaCard}>
              <Text style={styles.cidade}>{item.cidade}</Text>
              <Text style={styles.escopo}>{rotuloEscopo(item.escopo)}</Text>
            </View>
            <Text style={styles.sub}>
              {item.pais}
              {item.periodo ? ` · ${item.periodo}` : ''}
            </Text>
          </Card>
        ))
      )}
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  linhaCard: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  cidade: { flex: 1, fontFamily: fonts.titulo, fontSize: 17, color: colors.tinta },
  escopo: {
    fontFamily: fonts.corpoForte,
    fontSize: 9.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.acento,
  },
  sub: { fontFamily: fonts.corpo, fontSize: 13, color: colors.suave },
});
