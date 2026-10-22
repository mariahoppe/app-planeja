import { StyleSheet, Text } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import { useAuth } from '../../../contexts/AuthContext';

// PROVISÓRIA: o painel de verdade consome GET /dashboard (Fase 2).
export function InicioScreen() {
  const { usuario, sair } = useAuth();

  return (
    <ScreenTemplate sobretitulo="Planeja" titulo={`Olá, ${usuario.nome}`}>
      <Text style={styles.texto}>{usuario.email}</Text>
      <Button titulo="Sair" bloco onPress={sair} />
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
