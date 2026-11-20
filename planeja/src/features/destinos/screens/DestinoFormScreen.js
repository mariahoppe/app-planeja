import { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { Input } from '../../../components/atoms/Input';
import { FormField } from '../../../components/molecules/FormField';
import { SeletorSegmentado } from '../../../components/molecules/SeletorSegmentado';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { useToast } from '../../../contexts/ToastContext';
import * as destinoService from '../services/destinoService';
import { ESCOPOS, validarDestino } from '../validacao';

// Serve para criar e para editar: com route.params.destino, abre preenchido e mostra "Excluir".
export function DestinoFormScreen({ route, navigation }) {
  const destino = route.params?.destino;
  const editando = Boolean(destino);
  const toast = useToast();

  const [cidade, setCidade] = useState(destino?.cidade ?? '');
  const [pais, setPais] = useState(destino?.pais ?? '');
  const [escopo, setEscopo] = useState(destino?.escopo ?? 'internacional');
  const [periodo, setPeriodo] = useState(destino?.periodo ?? '');
  const [obs, setObs] = useState(destino?.obs ?? '');

  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  async function salvar() {
    const e = validarDestino({ cidade, pais, periodo });
    setErros(e);
    if (Object.keys(e).length > 0) return;

    const dados = {
      cidade: cidade.trim(),
      pais: pais.trim(),
      escopo,
      periodo: periodo.trim() || null,
      obs: obs.trim() || null,
    };

    try {
      setSalvando(true);
      if (editando) await destinoService.atualizar(destino.id, dados);
      else await destinoService.criar(dados);
      toast(editando ? 'Destino atualizado.' : 'Destino cadastrado.');
      navigation.goBack(); // a lista recarrega sozinha ao voltar
    } catch (err) {
      Alert.alert('Não foi possível salvar', err.message);
    } finally {
      setSalvando(false);
    }
  }

  function confirmarExclusao() {
    Alert.alert(
      'Excluir destino?',
      `${destino.cidade} e todos os roteiros e atividades ligados a ele serão apagados. Não dá para desfazer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: excluir },
      ]
    );
  }

  async function excluir() {
    try {
      setExcluindo(true);
      await destinoService.excluir(destino.id);
      toast('Destino excluído.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Não foi possível excluir', err.message);
      setExcluindo(false);
    }
  }

  return (
    <ScreenTemplate
      sobretitulo={editando ? 'Editar' : 'Novo'}
      titulo="Destino"
      aoVoltar={() => navigation.goBack()}
    >
      <FormField
        label="Cidade"
        placeholder="Lisboa"
        value={cidade}
        onChangeText={setCidade}
        maxLength={80}
        erro={erros.cidade}
      />

      <FormField
        label="País"
        placeholder="Portugal"
        value={pais}
        onChangeText={setPais}
        maxLength={60}
        erro={erros.pais}
      />

      <FormField label="Escopo" dica="Nacional = dentro do Brasil">
        <SeletorSegmentado opcoes={ESCOPOS} valor={escopo} onChange={setEscopo} />
      </FormField>

      <FormField
        label="Período pretendido"
        placeholder="Abril 2026"
        dica="Mês e ano, ou 'a definir'"
        value={periodo}
        onChangeText={setPeriodo}
        maxLength={40}
        erro={erros.periodo}
      />

      <FormField label="Observações (opcional)">
        <Input
          placeholder="O que você quer priorizar nesse destino"
          value={obs}
          onChangeText={setObs}
          multiline
          accessibilityLabel="Observações"
          style={styles.obs}
        />
      </FormField>

      <Button
        titulo={editando ? 'Salvar alterações' : 'Cadastrar destino'}
        variante="primario"
        bloco
        carregando={salvando}
        desabilitado={excluindo}
        onPress={salvar}
      />

      {editando ? (
        <Button
          titulo="Excluir destino"
          bloco
          carregando={excluindo}
          desabilitado={salvando}
          onPress={confirmarExclusao}
        />
      ) : null}
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  obs: { minHeight: 88, textAlignVertical: 'top' },
});
