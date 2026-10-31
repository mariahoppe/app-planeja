import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius } from '../../config/theme';
import { PainelInferior } from './PainelInferior';

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];
const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const doisDigitos = (n) => String(n).padStart(2, '0');

function formatar(iso) {
  if (!iso) return 'Selecionar data';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

/**
 * Campo de data com o calendário do protótipo: toca no campo e abre um painel.
 * value, min e max: datas no formato "AAAA-MM-DD". Dias fora de min/max ficam bloqueados.
 * invalid: destaca o campo quando a validação falha.
 */
export function DatePicker({ value, onChange, min, max, invalid = false, accessibilityLabel = 'Data' }) {
  const [aberto, setAberto] = useState(false);
  const base = value || min || new Date().toISOString().slice(0, 10);
  const [cursor, setCursor] = useState(base.slice(0, 7));
  const [ano, mes] = cursor.split('-').map(Number);

  const iso = (dia) => `${ano}-${doisDigitos(mes)}-${doisDigitos(dia)}`;
  const fora = (data) => (min && data < min) || (max && data > max);

  function mudarMes(delta) {
    const data = new Date(ano, mes - 1 + delta, 1);
    setCursor(`${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}`);
  }

  function escolher(data) {
    onChange(data);
    setAberto(false);
  }

  // Monta as semanas: células vazias até o dia da semana em que o mês começa.
  const diasNoMes = new Date(ano, mes, 0).getDate();
  const vazias = new Date(ano, mes - 1, 1).getDay();
  const celulas = [...Array(vazias).fill(null), ...Array.from({ length: diasNoMes }, (_, i) => i + 1)];
  const semanas = [];
  for (let i = 0; i < celulas.length; i += 7) {
    semanas.push(Array.from({ length: 7 }, (_, j) => celulas[i + j] ?? null));
  }

  return (
    <>
      <Pressable
        onPress={() => setAberto(true)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={[styles.campo, invalid && styles.campoInvalido]}
      >
        <Text style={styles.campoTexto}>{formatar(value)}</Text>
      </Pressable>

      {aberto ? (
        <PainelInferior titulo="Escolher data" onFechar={() => setAberto(false)}>
          <View style={styles.cabecalho}>
            <Pressable onPress={() => mudarMes(-1)} hitSlop={7} accessibilityLabel="Mês anterior" style={styles.seta}>
              <Text style={styles.setaTexto}>‹</Text>
            </Pressable>
            <Text style={styles.mes}>{`${MESES[mes - 1]} de ${ano}`}</Text>
            <Pressable onPress={() => mudarMes(1)} hitSlop={7} accessibilityLabel="Próximo mês" style={styles.seta}>
              <Text style={styles.setaTexto}>›</Text>
            </Pressable>
          </View>

          <View style={[styles.semana, styles.diasSemana]}>
            {DIAS_SEMANA.map((dia, i) => (
              <Text key={i} style={styles.diaSemana}>
                {dia}
              </Text>
            ))}
          </View>

          <View style={styles.grade}>
            {semanas.map((semana, i) => (
              <View key={i} style={styles.semana}>
                {semana.map((dia, j) => {
                  if (!dia) return <View key={j} style={styles.celula} />;

                  const data = iso(dia);
                  const selecionado = data === value;
                  const bloqueado = fora(data);

                  return (
                    <Pressable
                      key={j}
                      disabled={Boolean(bloqueado)}
                      onPress={() => escolher(data)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: selecionado, disabled: Boolean(bloqueado) }}
                      style={[styles.celula, styles.dia, selecionado && styles.diaSelecionado]}
                    >
                      <Text
                        style={[
                          styles.diaTexto,
                          selecionado && styles.diaTextoSelecionado,
                          bloqueado && styles.diaTextoBloqueado,
                        ]}
                      >
                        {dia}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </PainelInferior>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  campo: {
    minHeight: 44,
    alignSelf: 'stretch',
    justifyContent: 'center',
    backgroundColor: colors.branco,
    borderWidth: 1,
    borderColor: colors.linha,
    borderRadius: radius.md,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  campoInvalido: { borderColor: colors.acento, backgroundColor: colors.erroFundo },
  campoTexto: { fontFamily: fonts.corpo, fontSize: 14, color: colors.tinta },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mes: {
    fontFamily: fonts.corpoSemi,
    fontSize: 14,
    textTransform: 'capitalize',
    color: colors.tinta,
  },
  seta: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.acentoSuave,
  },
  setaTexto: { fontFamily: fonts.corpo, fontSize: 16, lineHeight: 18, color: colors.acento },
  grade: { gap: 4 },
  semana: { flexDirection: 'row', gap: 4 },
  diasSemana: { marginBottom: -4 },
  diaSemana: {
    flex: 1,
    fontFamily: fonts.corpoForte,
    fontSize: 10,
    letterSpacing: 0.8,
    textAlign: 'center',
    color: colors.suave,
  },
  celula: { flex: 1, minHeight: 38 },
  dia: { alignItems: 'center', justifyContent: 'center', borderRadius: 9 },
  diaSelecionado: { backgroundColor: colors.acento },
  diaTexto: { fontFamily: fonts.corpo, fontSize: 13.5, color: colors.tinta },
  diaTextoSelecionado: { fontFamily: fonts.corpoSemi, color: colors.branco },
  diaTextoBloqueado: { color: colors.tenue, opacity: 0.4 },
});
