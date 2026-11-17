import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { Input } from '../../../components/atoms/Input';
import { EmptyState } from '../../../components/molecules/EmptyState';
import { EstadoCarga } from '../../../components/molecules/EstadoCarga';
import { RodapeLista } from '../../../components/molecules/RodapeLista';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { useListaPaginada } from '../../../hooks/useListaPaginada';
import { CartaoRoteiro } from '../components/CartaoRoteiro';
import * as roteiroService from '../services/roteiroService';
import { FILTROS_STATUS } from '../validacao';

// Espera a pessoa parar de digitar antes de consultar a API.
const ESPERA_BUSCA_MS = 400;

/**
 * Minhas viagens (RF-06): busca pelo título, filtro por status e a lista em
 * páginas (RNF-04), da viagem mais próxima para a mais distante.
 */
export function RoteirosScreen({ navigation }) {
  const [busca, setBusca] = useState('');
  const [termo, setTermo] = useState('');
  const [status, setStatus] = useState('todos');

  useEffect(() => {
    const espera = setTimeout(() => setTermo(busca.trim()), ESPERA_BUSCA_MS);
    return () => clearTimeout(espera);
  }, [busca]);

  const buscarPagina = useCallback(
    (pagina, limite) => roteiroService.listar({ busca: termo || undefined, status, pagina, limite }),
    [termo, status]
  );
  const { itens: roteiros, erro, temMais, carregandoMais, recarregar, carregarMais } = useListaPaginada(buscarPagina);

  // Recarrega ao abrir, ao voltar (ex.: depois de criar ou editar) e quando busca ou filtro mudam.
  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar])
  );

  const filtrando = Boolean(termo) || status !== 'todos';
  const novo = () => navigation.navigate('RoteiroForm');

  return (
    <ScreenTemplate
      sobretitulo="Minhas viagens"
      titulo="Roteiros"
      direita={<Button titulo="+ Novo" pequeno onPress={novo} />}
      aoChegarNoFim={carregarMais}
    >
      <Input
        placeholder="Buscar pelo título"
        value={busca}
        onChangeText={setBusca}
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Buscar roteiro pelo título"
      />

      <View style={styles.filtros}>
        {FILTROS_STATUS.map((f) => (
          <Button
            key={f.valor}
            titulo={f.rotulo}
            pequeno
            variante={status === f.valor ? 'primario' : 'secundario'}
            onPress={() => setStatus(f.valor)}
          />
        ))}
      </View>

      {erro || roteiros === null ? (
        <EstadoCarga carregando={!erro} erro={erro} onTentarDeNovo={recarregar} />
      ) : roteiros.length === 0 ? (
        filtrando ? (
          <EmptyState titulo="Nada encontrado" mensagem="Nenhuma viagem combina com a busca ou o filtro." />
        ) : (
          <EmptyState
            titulo="Nenhum roteiro ainda"
            mensagem="Crie a primeira viagem: escolha o destino, as datas e depois adicione as atividades."
            acao={<Button titulo="+ Criar roteiro" variante="primario" onPress={novo} />}
          />
        )
      ) : (
        <>
          {roteiros.map((r) => (
            <CartaoRoteiro key={r.id} roteiro={r} onPress={() => navigation.navigate('RoteiroDetalhe', { roteiro: r })} />
          ))}
          <RodapeLista temMais={temMais} carregando={carregandoMais} onCarregarMais={carregarMais} />
        </>
      )}
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
