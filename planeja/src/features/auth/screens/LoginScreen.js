import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { Link } from '../../../components/atoms/Link';
import { FormField } from '../../../components/molecules/FormField';
import { AuthTemplate } from '../../../components/templates/AuthTemplate';
import { colors, fonts } from '../../../config/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { emailValido } from '../validacao';

export function LoginScreen({ navigation }) {
  const { entrar } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);

  // Mesmas regras e mensagens do protótipo; a API só é chamada com os campos ok.
  function validar() {
    const novos = {};
    if (!emailValido(email.trim())) novos.email = 'E-mail inválido';
    if (senha.length < 6) novos.senha = 'Mínimo de 6 caracteres';
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function enviar() {
    if (!validar()) return;

    setCarregando(true);
    try {
      await entrar(email.trim(), senha);
    } catch (erro) {
      Alert.alert('Não foi possível entrar', erro.message);
    } finally {
      setCarregando(false);
    }
  }

  function irPara(tela) {
    setErros({});
    navigation.navigate(tela);
  }

  return (
    <AuthTemplate sub="Suas viagens, organizadas">
      <FormField
        label="E-mail"
        erro={erros.email}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <FormField
        label="Senha"
        erro={erros.senha}
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
      />

      <Button titulo="Entrar" variante="primario" bloco carregando={carregando} onPress={enviar} />

      <Link titulo="Esqueci minha senha" onPress={() => irPara('EsqueciSenha')} />

      <View style={styles.divisor}>
        <View style={styles.divisorLinha} />
        <Text style={styles.divisorTexto}>ou</Text>
        <View style={styles.divisorLinha} />
      </View>

      <Button titulo="Criar uma conta" bloco onPress={() => irPara('Cadastro')} />
    </AuthTemplate>
  );
}

const styles = StyleSheet.create({
  divisor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  divisorLinha: {
    flex: 1,
    height: 1,
    backgroundColor: colors.linha,
  },
  divisorTexto: {
    fontFamily: fonts.corpo,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.tenue,
  },
});
