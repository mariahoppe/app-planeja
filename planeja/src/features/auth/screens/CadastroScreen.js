import { useState } from 'react';
import { Alert } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { Link } from '../../../components/atoms/Link';
import { FormField } from '../../../components/molecules/FormField';
import { AuthTemplate } from '../../../components/templates/AuthTemplate';
import { useAuth } from '../../../contexts/AuthContext';
import { emailValido } from '../validacao';

export function CadastroScreen({ navigation }) {
  const { cadastrar } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);

  // Mesmas regras e mensagens do protótipo (e compatíveis com o validator da API).
  function validar() {
    const novos = {};
    if (nome.trim().length < 3) novos.nome = 'Informe seu nome completo';
    if (!emailValido(email.trim())) novos.email = 'E-mail inválido';
    if (senha.length < 6) novos.senha = 'Mínimo de 6 caracteres';
    if (confirmacao !== senha) novos.confirmacao = 'As senhas não conferem';
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  // Ao cadastrar, a API já devolve o token: o AuthContext guarda o usuário e a
  // navegação troca sozinha para as abas, sem precisar fazer login depois.
  async function enviar() {
    if (!validar()) return;

    setCarregando(true);
    try {
      await cadastrar(nome.trim(), email.trim(), senha);
    } catch (erro) {
      Alert.alert('Não foi possível criar a conta', erro.message);
      setCarregando(false);
    }
  }

  return (
    <AuthTemplate sub="Criar conta">
      <FormField
        label="Nome completo"
        erro={erros.nome}
        value={nome}
        onChangeText={setNome}
        placeholder="Usuário"
        maxLength={80}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
      />
      <FormField
        label="E-mail"
        erro={erros.email}
        value={email}
        onChangeText={setEmail}
        placeholder="usuario@gmail.com"
        maxLength={120}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <FormField
        label="Senha"
        erro={erros.senha}
        dica="Mínimo de 6 caracteres"
        value={senha}
        onChangeText={setSenha}
        placeholder="••••••"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <FormField
        label="Confirmar senha"
        erro={erros.confirmacao}
        value={confirmacao}
        onChangeText={setConfirmacao}
        placeholder="••••••"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      />

      <Button titulo="Criar conta" variante="primario" bloco carregando={carregando} onPress={enviar} />

      <Link titulo="Já tenho conta · entrar" onPress={() => navigation.goBack()} />
    </AuthTemplate>
  );
}
