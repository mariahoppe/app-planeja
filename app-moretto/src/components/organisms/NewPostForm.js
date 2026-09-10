/**
 * ORGANISM — NewPostForm
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../atoms/Button';
import { TextArea } from '../atoms/TextArea';
import { ErrorMessage } from '../molecules/ErrorMessage';
import { espacamentos } from '../../theme';

export function NewPostForm({ onSubmit, carregando = false, erro = null }) {
  const [texto, setTexto] = useState('');
  const podeEnviar = texto.trim().length > 0 && !carregando;

  async function enviar() {
    if (!podeEnviar) return;
    await onSubmit(texto.trim());
    setTexto('');
  }

  return (
    <View style={styles.container}>
      <ErrorMessage mensagem={erro} />
      <TextArea
        value={texto}
        onChangeText={setTexto}
        placeholder="O que você quer publicar?"
        erro={Boolean(erro)}
      />
      <Button
        title="Publicar"
        onPress={enviar}
        carregando={carregando}
        desabilitado={!podeEnviar}
        style={styles.botao}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: espacamentos.lg },
  botao: { marginTop: espacamentos.sm },
});
