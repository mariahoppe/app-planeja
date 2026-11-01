import { useState } from 'react';

import { Button } from '../../../components/atoms/Button';
import { FormField } from '../../../components/molecules/FormField';
import { PainelInferior } from '../../../components/molecules/PainelInferior';
import { validarTrocaSenha } from '../validacao';

/**
 * Painel "Trocar senha". Quem fala com a API é a tela:
 * aqui só validamos e chamamos onConfirmar com { senhaAtual, novaSenha }.
 */
export function PainelTrocarSenha({ onConfirmar, onFechar, carregando = false }) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erros, setErros] = useState({});

  function confirmar() {
    const e = validarTrocaSenha({ senhaAtual, novaSenha, confirmacao });
    setErros(e);
    if (Object.keys(e).length > 0) return;
    onConfirmar({ senhaAtual, novaSenha });
  }

  return (
    <PainelInferior
      titulo="Trocar senha"
      onFechar={onFechar}
      rodape={<Button titulo="Confirmar" variante="primario" bloco carregando={carregando} onPress={confirmar} />}
    >
      <FormField
        label="Senha atual"
        value={senhaAtual}
        onChangeText={setSenhaAtual}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        erro={erros.senhaAtual}
      />

      <FormField
        label="Nova senha"
        dica="Mínimo de 6 caracteres"
        value={novaSenha}
        onChangeText={setNovaSenha}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        erro={erros.novaSenha}
      />

      <FormField
        label="Confirmar nova senha"
        value={confirmacao}
        onChangeText={setConfirmacao}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        erro={erros.confirmacao}
      />
    </PainelInferior>
  );
}
