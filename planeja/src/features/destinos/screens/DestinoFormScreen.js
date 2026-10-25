import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { Input } from '../../../components/atoms/Input';
import { ErrorMessage } from '../../../components/molecules/ErrorMessage';
import { FormField } from '../../../components/molecules/FormField';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors } from '../../../config/theme';
import * as destinoService from '../services/destinoService';

const ESCOPOS = [
  { valor: 'nacional', rotulo: 'Nacional' },
  { valor: 'internacional', rotulo: 'Internacional' },
];

/**
 * Criar ou editar um destino (RF-05). Sem params cria um novo; com { id } carrega
 * o destino, permite editar e mostra o botão de excluir.
 * A validação espelha o destinoValidator da API (cidade 80, país 60, período 40).
 */
export function DestinoFormScreen({ navigation, route }) {
  const id = route.params?.id;
  const editando = Boolean(id);

  const [cidade, setCidade] = useState('');
  const [pais, setPais] = useState('');
  const [escopo, setEscopo] = useState('internacional');
  const [periodo, setPeriodo] = useState('');
  const [obs, setObs] = useState('');

  const [carregando, setCarregando] = useState(editando);
  const [erroCarregar, setErroCarregar] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erros, setErros] = useState({});

  // No modo edição, preenche o formulário com o destino salvo.
  useEffect(() => {
    if (!editando) return;
    destinoService
      .buscarPorId(id)
      .then((d) => {
        setCidade(d.cidade);
        setPais(d.pais);
        setEscopo(d.escopo);
        setPeriodo(d.periodo || '');
        setObs(d.obs || '');
      })
      .catch((e) => setErroCarregar(e.message))
      .finally(() => setCarregando(false));
  }, [editando, id]);

  // Confere os campos e devolve um objeto de erros ({} = tudo certo).
  function validar() {
    const e = {};
    if (!cidade.trim()) e.cidade = 'Informe a cidade';
    else if (cidade.trim().length > 80) e.cidade = 'Cidade deve ter no máximo 80 caracteres';
    if (!pais.trim()) e.pais = 'Informe o país';
    else if (pais.trim().length > 60) e.pais = 'País deve ter no máximo 60 caracteres';
    if (periodo.trim().length > 40) e.periodo = 'Período deve ter no máximo 40 caracteres';
    return e;
  }

  async function salvar() {
    const e = validar();
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
      if (editando) {
        await destinoService.atualizar(id, dados);
      } else {
        await destinoService.criar(dados);
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Não foi possível salvar', err.message);
    } finally {
      setSalvando(false);
    }
  }

  function confirmarExclusao() {
    Alert.alert(
      'Excluir destino?',
      `${cidade} será excluído junto com os roteiros, atividades, grupos e despesas ligados a ele. Isso não pode ser desfeito.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: excluir },
      ]
    );
  }

  async function excluir() {
    try {
      setExcluindo(true);
      await destinoService.excluir(id);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Não foi possível excluir', err.message);
      setExcluindo(false);
    }
  }

  return (
    <ScreenTemplate
      sobretitulo="Destinos"
      titulo={editando ? 'Editar destino' : 'Novo destino'}
      aoVoltar={() => navigation.goBack()}
    >
      {carregando ? (
        <ActivityIndicator color={colors.acento} />
      ) : erroCarregar ? (
        <ErrorMessage mensagem={erroCarregar} />
      ) : (
        <>
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

          <FormField label="Escopo">
            <View style={styles.opcoes}>
              {ESCOPOS.map((e) => (
                <Button
                  key={e.valor}
                  titulo={e.rotulo}
                  pequeno
                  variante={escopo === e.valor ? 'primario' : 'secundario'}
                  onPress={() => setEscopo(e.valor)}
                />
              ))}
            </View>
          </FormField>

          <FormField
            label="Período (opcional)"
            placeholder="Abril 2027"
            dica="Texto livre: um mês, uma estação ou “A definir”"
            value={periodo}
            onChangeText={setPeriodo}
            maxLength={40}
            erro={erros.periodo}
          />

          <FormField label="Observações (opcional)">
            <Input
              placeholder="O que você quer conhecer por lá"
              value={obs}
              onChangeText={setObs}
              multiline
              accessibilityLabel="Observações"
              style={styles.obs}
            />
          </FormField>

          <Button
            titulo={editando ? 'Salvar alterações' : 'Salvar destino'}
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
        </>
      )}
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  obs: { minHeight: 88, textAlignVertical: 'top' },
});
