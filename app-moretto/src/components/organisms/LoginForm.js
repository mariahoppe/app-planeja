/**
 * ORGANISM — LoginForm
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../atoms/Button';
import { ErrorMessage } from '../molecules/ErrorMessage';
import { FormField } from '../molecules/FormField';
import { espacamentos } from '../../theme';

export function LoginForm({ onSubmit, carregando = false, erro = null }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const podeEnviar = email.trim().length > 0 && senha.length > 0 && !carregando;

  return (
    <View style={styles.container}>
      <ErrorMessage mensagem={erro} />

      <FormField
        label="E-mail"
        placeholder="seu@email.com"
        value={email}
        onChangeText={setEmail}
        erro={Boolean(erro)}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        returnKeyType="next"
      />

      <FormField
        label="Senha"
        placeholder="Sua senha"
        value={senha}
        onChangeText={setSenha}
        erro={Boolean(erro)}
        secureTextEntry
        returnKeyType="go"
        onSubmitEditing={() => podeEnviar && onSubmit(email, senha)}
      />

      <Button
        title="Entrar"
        onPress={() => onSubmit(email, senha)}
        carregando={carregando}
        desabilitado={!podeEnviar}
        style={styles.botao}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  botao: { marginTop: espacamentos.sm },
});
