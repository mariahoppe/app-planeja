import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { FormField } from '../../../components/molecules/FormField';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';

import * as grupoService from '../services/grupoService';
import * as roteiroService from '../../roteiros/services/roteiroService';

export function GrupoFormScreen() {
  // --- Criar um grupo novo ---
  const [nome, setNome] = useState('');
  const [roteiroId, setRoteiroId] = useState(null);
  const [roteiros, setRoteiros] = useState([]); // viagens para vincular o grupo
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  // --- Entrar num grupo por código de convite ---
  const [codigo, setCodigo] = useState('');
  const [entrando, setEntrando] = useState(false);
  const [erroCodigo, setErroCodigo] = useState(null);

  // Busca as viagens da pessoa (usa o SEU roteiroService):
  useEffect(() => {
    roteiroService
      .listar()
      .then((lista) => setRoteiros(lista || []))
      .catch(() => {});
  }, []);

  function validarCriar() {
    const e = {};
    if (!nome.trim()) e.nome = 'Dê um nome ao grupo';
    if (!roteiroId) e.roteiro = 'Escolha a viagem vinculada';
    return e;
  }

  async function criarGrupo() {
    const e = validarCriar();
    setErros(e);
    if (Object.keys(e).length > 0) return;

    try {
      setSalvando(true);
      await grupoService.criar({ nome, roteiro_id: roteiroId });
      Alert.alert('Pronto', 'Grupo criado!');
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function entrarGrupo() {
    if (codigo.trim().length !== 6) {
      setErroCodigo('O código tem seis caracteres');
      return;
    }
    setErroCodigo(null);

    try {
      setEntrando(true);
      await grupoService.entrar(codigo.trim().toUpperCase());
      Alert.alert('Pronto', 'Você entrou no grupo!');
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setEntrando(false);
    }
  }

  return (
    <ScreenTemplate sobretitulo="Viagens em grupo" titulo="Novo grupo">
      <FormField
        label="Nome do grupo"
        placeholder="Família na Itália"
        value={nome}
        onChangeText={setNome}
        erro={erros.nome}
      />

      <FormField label="Viagem" erro={erros.roteiro}>
        <View style={styles.opcoes}>
          {roteiros.map((r) => (
            <Button
              key={r.id}
              titulo={r.titulo}
              pequeno
              variante={roteiroId === r.id ? 'primario' : 'secundario'}
              onPress={() => setRoteiroId(r.id)}
            />
          ))}
        </View>
      </FormField>

      <Button
        titulo="Criar grupo"
        variante="primario"
        bloco
        carregando={salvando}
        onPress={criarGrupo}
      />

      <FormField
        label="Entrar com código"
        placeholder="ABC123"
        autoCapitalize="characters"
        maxLength={6}
        value={codigo}
        onChangeText={setCodigo}
        erro={erroCodigo}
        dica="Peça o código de convite para alguém que já está no grupo"
      />

      <Button
        titulo="Entrar no grupo"
        bloco
        carregando={entrando}
        onPress={entrarGrupo}
      />
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
