/**
 * SCREEN — ProfileScreen
 * Tela de exemplo alcançada a partir de um dos botões da Home.
 */
import { StyleSheet, View } from 'react-native';

import { Button } from '../components/atoms/Button';
import { Label } from '../components/atoms/Label';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { USUARIO_TESTE } from '../services/auth';
import { cores, espacamentos, raios } from '../theme';

export function ProfileScreen({ navigation }) {
  const dados = [
    { rotulo: 'Nome', valor: 'Usuário de Teste' },
    { rotulo: 'E-mail', valor: USUARIO_TESTE },
    { rotulo: 'Perfil', valor: 'Administrador' },
  ];

  return (
    <ScreenTemplate
      titulo="Meu Perfil"
      subtitulo="Dados carregados localmente, sem API"
      rodape={
        <Button title="Voltar" variante="secundario" onPress={() => navigation.goBack()} />
      }>
      <View style={styles.cartao}>
        {dados.map(item => (
          <View key={item.rotulo} style={styles.linha}>
            <Label variante="legenda">{item.rotulo}</Label>
            <Label variante="subtitulo">{item.valor}</Label>
          </View>
        ))}
      </View>
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.md,
  },
  linha: { paddingVertical: espacamentos.sm },
});
