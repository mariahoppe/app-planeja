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

const ESCOPOS = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'nacional', rotulo: 'Nacional' },
  { valor: 'internacional', rotulo: 'Internacional' },
];

/**
 * Lista dos destinos do usuário (RF-05), com busca por cidade/país e filtro de escopo.
 * Tocar num destino abre o formulário em modo edição; "+ Novo" abre em modo criação.
 */
export function DestinosScreen({ navigation }) {
  const [destinos, setDestinos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');
  const [escopo, setEscopo] = useState('todos');
  const [focos, setFocos] = useState(0);

  // Ao voltar do formulário, recarrega para mostrar o que foi criado, editado ou excluído.
  useFocusEffect(
    useCallback(() => {
      setFocos((n) => n + 1);
    }, [])
  );

  // Espera a pessoa parar de digitar (300 ms) antes de buscar na API.
  // "atual" descarta a resposta de uma busca antiga que chegue depois da mais nova.
  useEffect(() => {
    let atual = true;
    async function carregar() {
      try {
        const filtros = { escopo };
        if (busca.trim()) filtros.busca = busca.trim();
        const dados = await destinoService.listar(filtros);
        if (!atual) return;
        setDestinos(dados || []);
        setErro(null);
      } catch (e) {
        if (atual) setErro(e.message);
      } finally {
        if (atual) setCarregando(false);
      }
    }
    const espera = setTimeout(carregar, 300);
    return () => {
      atual = false;
      clearTimeout(espera);
    };
  }, [busca, escopo, focos]);

  const filtrando = busca.trim() || escopo !== 'todos';

  return (
    <ScreenTemplate
      sobretitulo="Minhas viagens"
      titulo="Destinos"
      aoVoltar={() => navigation.goBack()}
      direita={<Button titulo="+ Novo" pequeno variante="primario" onPress={() => navigation.navigate('DestinoForm')} />}
    >
      <Input
        placeholder="Buscar cidade ou país"
        value={busca}
        onChangeText={setBusca}
        returnKeyType="search"
        accessibilityLabel="Buscar cidade ou país"
      />

      <View style={styles.opcoes}>
        {ESCOPOS.map((e) => (
          <Button
            key={e.valor}
            titulo={e.rotulo}
            pequeno
            variante={escopo === e.valor ? 'primario' : 'secundario'}
            onPress={() => setEscopo(e.valor)}
          />
        ))}
      </View>

      <ErrorMessage mensagem={erro} />

      {carregando ? (
        <ActivityIndicator color={colors.acento} />
      ) : erro ? null : destinos.length === 0 ? (
        filtrando ? (
          <EmptyState titulo="Nada encontrado" mensagem="Nenhum destino combina com a busca ou o filtro." />
        ) : (
          <EmptyState
            titulo="Nenhum destino ainda"
            mensagem="Cadastre as cidades que você quer visitar para montar roteiros depois."
            acao={<Button titulo="+ Novo destino" variante="primario" onPress={() => navigation.navigate('DestinoForm')} />}
          />
        )
      ) : (
        destinos.map((item) => (
          <Card key={item.id} onPress={() => navigation.navigate('DestinoForm', { id: item.id })}>
            <Text style={styles.titulo}>{item.cidade}</Text>
            <Text style={styles.sub}>
              {item.pais} · {item.escopo === 'nacional' ? 'Nacional' : 'Internacional'}
              {item.periodo ? ` · ${item.periodo}` : ''}
            </Text>
          </Card>
        ))
      )}
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  titulo: { fontFamily: fonts.tituloMedio, fontSize: 16, color: colors.tinta },
  sub: { fontFamily: fonts.corpo, fontSize: 13, color: colors.suave },
});
