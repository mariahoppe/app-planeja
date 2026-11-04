import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { Input } from '../../../components/atoms/Input';
import { FormField } from '../../../components/molecules/FormField';
import { SeletorSegmentado } from '../../../components/molecules/SeletorSegmentado';
import { colors, fonts } from '../../../config/theme';
import { useToast } from '../../../contexts/ToastContext';
import { capturarFoto, comprimirFotoDica, escolherImagem } from '../../../services/nativos';
import { ESCOPOS } from '../../destinos/validacao';
import { ordenarFotos } from '../formatos';
import { BLOCOS, MAX_FOTOS_POR_BLOCO, validarDica } from '../validacao';
import { Fotos } from './Fotos';

/**
 * Campos, validação e fotos da dica. Quem fala com a API é a tela: aqui o formulário
 * só chama onSubmit({ dados, novas, removidas }).
 * dica: a dica a editar; sem ela, o formulário começa vazio (com cidadeInicial, se houver).
 * As fotos novas ficam só no aparelho, como pré-visualização, até a tela salvar.
 */
export function DicaForm({ dica, cidadeInicial = '', onSubmit, carregando = false }) {
  const editando = Boolean(dica);
  const toast = useToast();

  const [cidade, setCidade] = useState(dica?.cidade ?? cidadeInicial);
  const [pais, setPais] = useState(dica?.pais ?? '');
  const [escopo, setEscopo] = useState(dica?.escopo ?? 'internacional');
  // Um texto por bloco: { onde_comer: '...', o_que_fazer: '...', ... }
  const [textos, setTextos] = useState(() =>
    Object.fromEntries(BLOCOS.map((b) => [b.chave, dica?.[b.chave] ?? '']))
  );
  // As fotos já salvas têm id; as escolhidas agora têm só o arquivo do aparelho.
  const [fotos, setFotos] = useState(() =>
    ordenarFotos(dica?.fotos ?? []).map((f) => ({ chave: `salva-${f.id}`, id: f.id, bloco: f.bloco, uri: f.url }))
  );
  const [removidas, setRemovidas] = useState([]); // ids das fotos salvas que a pessoa tirou
  const [anexando, setAnexando] = useState(null); // bloco cuja foto está sendo comprimida
  const [erros, setErros] = useState({});

  const fotosDoBloco = (bloco) => fotos.filter((f) => f.bloco === bloco);

  function escreverBloco(chave, texto) {
    setTextos((atuais) => ({ ...atuais, [chave]: texto }));
  }

  function adicionarFoto(bloco) {
    if (fotosDoBloco(bloco).length >= MAX_FOTOS_POR_BLOCO) {
      toast(`Cada bloco aceita no máximo ${MAX_FOTOS_POR_BLOCO} fotos.`);
      return;
    }
    Alert.alert('Adicionar foto', undefined, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Tirar foto', onPress: () => anexar(bloco, 'camera') },
      { text: 'Escolher da galeria', onPress: () => anexar(bloco, 'galeria') },
    ]);
  }

  async function anexar(bloco, origem) {
    try {
      const escolhida =
        origem === 'camera' ? await capturarFoto({ quadrada: false }) : await escolherImagem({ quadrada: false });
      if (!escolhida) return; // null = cancelou

      // RNF-09: comprime já aqui, para a pré-visualização ser a foto que vai ser enviada.
      setAnexando(bloco);
      const comprimida = await comprimirFotoDica(escolhida.uri);
      setFotos((atuais) => [...atuais, { chave: `nova-${Date.now()}`, bloco, uri: comprimida.uri }]);
    } catch (e) {
      Alert.alert('Não foi possível anexar a foto', e.message);
    } finally {
      setAnexando(null);
    }
  }

  function removerFoto(foto) {
    setFotos((atuais) => atuais.filter((f) => f.chave !== foto.chave));
    if (foto.id) setRemovidas((ids) => [...ids, foto.id]);
  }

  function salvar() {
    const e = validarDica({ cidade, pais, ...textos });
    setErros(e);
    if (Object.keys(e).length > 0) return;

    // Bloco vazio vai como null, que é como a API guarda "sem texto".
    const dados = { cidade: cidade.trim(), pais: pais.trim(), escopo };
    BLOCOS.forEach((b) => {
      dados[b.chave] = textos[b.chave].trim() || null;
    });

    onSubmit({ dados, novas: fotos.filter((f) => !f.id), removidas });
  }

  return (
    <>
      <View style={styles.grid2}>
        <FormField
          label="Cidade"
          placeholder="Paris"
          value={cidade}
          onChangeText={setCidade}
          maxLength={80}
          erro={erros.cidade}
          style={styles.coluna}
        />
        <FormField
          label="País"
          placeholder="França"
          value={pais}
          onChangeText={setPais}
          maxLength={60}
          erro={erros.pais}
          style={styles.coluna}
        />
      </View>

      <FormField label="Escopo">
        <SeletorSegmentado opcoes={ESCOPOS} valor={escopo} onChange={setEscopo} />
      </FormField>

      {erros.blocos ? (
        <View style={styles.alerta} accessibilityRole="alert">
          <Text style={styles.alertaTexto}>{erros.blocos}</Text>
        </View>
      ) : null}

      {BLOCOS.map((b) => (
        <FormField key={b.chave} label={b.rotulo}>
          <Input
            value={textos[b.chave]}
            onChangeText={(texto) => escreverBloco(b.chave, texto)}
            placeholder={b.placeholder}
            multiline
            accessibilityLabel={b.rotulo}
            style={styles.area}
          />
          <Fotos
            fotos={fotosDoBloco(b.chave)}
            onAdicionar={() => adicionarFoto(b.chave)}
            onRemover={removerFoto}
            adicionando={anexando === b.chave}
          />
        </FormField>
      ))}

      <Button
        titulo={editando ? 'Salvar alterações' : 'Publicar dica'}
        variante="primario"
        bloco
        carregando={carregando}
        onPress={salvar}
      />
    </>
  );
}

const styles = StyleSheet.create({
  grid2: { flexDirection: 'row', gap: 10 },
  coluna: { flex: 1 },
  area: { minHeight: 76, lineHeight: 20, textAlignVertical: 'top' },
  alerta: {
    backgroundColor: colors.acentoSuave,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 11,
  },
  alertaTexto: { fontFamily: fonts.corpoSemi, fontSize: 12, color: colors.acento },
});
