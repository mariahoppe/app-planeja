import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { Input } from '../../../components/atoms/Input';
import { DatePicker } from '../../../components/molecules/DatePicker';
import { EstadoCarga } from '../../../components/molecules/EstadoCarga';
import { FormField } from '../../../components/molecules/FormField';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import { useToast } from '../../../contexts/ToastContext';
import * as destinoService from '../../destinos/services/destinoService';
import * as roteiroService from '../services/roteiroService';
import { MAX_TITULO, STATUS, validarRoteiro } from '../validacao';

/**
 * Criar e editar roteiro (RF-06). Com route.params.roteiro, abre preenchido.
 * - O destino só pode ser trocado por quem criou a viagem (os destinos são dela);
 *   integrantes do grupo editam o resto (RF-19).
 * - Excluir aparece só para quem criou: apaga atividades, grupo e despesas juntos.
 */
export function RoteiroFormScreen({ route, navigation }) {
  const roteiro = route.params?.roteiro;
  const editando = Boolean(roteiro);
  const souDono = !editando || roteiro.sou_dono !== false;
  const toast = useToast();

  const [titulo, setTitulo] = useState(roteiro?.titulo ?? '');
  const [destinoId, setDestinoId] = useState(roteiro?.destino_id ?? roteiro?.destino?.id ?? null);
  const [inicio, setInicio] = useState(roteiro?.inicio ?? null);
  const [fim, setFim] = useState(roteiro?.fim ?? null);
  const [status, setStatus] = useState(roteiro?.status ?? 'planejando');
  const [obs, setObs] = useState(roteiro?.obs ?? '');
  const [erros, setErros] = useState({});

  const [destinos, setDestinos] = useState(null);
  const [erroDestinos, setErroDestinos] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const carregarDestinos = useCallback(async () => {
    if (!souDono) return;
    try {
      setErroDestinos(null);
      setDestinos((await destinoService.listar()) || []);
    } catch (e) {
      setErroDestinos(e.message);
    }
  }, [souDono]);

  // Recarrega ao voltar (ex.: depois de cadastrar um destino pelo atalho).
  useFocusEffect(
    useCallback(() => {
      carregarDestinos();
    }, [carregarDestinos])
  );

  function limparErro(campo) {
    if (erros[campo]) setErros((atual) => ({ ...atual, [campo]: undefined }));
  }

  async function salvar() {
    const e = validarRoteiro({ titulo, destinoId, inicio, fim });
    setErros(e);
    if (Object.keys(e).length > 0) return;

    const dados = { titulo: titulo.trim(), inicio, fim: fim || null, status, obs: obs.trim() || null };
    if (souDono) dados.destino_id = destinoId;

    try {
      setSalvando(true);
      if (editando) await roteiroService.atualizar(roteiro.id, dados);
      else await roteiroService.criar(dados);
      toast(editando ? 'Roteiro atualizado.' : 'Roteiro criado.');
      navigation.goBack(); // a lista (ou o detalhe) recarrega ao voltar
    } catch (err) {
      Alert.alert('Não foi possível salvar', err.message);
    } finally {
      setSalvando(false);
    }
  }

  function excluir() {
    const extra = roteiro.grupo ? ` O grupo "${roteiro.grupo.nome}" e as despesas dele também serão apagados.` : '';
    Alert.alert(
      'Excluir roteiro?',
      `"${roteiro.titulo}" e todas as atividades serão apagados.${extra} Não dá para desfazer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setExcluindo(true);
              await roteiroService.excluir(roteiro.id);
              toast('Roteiro excluído.');
              navigation.pop(2); // sai do formulário e do detalhe do roteiro apagado
            } catch (err) {
              Alert.alert('Não foi possível excluir', err.message);
              setExcluindo(false);
            }
          },
        },
      ]
    );
  }

  return (
    <ScreenTemplate
      sobretitulo={editando ? 'Editar viagem' : 'Nova viagem'}
      titulo={editando ? roteiro.titulo : 'Novo roteiro'}
      aoVoltar={() => navigation.goBack()}
    >
      <FormField
        label="Título"
        placeholder="Férias em Paris"
        value={titulo}
        onChangeText={(t) => { setTitulo(t); limparErro('titulo'); }}
        maxLength={MAX_TITULO}
        erro={erros.titulo}
      />

      <FormField
        label="Destino"
        erro={erros.destino}
        dica={souDono ? null : 'Só quem criou a viagem pode trocar o destino'}
      >
        {!souDono ? (
          <Text style={styles.fixo}>
            {[roteiro.destino?.cidade, roteiro.destino?.pais].filter(Boolean).join(', ')}
          </Text>
        ) : destinos === null || erroDestinos ? (
          <EstadoCarga carregando={!erroDestinos} erro={erroDestinos} onTentarDeNovo={carregarDestinos} />
        ) : destinos.length === 0 ? (
          <View style={styles.semDestino}>
            <Text style={styles.semDestinoTexto}>Cadastre primeiro a cidade para onde você vai.</Text>
            <Button titulo="+ Cadastrar destino" pequeno onPress={() => navigation.navigate('DestinoForm')} />
          </View>
        ) : (
          <View style={styles.opcoes}>
            {destinos.map((d) => (
              <Button
                key={d.id}
                titulo={d.cidade}
                pequeno
                variante={destinoId === d.id ? 'primario' : 'secundario'}
                onPress={() => { setDestinoId(d.id); limparErro('destino'); }}
              />
            ))}
          </View>
        )}
      </FormField>

      <View style={styles.grid2}>
        <FormField label="Início" erro={erros.inicio} style={styles.coluna}>
          <DatePicker
            value={inicio}
            onChange={(d) => { setInicio(d); limparErro('inicio'); }}
            invalid={Boolean(erros.inicio)}
            accessibilityLabel="Data de início"
          />
        </FormField>
        <FormField label="Fim (opcional)" erro={erros.fim} style={styles.coluna}>
          <DatePicker
            value={fim}
            onChange={(d) => { setFim(d); limparErro('fim'); }}
            min={inicio || undefined}
            invalid={Boolean(erros.fim)}
            accessibilityLabel="Data de fim"
          />
        </FormField>
      </View>
      {fim ? (
        <Button titulo="Tirar a data de fim" pequeno onPress={() => setFim(null)} style={styles.tirarFim} />
      ) : null}

      <FormField label="Status">
        <View style={styles.opcoes}>
          {STATUS.map((s) => (
            <Button
              key={s.valor}
              titulo={s.rotulo}
              pequeno
              variante={status === s.valor ? 'primario' : 'secundario'}
              onPress={() => setStatus(s.valor)}
            />
          ))}
        </View>
      </FormField>

      <FormField label="Observações (opcional)">
        <Input
          placeholder="Anotações da viagem"
          value={obs}
          onChangeText={setObs}
          multiline
          accessibilityLabel="Observações"
          style={styles.area}
        />
      </FormField>

      <Button
        titulo={editando ? 'Salvar alterações' : 'Criar roteiro'}
        variante="primario"
        bloco
        carregando={salvando}
        desabilitado={excluindo}
        onPress={salvar}
      />

      {editando && souDono ? (
        <Button titulo="Excluir roteiro" bloco carregando={excluindo} desabilitado={salvando} onPress={excluir} />
      ) : null}
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  grid2: { flexDirection: 'row', gap: 10 },
  coluna: { flex: 1 },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tirarFim: { alignSelf: 'flex-end', marginTop: -4 },
  area: { minHeight: 84, textAlignVertical: 'top' },
  fixo: { fontFamily: fonts.corpoSemi, fontSize: 15, color: colors.tinta, paddingVertical: 6 },
  semDestino: { gap: 10, alignItems: 'flex-start' },
  semDestinoTexto: { fontFamily: fonts.corpo, fontSize: 14, color: colors.suave },
});
