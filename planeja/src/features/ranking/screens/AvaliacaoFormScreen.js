import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { FormField } from '../../../components/molecules/FormField';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import { useToast } from '../../../contexts/ToastContext';
import * as destinoService from '../../destinos/services/destinoService';
import { NotaSlider } from '../components/NotaSlider';
import { formatarNota, mesmoDestino, validarAvaliacao } from '../notas';
import * as avaliacaoService from '../services/avaliacaoService';

/**
 * Avaliar o custo-benefício de um destino (RF-12). Sem parâmetro, é uma avaliação
 * nova (dá para puxar cidade e país dos destinos da pessoa); com
 * route.params.avaliacao, edita a nota daquele destino e mostra "Excluir".
 * Não há campo de escopo: a API decide nacional/internacional pelo país.
 */
export function AvaliacaoFormScreen({ route, navigation }) {
  const avaliacao = route.params?.avaliacao;
  const editando = Boolean(avaliacao);
  const toast = useToast();

  const [cidade, setCidade] = useState(avaliacao?.cidade ?? '');
  const [pais, setPais] = useState(avaliacao?.pais ?? '');
  const [nota, setNota] = useState(avaliacao ? Number(avaliacao.nota) : null);

  const [destinos, setDestinos] = useState([]);
  const [minhas, setMinhas] = useState([]);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  // Para a avaliação nova: atalhos dos destinos da pessoa e aviso de destino já avaliado.
  useEffect(() => {
    if (editando) return;
    destinoService.listar().then((lista) => setDestinos(lista || [])).catch(() => {});
    avaliacaoService.minhas().then((lista) => setMinhas(lista || [])).catch(() => {});
  }, [editando]);

  const jaAvaliada =
    !editando && cidade.trim() && pais.trim() ? minhas.find((m) => mesmoDestino(m, { cidade, pais })) : null;

  function usarDestino(d) {
    setCidade(d.cidade);
    setPais(d.pais);
    setErros({});
  }

  async function salvar() {
    const e = validarAvaliacao({ cidade, pais, nota });
    setErros(e);
    if (Object.keys(e).length > 0) return;

    try {
      setSalvando(true);
      // A API guarda uma avaliação por destino: repetir o destino só atualiza a nota.
      await avaliacaoService.registrar({ cidade: cidade.trim(), pais: pais.trim(), nota });
      toast('Avaliação registrada. Ranking atualizado.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Não foi possível salvar', err.message);
    } finally {
      setSalvando(false);
    }
  }

  function confirmarExclusao() {
    Alert.alert('Excluir avaliação?', `Sua nota para ${avaliacao.cidade} sai do ranking.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: excluir },
    ]);
  }

  async function excluir() {
    try {
      setExcluindo(true);
      await avaliacaoService.excluir(avaliacao.id);
      toast('Avaliação excluída. Ranking atualizado.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Não foi possível excluir', err.message);
      setExcluindo(false);
    }
  }

  return (
    <ScreenTemplate
      sobretitulo={editando ? 'Editar avaliação' : 'Avaliar'}
      titulo={editando ? avaliacao.cidade : 'Custo-benefício'}
      aoVoltar={() => navigation.goBack()}
    >
      {editando ? (
        <Text style={styles.subtitulo}>{avaliacao.pais}</Text>
      ) : (
        <>
          {destinos.length > 0 ? (
            <FormField label="Dos meus destinos" dica="Toque para preencher cidade e país">
              <View style={styles.opcoes}>
                {destinos.map((d) => (
                  <Button
                    key={d.id}
                    titulo={d.cidade}
                    pequeno
                    variante={mesmoDestino(d, { cidade, pais }) ? 'primario' : 'secundario'}
                    onPress={() => usarDestino(d)}
                  />
                ))}
              </View>
            </FormField>
          ) : null}

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

          {jaAvaliada ? (
            <Text style={styles.aviso}>
              Você já deu {formatarNota(jaAvaliada.nota)} para {jaAvaliada.cidade}. Salvar substitui a nota antiga.
            </Text>
          ) : null}
        </>
      )}

      <FormField label="Nota de custo-benefício" dica="0 = caro para o que oferece · 10 = vale cada centavo">
        <NotaSlider valor={nota} onChange={setNota} erro={erros.nota} />
      </FormField>

      <Button
        titulo={editando ? 'Salvar nova nota' : 'Registrar avaliação'}
        variante="primario"
        bloco
        carregando={salvando}
        desabilitado={excluindo}
        onPress={salvar}
      />

      {editando ? (
        <Button
          titulo="Excluir avaliação"
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
  subtitulo: { fontFamily: fonts.corpo, fontSize: 15, color: colors.suave },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  aviso: {
    fontFamily: fonts.corpoSemi,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.acento,
    backgroundColor: colors.erroFundo,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
});
