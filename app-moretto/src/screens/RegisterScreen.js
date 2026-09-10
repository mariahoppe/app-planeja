/**
 * SCREEN — RegisterScreen
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Label } from '../components/atoms/Label';
import { RegisterForm } from '../components/organisms/RegisterForm';
import { CenteredTemplate } from '../components/templates/CenteredTemplate';
import { registrar } from '../services/auth';
import { espacamentos } from '../theme';

export function RegisterScreen({ navigation }) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  async function handleRegistro(dados) {
    setCarregando(true);
    setErro(null);
    try {
      await registrar(dados);
      navigation.replace('Feed');
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <CenteredTemplate
      cabecalho={
        <View>
          <Label variante="titulo">Criar conta</Label>
          <Label variante="legenda" style={styles.subtitulo}>
            Use um e-mail válido e uma senha
          </Label>
        </View>
      }>
      <RegisterForm
        onSubmit={handleRegistro}
        carregando={carregando}
        erro={erro}
      />
    </CenteredTemplate>
  );
}

const styles = StyleSheet.create({
  subtitulo: { marginTop: espacamentos.xs },
});
