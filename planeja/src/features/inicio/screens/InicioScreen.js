import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Avatar } from '../../../components/atoms/Avatar';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { obterPerfilLocal } from '../../../services/perfilLocal';

// PROVISÓRIA: o painel de verdade consome GET /dashboard (Fase 2).
// O avatar abre o Perfil, que fica na pilha acima das abas (AppStack).
export function InicioScreen({ navigation }) {
  const { usuario } = useAuth();
  const [fotoUri, setFotoUri] = useState(null);

  // Ao voltar do Perfil, mostra a foto nova.
  useFocusEffect(
    useCallback(() => {
      obterPerfilLocal().then((local) => setFotoUri(local.fotoUri));
    }, [])
  );

  return (
    <ScreenTemplate
      sobretitulo="Planeja"
      titulo={`Olá, ${usuario.nome}`}
      direita={
        <Avatar nome={usuario.nome} fotoUri={fotoUri} onPress={() => navigation.navigate('Perfil')} />
      }
    >
      <Text style={styles.texto}>{usuario.email}</Text>
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  texto: {
    fontFamily: fonts.corpo,
    fontSize: 15,
    color: colors.suave,
  },
});
