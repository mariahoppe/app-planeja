import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../../../components/atoms/Avatar';
import { Button } from '../../../components/atoms/Button';
import { Card } from '../../../components/atoms/Card';
import { Link } from '../../../components/atoms/Link';
import { ErrorMessage } from '../../../components/molecules/ErrorMessage';
import { FormField } from '../../../components/molecules/FormField';
import { PainelInferior } from '../../../components/molecules/PainelInferior';
import { colors, fonts } from '../../../config/theme';
import { capturarFoto, escolherImagem } from '../../../services/nativos';
import { validarPerfil } from '../validacao';

/**
 * Painel "Editar perfil": troca de foto e de nome. O e-mail só é exibido.
 * Nada é gravado aqui: a tela recebe { nome, fotoUri } em onSalvar.
 */
export function PainelEditarPerfil({ usuario, fotoUri, onSalvar, onFechar, carregando = false }) {
  const [nome, setNome] = useState(usuario.nome);
  const [foto, setFoto] = useState(fotoUri);
  const [erros, setErros] = useState({});
  const [erroFoto, setErroFoto] = useState(null);

  async function buscarFoto(origem) {
    setErroFoto(null);
    try {
      const resultado = origem === 'camera' ? await capturarFoto() : await escolherImagem();
      if (resultado) setFoto(resultado.uri); // null = cancelou
    } catch (e) {
      setErroFoto(e.message);
    }
  }

  function trocarFoto() {
    Alert.alert('Trocar foto', undefined, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Tirar foto', onPress: () => buscarFoto('camera') },
      { text: 'Escolher da galeria', onPress: () => buscarFoto('galeria') },
    ]);
  }

  function salvar() {
    const e = validarPerfil({ nome });
    setErros(e);
    if (Object.keys(e).length > 0) return;
    onSalvar({ nome: nome.trim(), fotoUri: foto });
  }

  return (
    <PainelInferior
      titulo="Editar perfil"
      onFechar={onFechar}
      rodape={<Button titulo="Salvar alterações" variante="primario" bloco carregando={carregando} onPress={salvar} />}
    >
      <ErrorMessage mensagem={erroFoto} />

      <Card style={styles.foto}>
        <Avatar nome={nome} fotoUri={foto} tamanho={52} onPress={trocarFoto} />
        <Link titulo="Trocar foto" inline onPress={trocarFoto} />
      </Card>

      <FormField label="Nome" value={nome} onChangeText={setNome} maxLength={80} erro={erros.nome} />

      <FormField label="E-mail" dica="O e-mail não pode ser alterado">
        <Text style={styles.nota}>{usuario.email}</Text>
      </FormField>
    </PainelInferior>
  );
}

const styles = StyleSheet.create({
  foto: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 13 },
  nota: { fontFamily: fonts.corpo, fontSize: 11.5, fontStyle: 'italic', color: colors.suave },
});
