/**
 * ORGANISM — RegisterForm
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../atoms/Button';
import { ErrorMessage } from '../molecules/ErrorMessage';
import { FormField } from '../molecules/FormField';
import { espacamentos } from '../../theme';

export function RegisterForm({ onSubmit, carregando = false, erro = null }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const podeEnviar =
    nome.trim().length > 0 &&
    email.trim().length > 0 &&
    senha.length > 0 &&
    !carregando;

  return (
    <View style={styles.container}>
      <ErrorMessage mensagem={erro} />

      <FormField
        label="Nome"
        placeholder="Seu nome"
        value={nome}
        onChangeText={setNome}
        erro={Boolean(erro)}
        autoCapitalize="words"
      />

      <FormField
        label="E-mail"
        placeholder="seu@email.com"
        value={email}
        onChangeText={setEmail}
        erro={Boolean(erro)}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
      />

      <FormField
        label="Senha"
        placeholder="Mínimo recomendado: 6 caracteres"
        value={senha}
        onChangeText={setSenha}
        erro={Boolean(erro)}
        secureTextEntry
      />

      <Button
        title="Criar conta"
        onPress={() => onSubmit({ nome, login: email, senha })}
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
