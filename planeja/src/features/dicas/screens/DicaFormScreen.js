import { useState } from 'react';
import { Alert } from 'react-native';

import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { useToast } from '../../../contexts/ToastContext';
import { DicaForm } from '../components/DicaForm';
import * as dicaService from '../services/dicaService';
import { salvarFotos } from '../services/fotoService';

// Publicar (RF-08) e editar (RF-11) uma dica: com route.params.dica, abre preenchida.
// Vindo da busca sem resultado, route.params.cidade já preenche a cidade.
export function DicaFormScreen({ route, navigation }) {
  const dica = route.params?.dica;
  const editando = Boolean(dica);
  const toast = useToast();

  const [salvando, setSalvando] = useState(false);

  async function salvar({ dados, novas, removidas }) {
    let salva;
    try {
      setSalvando(true);
      salva = editando ? await dicaService.atualizar(dica.id, dados) : await dicaService.criar(dados);
    } catch (err) {
      Alert.alert('Não foi possível salvar', err.message);
      setSalvando(false);
      return;
    }

    // Daqui em diante a dica já existe: a tela fecha mesmo se uma foto falhar,
    // para um segundo toque em "Publicar dica" não criar a mesma dica duas vezes.
    const { falhas, motivo } = await salvarFotos(salva.id, { novas, removidas });
    toast(editando ? 'Dica atualizada.' : 'Dica publicada. Obrigada por compartilhar.');
    if (falhas > 0) {
      Alert.alert(
        falhas === 1 ? 'Uma foto não foi salva' : `${falhas} fotos não foram salvas`,
        `${motivo}\n\nO texto da dica foi salvo. Para tentar de novo, abra a dica e toque em Editar.`
      );
    }
    navigation.goBack(); // a lista e o detalhe recarregam sozinhos ao voltar
  }

  return (
    <ScreenTemplate sobretitulo={editando ? 'Editar' : 'Nova dica'} titulo="Publicar" aoVoltar={() => navigation.goBack()}>
      <DicaForm dica={dica} cidadeInicial={route.params?.cidade} onSubmit={salvar} carregando={salvando} />
    </ScreenTemplate>
  );
}
