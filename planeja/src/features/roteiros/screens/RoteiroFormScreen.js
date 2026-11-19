import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { Input } from '../../../components/atoms/Input';
import { DatePicker } from '../../../components/molecules/DatePicker';
import { EstadoCarga } from '../../../components/molecules/EstadoCarga';
import { FormField } from '../../../components/molecules/FormField';
import { PainelInferior } from '../../../components/molecules/PainelInferior';
import { SeletorSegmentado } from '../../../components/molecules/SeletorSegmentado';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts, radius } from '../../../config/theme';
import { useToast } from '../../../contexts/ToastContext';
import * as destinoService from '../../destinos/services/destinoService';
import * as roteiroService from '../services/roteiroService';
import { MAX_TITULO, STATUS, validarRoteiro } from '../validacao';

// "Lisboa · Portugal": só a cidade fica ambígua quando há cidades com o mesmo nome.
const rotuloDestino = (d) => [d?.cidade, d?.pais].filter(Boolean).join(' · ');

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
  const [escolhendoDestino, setEscolhendoDestino] = useState(false);

  const destinoEscolhido = destinos?.find((d) => d.id === destinoId) ?? (destinoId ? roteiro?.destino : null);

  function escolherDestino(id) {
    setDestinoId(id);
    limparErro('destino');
    setEscolhendoDestino(false);
  }

  function cadastrarDestino() {
    setEscolhendoDestino(false);
    navigation.navigate('DestinoForm');
  }

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
              // Volta às abas: o detalhe do roteiro sumiu e, se ele foi aberto pelo grupo,
              // o grupo também (é apagado junto). As listas recarregam ao ganhar o foco.
              navigation.popToTop();
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
          <Text style={styles.fixo}>{rotuloDestino(roteiro.destino)}</Text>
        ) : destinos === null || erroDestinos ? (
          <EstadoCarga carregando={!erroDestinos} erro={erroDestinos} onTentarDeNovo={carregarDestinos} />
        ) : destinos.length === 0 ? (
          <View style={styles.semDestino}>
            <Text style={styles.semDestinoTexto}>Cadastre primeiro a cidade para onde você vai.</Text>
            <Button titulo="+ Cadastrar destino" pequeno onPress={cadastrarDestino} />
          </View>
        ) : (
          <Pressable
            onPress={() => setEscolhendoDestino(true)}
            accessibilityRole="button"
            accessibilityLabel={destinoEscolhido ? `Destino: ${rotuloDestino(destinoEscolhido)}. Trocar` : 'Escolher destino'}
            style={({ pressed }) => [styles.campo, erros.destino && styles.campoErro, pressed && styles.campoTocado]}
          >
            <Text style={[styles.campoTexto, !destinoEscolhido && styles.campoVazio]} numberOfLines={1}>
              {destinoEscolhido ? rotuloDestino(destinoEscolhido) : 'Escolher destino'}
            </Text>
            <Text style={styles.campoSeta}>›</Text>
          </Pressable>
        )}
      </FormField>

      {escolhendoDestino ? (
        <PainelInferior
          titulo="Destino"
          onFechar={() => setEscolhendoDestino(false)}
          rodape={<Button titulo="+ Cadastrar destino" bloco onPress={cadastrarDestino} />}
        >
          {destinos.map((d) => {
            const marcado = d.id === destinoId;
            return (
              <Pressable
                key={d.id}
                onPress={() => escolherDestino(d.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: marcado }}
                style={({ pressed }) => [styles.opcaoDestino, pressed && styles.opcaoTocada]}
              >
                <View style={styles.opcaoTextos}>
                  <Text style={[styles.opcaoCidade, marcado && styles.opcaoMarcada]} numberOfLines={1}>
                    {d.cidade}
                  </Text>
                  <Text style={styles.opcaoPais} numberOfLines={1}>{d.pais}</Text>
                </View>
                {marcado ? <Text style={styles.opcaoCheck}>✓</Text> : null}
              </Pressable>
            );
          })}
        </PainelInferior>
      ) : null}

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
        <SeletorSegmentado opcoes={STATUS} valor={status} onChange={setStatus} />
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
  tirarFim: { alignSelf: 'flex-end', marginTop: -4 },
  area: { minHeight: 84, textAlignVertical: 'top' },
  fixo: { fontFamily: fonts.corpoSemi, fontSize: 15, color: colors.tinta, paddingVertical: 6 },
  semDestino: { gap: 10, alignItems: 'flex-start' },
  semDestinoTexto: { fontFamily: fonts.corpo, fontSize: 14, color: colors.suave },
  // Mesmo visual do Input, para o seletor parecer um campo do formulário
  campo: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.branco,
    borderWidth: 1,
    borderColor: colors.linha,
    borderRadius: radius.md,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  campoErro: { borderColor: colors.acento, backgroundColor: colors.erroFundo },
  campoTocado: { backgroundColor: colors.linhaTocada },
  campoTexto: { flex: 1, fontFamily: fonts.corpo, fontSize: 14, color: colors.tinta },
  campoVazio: { color: colors.suave },
  campoSeta: { fontFamily: fonts.corpo, fontSize: 18, color: colors.suave },
  opcaoDestino: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.linhaSuave,
  },
  opcaoTocada: { backgroundColor: colors.linhaTocada },
  opcaoTextos: { flex: 1, gap: 2 },
  opcaoCidade: { fontFamily: fonts.corpoSemi, fontSize: 14, color: colors.tinta },
  opcaoMarcada: { color: colors.acento },
  opcaoPais: { fontFamily: fonts.corpo, fontSize: 11.5, color: colors.suave },
  opcaoCheck: { fontFamily: fonts.corpoForte, fontSize: 16, color: colors.acento },
});
