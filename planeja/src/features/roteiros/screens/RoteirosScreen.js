import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../../../components/atoms/Button';
import { Input } from '../../../components/atoms/Input';
import { EmptyState } from '../../../components/molecules/EmptyState';
import { EstadoCarga } from '../../../components/molecules/EstadoCarga';
import { RodapeLista } from '../../../components/molecules/RodapeLista';
import { SeletorSegmentado } from '../../../components/molecules/SeletorSegmentado';
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
export function RoteirosScreen({ navigation, seletor }) {
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
      sobretitulo="Planejamento"
      titulo="Roteiros"
      aoChegarNoFim={carregarMais}
    >
      {seletor}

      <Button titulo="+ Novo roteiro" variante="primario" bloco onPress={novo} />

      <Input
        placeholder="Buscar pelo título"
        value={busca}
        onChangeText={setBusca}
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Buscar roteiro pelo título"
      />

      <SeletorSegmentado opcoes={FILTROS_STATUS} valor={status} onChange={setStatus} />

      {erro || roteiros === null ? (
        <EstadoCarga carregando={!erro} erro={erro} onTentarDeNovo={recarregar} />
      ) : roteiros.length === 0 ? (
        filtrando ? (
          <EmptyState titulo="Nada encontrado" mensagem="Nenhuma viagem combina com a busca ou o filtro." />
        ) : (
          <EmptyState titulo="Nenhum roteiro" mensagem="Crie um roteiro a partir de um destino cadastrado." />
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
