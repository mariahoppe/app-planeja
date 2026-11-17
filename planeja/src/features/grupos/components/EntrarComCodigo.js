import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { FormField } from '../../../components/molecules/FormField';
import * as grupoService from '../services/grupoService';
import { limparCodigo, TAMANHO_CODIGO, validarCodigo } from '../validacao';

/**
 * Entrada num grupo pelo código de convite (RF-18), no fim da lista de grupos.
 * onEntrou(grupo): chamado com o grupo que a pessoa acabou de entrar.
 */
export function EntrarComCodigo({ onEntrou }) {
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState(null);
  const [entrando, setEntrando] = useState(false);

  function mudar(texto) {
    setCodigo(limparCodigo(texto));
    if (erro) setErro(null);
  }

  async function entrar() {
    const problema = validarCodigo(codigo);
    if (problema) {
      setErro(problema);
      return;
    }

    try {
      setEntrando(true);
      const grupo = await grupoService.entrar(codigo);
      setCodigo('');
      onEntrou(grupo);
    } catch (e) {
      // "Código não encontrado" e "Você já está nesse grupo" vêm prontos da API.
      setErro(e.message);
    } finally {
      setEntrando(false);
    }
  }

  return (
    <View style={styles.caixa}>
      <FormField
        label="Entrar com código"
        placeholder="ABC123"
        value={codigo}
        onChangeText={mudar}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={TAMANHO_CODIGO}
        returnKeyType="go"
        onSubmitEditing={entrar}
        erro={erro}
        dica={erro ? null : 'Peça o código de convite para alguém do grupo'}
      />
      <Button titulo="Entrar no grupo" bloco carregando={entrando} onPress={entrar} />
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: { gap: 10, marginTop: 8 },
});
