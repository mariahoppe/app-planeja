import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { EstadoCarga } from '../../../components/molecules/EstadoCarga';
import { FormField } from '../../../components/molecules/FormField';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import { useToast } from '../../../contexts/ToastContext';
import * as roteiroService from '../../roteiros/services/roteiroService';
import * as grupoService from '../services/grupoService';
import { MAX_NOME_GRUPO, validarGrupo } from '../validacao';

/**
 * Criar grupo (RF-17): nome + a viagem a que ele se vincula. A API gera o
 * código de convite. Só aparecem as viagens da própria pessoa que ainda não
 * têm grupo (cada viagem pode ter um grupo só).
 */
export function GrupoFormScreen({ navigation }) {
  const toast = useToast();
  const [nome, setNome] = useState('');
  const [roteiroId, setRoteiroId] = useState(null);

  const [viagens, setViagens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState(null);

  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  const carregarViagens = useCallback(async () => {
    try {
      setErroCarga(null);
      const lista = await roteiroService.listar();
      setViagens((lista || []).filter((r) => !r.grupo));
    } catch (e) {
      setErroCarga(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Recarrega ao voltar (ex.: depois de criar um roteiro pelo atalho "+ Criar roteiro").
  useFocusEffect(
    useCallback(() => {
      carregarViagens();
    }, [carregarViagens])
  );

  async function criar() {
    const e = validarGrupo({ nome, roteiroId });
    setErros(e);
    if (Object.keys(e).length > 0) return;

    try {
      setSalvando(true);
      const grupo = await grupoService.criar({ nome: nome.trim(), roteiro_id: roteiroId });
      toast('Grupo criado.');
      navigation.goBack(); // a lista recarrega sozinha ao voltar
      Alert.alert(
        'Convide o pessoal',
        `O código de convite do grupo é ${grupo.codigo_convite}. Quem tiver o código entra pela aba Grupos.`
      );
    } catch (err) {
      Alert.alert('Não foi possível criar o grupo', err.message);
    } finally {
      setSalvando(false);
    }
  }

  function escolher(id) {
    setRoteiroId(id);
    if (erros.roteiro) setErros((atual) => ({ ...atual, roteiro: undefined }));
  }

  return (
    <ScreenTemplate sobretitulo="Viagens em grupo" titulo="Novo grupo" aoVoltar={() => navigation.goBack()}>
      <FormField
        label="Nome do grupo"
        placeholder="Família em Lisboa"
        value={nome}
        onChangeText={setNome}
        maxLength={MAX_NOME_GRUPO}
        erro={erros.nome}
      />

      <FormField
        label="Viagem"
        erro={erros.roteiro}
        dica="Todos do grupo vão poder ver e editar o roteiro e as atividades dessa viagem"
      >
        {carregando || erroCarga ? (
          <EstadoCarga carregando={carregando} erro={erroCarga} onTentarDeNovo={carregarViagens} />
        ) : viagens.length === 0 ? (
          <View style={styles.semViagem}>
            <Text style={styles.semViagemTexto}>
              Você não tem viagens livres. Cada viagem pode ter um grupo só; crie um roteiro novo para vincular.
            </Text>
            <Button titulo="+ Criar roteiro" pequeno onPress={() => navigation.navigate('RoteiroForm')} />
          </View>
        ) : (
          <View style={styles.opcoes}>
            {viagens.map((r) => (
              <Button
                key={r.id}
                titulo={r.destino?.cidade ? `${r.titulo} · ${r.destino.cidade}` : r.titulo}
                pequeno
                variante={roteiroId === r.id ? 'primario' : 'secundario'}
                onPress={() => escolher(r.id)}
              />
            ))}
          </View>
        )}
      </FormField>

      <Button
        titulo="Criar grupo"
        variante="primario"
        bloco
        carregando={salvando}
        desabilitado={carregando}
        onPress={criar}
      />
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  semViagem: { gap: 10, alignItems: 'flex-start' },
  semViagemTexto: { fontFamily: fonts.corpo, fontSize: 14, color: colors.suave },
});
