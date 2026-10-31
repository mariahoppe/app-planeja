import { useState } from 'react';
import { Alert } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { useToast } from '../../../contexts/ToastContext';
import { AtividadeForm } from '../components/AtividadeForm';
import * as atividadeService from '../services/atividadeService';

// Serve para criar e para editar: com route.params.atividade, abre preenchida e mostra "Excluir".
export function AtividadeFormScreen({ route, navigation }) {
  const { roteiro, atividade } = route.params;
  const editando = Boolean(atividade);
  const toast = useToast();

  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  async function salvar(dados) {
    try {
      setSalvando(true);
      if (editando) await atividadeService.atualizar(atividade.id, dados);
      else await atividadeService.criar({ ...dados, roteiro_id: roteiro.id });
      toast(editando ? 'Atividade atualizada.' : 'Atividade adicionada.');
      navigation.goBack(); // a lista recarrega sozinha ao voltar
    } catch (err) {
      Alert.alert('Não foi possível salvar', err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    try {
      setExcluindo(true);
      await atividadeService.excluir(atividade.id);
      toast('Atividade excluída.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Não foi possível excluir', err.message);
      setExcluindo(false);
    }
  }

  return (
    <ScreenTemplate
      sobretitulo={editando ? 'Editar' : 'Nova'}
      titulo="Atividade"
      aoVoltar={() => navigation.goBack()}
    >
      <AtividadeForm
        roteiro={roteiro}
        atividade={atividade}
        onSubmit={salvar}
        carregando={salvando}
        desabilitado={excluindo}
      />

      {editando ? (
        <Button titulo="Excluir atividade" bloco carregando={excluindo} desabilitado={salvando} onPress={excluir} />
      ) : null}
    </ScreenTemplate>
  );
}
