import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { EmptyState } from '../../../components/molecules/EmptyState';
import { EstadoCarga } from '../../../components/molecules/EstadoCarga';
import { RodapeLista } from '../../../components/molecules/RodapeLista';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import { useToast } from '../../../contexts/ToastContext';
import { useListaPaginada } from '../../../hooks/useListaPaginada';
import { CartaoGrupo } from '../components/CartaoGrupo';
import { EntrarComCodigo } from '../components/EntrarComCodigo';
import * as grupoService from '../services/grupoService';

/**
 * Meus grupos (RF-17 e RF-18): os grupos de viagem de que a pessoa participa,
 * em páginas (RNF-04), criar um grupo novo e entrar num grupo existente pelo
 * código de convite.
 */
export function GruposScreen({ navigation }) {
  const toast = useToast();

  const buscarPagina = useCallback((pagina, limite) => grupoService.listar({ pagina, limite }), []);
  const { itens: grupos, erro, temMais, carregandoMais, recarregar, carregarMais } = useListaPaginada(buscarPagina);
  const carregando = grupos === null && !erro;

  // Recarrega ao voltar para a aba (ex.: depois de criar um grupo).
  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar])
  );

  const abrirNovo = () => navigation.navigate('GrupoForm');

  const abrirGrupo = (grupo) => navigation.navigate('GrupoDetalhe', { id: grupo.id });

  function aoEntrar(grupo) {
    toast(`Você entrou em ${grupo.nome}.`);
    abrirGrupo(grupo);
  }

  return (
    <ScreenTemplate
      sobretitulo="Colaborativo"
      titulo="Grupos"
      direita={<Button titulo="+ Criar" pequeno onPress={abrirNovo} />}
      aoChegarNoFim={carregarMais}
    >
      {carregando || erro ? (
        <EstadoCarga carregando={carregando} erro={erro} onTentarDeNovo={recarregar} />
      ) : grupos.length === 0 ? (
        <EmptyState
          titulo="Nenhum grupo"
          mensagem="Crie um grupo para dividir o planejamento e as despesas de uma viagem."
          acao={<Button titulo="+ Criar grupo" variante="primario" onPress={abrirNovo} />}
        />
      ) : (
        <>
          <Text style={styles.secao}>Meus grupos</Text>
          {grupos.map((g) => (
            <CartaoGrupo key={g.id} grupo={g} onPress={() => abrirGrupo(g)} />
          ))}
          <RodapeLista temMais={temMais} carregando={carregandoMais} onCarregarMais={carregarMais} />
        </>
      )}

      {!carregando ? (
        <View style={styles.separador}>
          <EntrarComCodigo onEntrou={aoEntrar} />
        </View>
      ) : null}
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  secao: {
    fontFamily: fonts.corpoForte,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.tenue,
  },
  separador: {
    borderTopWidth: 1,
    borderTopColor: colors.linhaSuave,
    paddingTop: 8,
  },
});
