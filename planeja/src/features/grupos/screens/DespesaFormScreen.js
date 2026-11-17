import { useState } from 'react';
import { Alert } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { DespesaForm } from '../components/DespesaForm';
import * as despesaService from '../services/despesaService';

/**
 * Registrar (RF-21), editar e excluir (RF-25) uma despesa do grupo.
 * Com route.params.despesa, abre preenchida e mostra "Excluir".
 * Saldos e acerto de contas não são guardados: a API recalcula a cada leitura.
 */
export function DespesaFormScreen({ route, navigation }) {
  const { grupo, despesa } = route.params;
  const editando = Boolean(despesa);
  const { usuario } = useAuth();
  const toast = useToast();

  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  async function salvar(dados) {
    try {
      setSalvando(true);
      if (editando) {
        // Quem pagou pode ter saído do grupo: só reenvia o pagador se ele mudou,
        // senão a API recusaria um pagador que não é mais integrante.
        const envio = { ...dados };
        if (envio.pagador_id === despesa.pagador_id) delete envio.pagador_id;
        await despesaService.atualizar(grupo.id, despesa.id, envio);
      } else {
        await despesaService.criar(grupo.id, dados);
      }
      toast(editando ? 'Despesa atualizada.' : 'Despesa adicionada.');
      navigation.goBack(); // a aba Despesas recarrega sozinha ao voltar
    } catch (err) {
      Alert.alert('Não foi possível salvar', err.message);
    } finally {
      setSalvando(false);
    }
  }

  function excluir() {
    Alert.alert('Excluir despesa?', `"${despesa.descricao}" sai das contas do grupo. Não dá para desfazer.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            setExcluindo(true);
            await despesaService.excluir(grupo.id, despesa.id);
            toast('Despesa excluída.');
            navigation.goBack();
          } catch (err) {
            Alert.alert('Não foi possível excluir', err.message);
            setExcluindo(false);
          }
        },
      },
    ]);
  }

  return (
    <ScreenTemplate
      sobretitulo={`${editando ? 'Editar' : 'Nova'} · ${grupo.nome}`}
      titulo="Despesa"
      aoVoltar={() => navigation.goBack()}
    >
      <DespesaForm
        membros={grupo.membros || []}
        usuarioId={usuario?.id}
        despesa={despesa}
        onSubmit={salvar}
        carregando={salvando}
        desabilitado={excluindo}
      />

      {editando ? (
        <Button titulo="Excluir despesa" bloco carregando={excluindo} desabilitado={salvando} onPress={excluir} />
      ) : null}
    </ScreenTemplate>
  );
}
