import { useState } from 'react';
import { Alert } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { Link } from '../../../components/atoms/Link';
import { FormField } from '../../../components/molecules/FormField';
import { AuthTemplate } from '../../../components/templates/AuthTemplate';
import { useToast } from '../../../contexts/ToastContext';
import { redefinirSenha } from '../services/authService';

export function RedefinirSenhaScreen({ navigation, route }) {
  const toast = useToast();
  const { email } = route.params;
  const [codigo, setCodigo] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);

  const codigoDigitos = codigo.replace(/\D/g, '');

  // Mesmas regras e mensagens do protótipo.
  function validar() {
    const novos = {};
    if (codigoDigitos.length !== 6) novos.codigo = 'O código tem seis dígitos';
    if (senha.length < 6) novos.senha = 'Mínimo de 6 caracteres';
    if (confirmacao !== senha) novos.confirmacao = 'As senhas não conferem';
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function enviar() {
    if (!validar()) return;

    setCarregando(true);
    try {
      await redefinirSenha(email, codigoDigitos, senha);
      toast('Senha redefinida com sucesso.');
      navigation.popTo('Login', { email });
    } catch (erro) {
      // 400 é código errado ou vencido; sem conexão ou limite de tentativas vai no alerta.
      if (erro.status === 400) {
        setErros({ codigo: erro.message });
      } else {
        Alert.alert('Não foi possível redefinir a senha', erro.message);
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <AuthTemplate sub="Nova senha">
      <FormField
        label="Código recebido"
        erro={erros.codigo}
        value={codigo}
        onChangeText={setCodigo}
        placeholder="000000"
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
      />
      <FormField
        label="Nova senha"
        erro={erros.senha}
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <FormField
        label="Confirmar nova senha"
        erro={erros.confirmacao}
        value={confirmacao}
        onChangeText={setConfirmacao}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      />

      <Button titulo="Redefinir senha" variante="primario" bloco carregando={carregando} onPress={enviar} />

      <Link titulo="Cancelar" onPress={() => navigation.popTo('Login', { email })} />
    </AuthTemplate>
  );
}
