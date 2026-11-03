import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { Link } from '../../../components/atoms/Link';
import { FormField } from '../../../components/molecules/FormField';
import { AuthTemplate } from '../../../components/templates/AuthTemplate';
import { colors, fonts } from '../../../config/theme';
import { useToast } from '../../../contexts/ToastContext';
import { esqueciSenha } from '../services/authService';
import { emailValido } from '../validacao';

export function EsqueciSenhaScreen({ navigation, route }) {
  const toast = useToast();
  // Como no protótipo, o e-mail digitado no login já vem preenchido.
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  // A API responde igual para e-mail cadastrado ou não, então a tela sempre segue
  // para o código: assim ninguém descobre quem tem conta no Planeja.
  async function enviar() {
    const valor = email.trim();
    if (!emailValido(valor)) {
      setErro('E-mail inválido');
      return;
    }

    setErro(null);
    setCarregando(true);
    try {
      await esqueciSenha(valor);
      toast(`Código enviado para ${valor}`);
      navigation.navigate('RedefinirSenha', { email: valor });
    } catch (falha) {
      Alert.alert('Não foi possível enviar o código', falha.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <AuthTemplate sub="Recuperar senha">
      <Text style={styles.texto}>
        Informe o e-mail da sua conta. Enviaremos um código de seis dígitos para redefinir a senha.
      </Text>

      <FormField
        label="E-mail"
        erro={erro}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />

      <Button titulo="Enviar código" variante="primario" bloco carregando={carregando} onPress={enviar} />

      <Link titulo="Voltar para o login" onPress={() => navigation.popTo('Login', { email: email.trim() })} />
    </AuthTemplate>
  );
}

const styles = StyleSheet.create({
  texto: {
    fontFamily: fonts.corpo,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.suave,
  },
});
