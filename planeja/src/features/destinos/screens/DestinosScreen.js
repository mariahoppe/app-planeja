import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { Card } from '../../../components/atoms/Card';
import { Etiqueta } from '../../../components/atoms/Etiqueta';
import { Input } from '../../../components/atoms/Input';
import { EmptyState } from '../../../components/molecules/EmptyState';
import { EstadoCarga } from '../../../components/molecules/EstadoCarga';
import { RodapeLista } from '../../../components/molecules/RodapeLista';
import { SeletorSegmentado } from '../../../components/molecules/SeletorSegmentado';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import { useListaPaginada } from '../../../hooks/useListaPaginada';
import * as destinoService from '../services/destinoService';
import { rotuloEscopo } from '../validacao';

const FILTROS = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'nacional', rotulo: 'Nacional' },
  { valor: 'internacional', rotulo: 'Internacional' },
];

export function DestinosScreen({ navigation, seletor }) {
  const [busca, setBusca] = useState('');
  const [buscaAplicada, setBuscaAplicada] = useState('');
  const [escopo, setEscopo] = useState('todos');

  // Espera a pessoa parar de digitar antes de consultar a API.
  useEffect(() => {
    const espera = setTimeout(() => setBuscaAplicada(busca.trim()), 400);
    return () => clearTimeout(espera);
  }, [busca]);

  const buscarPagina = useCallback(
    (pagina, limite) => destinoService.listar({ escopo, busca: buscaAplicada || undefined, pagina, limite }),
    [buscaAplicada, escopo]
  );
  const { itens: destinos, erro, temMais, carregandoMais, recarregar: carregar, carregarMais } =
    useListaPaginada(buscarPagina);

  // Recarrega ao voltar ao foco (ex.: depois de salvar) e quando a busca ou o filtro mudam.
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const filtrando = Boolean(buscaAplicada) || escopo !== 'todos';
  const abrirNovo = () => navigation.navigate('DestinoForm');

  return (
    <ScreenTemplate sobretitulo="Cadastro" titulo="Destinos" aoChegarNoFim={carregarMais}>
      {seletor}

      <Button titulo="+ Novo destino" variante="primario" bloco onPress={abrirNovo} />

      <Input
        placeholder="Buscar cidade ou país"
        value={busca}
        onChangeText={setBusca}
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Buscar cidade ou país"
      />

      <SeletorSegmentado opcoes={FILTROS} valor={escopo} onChange={setEscopo} />

      {erro || destinos === null ? (
        <EstadoCarga carregando={!erro} erro={erro} onTentarDeNovo={carregar} />
      ) : destinos.length === 0 ? (
        filtrando ? (
          <EmptyState titulo="Nada encontrado" mensagem="Nenhum destino combina com a busca ou o filtro." />
        ) : (
          <EmptyState
            titulo="Nenhum destino aqui"
            mensagem="Cadastre uma cidade para começar a planejar."
            acao={<Button titulo="+ Adicionar destino" variante="primario" onPress={abrirNovo} />}
          />
        )
      ) : (
        <>
          {destinos.map((item) => (
            <CartaoDestino key={item.id} destino={item} onPress={() => navigation.navigate('DestinoForm', { destino: item })} />
          ))}
          <RodapeLista temMais={temMais} carregando={carregandoMais} onCarregarMais={carregarMais} />
        </>
      )}
    </ScreenTemplate>
  );
}

// O card de destino do protótipo: cidade e país, etiqueta do escopo, observação e período.
function CartaoDestino({ destino, onPress }) {
  return (
    <Card onPress={onPress}>
      <View style={styles.topo}>
        <View style={styles.nomes}>
          <Text style={styles.cidade}>{destino.cidade}</Text>
          <Text style={styles.pais}>{destino.pais}</Text>
        </View>
        <Etiqueta tipo={destino.escopo === 'nacional' ? 'neutro' : 'acento'}>{rotuloEscopo(destino.escopo)}</Etiqueta>
      </View>
      {destino.obs ? (
        <Text style={styles.obs} numberOfLines={3}>
          {destino.obs}
        </Text>
      ) : null}
      <View style={styles.rodape}>
        <Text style={styles.rodapeRotulo}>Período</Text>
        <Text style={styles.rodapeValor}>{destino.periodo || 'a definir'}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  topo: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  nomes: { flex: 1, gap: 1 },
  cidade: { fontFamily: fonts.titulo, fontSize: 17, color: colors.tinta },
  pais: { fontFamily: fonts.corpo, fontSize: 12, color: colors.suave },
  obs: { fontFamily: fonts.corpo, fontSize: 13, lineHeight: 18, color: colors.tintaSuave },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.linhaSuave,
    paddingTop: 8,
  },
  rodapeRotulo: { fontFamily: fonts.corpo, fontSize: 12, color: colors.suave },
  rodapeValor: { fontFamily: fonts.corpoSemi, fontSize: 12, color: colors.tinta },
});
