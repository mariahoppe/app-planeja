import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { EmptyState } from '../../../components/molecules/EmptyState';
import { EstadoCarga } from '../../../components/molecules/EstadoCarga';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import { useToast } from '../../../contexts/ToastContext';
import { CartaoGrupo } from '../components/CartaoGrupo';
import { EntrarComCodigo } from '../components/EntrarComCodigo';
import * as grupoService from '../services/grupoService';

/**
 * Meus grupos (RF-17 e RF-18): os grupos de viagem de que a pessoa participa,
 * criar um grupo novo e entrar num grupo existente pelo código de convite.
 */
export function GruposScreen({ navigation }) {
  const toast = useToast();
  const [grupos, setGrupos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      const dados = await grupoService.listar();
      setGrupos(dados || []);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Recarrega ao voltar para a aba (ex.: depois de criar um grupo).
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const abrirNovo = () => navigation.navigate('GrupoForm');

  function aoEntrar(grupo) {
    toast(`Você entrou em ${grupo.nome}.`);
    carregar();
  }

  return (
    <ScreenTemplate
      sobretitulo="Viagens em grupo"
      titulo="Grupos"
      direita={<Button titulo="+ Criar" pequeno onPress={abrirNovo} />}
    >
      {carregando || erro ? (
        <EstadoCarga carregando={carregando} erro={erro} onTentarDeNovo={carregar} />
      ) : grupos.length === 0 ? (
        <EmptyState
          titulo="Nenhum grupo ainda"
          mensagem="Crie um grupo para dividir uma viagem com outras pessoas, ou entre num grupo com o código de convite."
          acao={<Button titulo="+ Criar grupo" variante="primario" onPress={abrirNovo} />}
        />
      ) : (
        <>
          <Text style={styles.secao}>Meus grupos</Text>
          {grupos.map((g) => (
            <CartaoGrupo key={g.id} grupo={g} />
          ))}
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
