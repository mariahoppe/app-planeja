import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../../../config/theme';
import { horaCurta, moeda } from '../../inicio/formatos';

/**
 * Uma linha da lista de atividades: check, título, "horário · local" e custo.
 * A linha inteira abre o detalhe; o check tem o próprio toque, por cima dela.
 * memo: a linha só redesenha se a atividade ou os callbacks mudarem.
 * onAlternar e onAbrir recebem a atividade, então um callback serve para a lista toda.
 */
export const AtividadeItem = memo(function AtividadeItem({ atividade, onAlternar, onAbrir }) {
  const { titulo, horario, local, custo, feita } = atividade;

  return (
    <Pressable
      onPress={() => onAbrir(atividade)}
      accessibilityRole="button"
      style={({ pressed }) => [styles.linha, pressed && styles.pressionado]}
    >
      <Pressable
        onPress={() => onAlternar(atividade)}
        hitSlop={10}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: feita }}
        accessibilityLabel={titulo}
        style={[styles.check, feita && styles.checkFeita]}
      >
        {feita ? <Text style={styles.marca}>✓</Text> : null}
      </Pressable>

      <View style={styles.meio}>
        <View style={styles.tituloCaixa}>
          <Text style={[styles.titulo, feita && styles.tituloFeita]}>{titulo}</Text>
          {/* textDecorationLine não desenhou o risco no Android, então a linha é uma View. */}
          {feita ? <View style={styles.risco} /> : null}
        </View>
        <Text style={styles.sub}>
          {horaCurta(horario)} · {local || 'local a definir'}
        </Text>
      </View>

      <Text style={styles.custo}>{Number(custo) ? moeda(custo) : 'grátis'}</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    // A margem negativa deixa o fundo do toque respirar sem desalinhar o conteúdo.
    marginHorizontal: -6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.linhaSuave,
  },
  pressionado: { backgroundColor: colors.linhaTocada },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.linha,
    backgroundColor: colors.branco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkFeita: { backgroundColor: colors.ok, borderColor: colors.ok },
  marca: { fontSize: 12, lineHeight: 14, color: colors.branco },
  meio: { flex: 1, minWidth: 0 },
  tituloCaixa: { alignSelf: 'flex-start', maxWidth: '100%' },
  titulo: { fontFamily: fonts.corpo, fontSize: 14, color: colors.tinta },
  tituloFeita: { color: colors.tenue },
  risco: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '52%',
    height: 1,
    backgroundColor: colors.tenue,
  },
  sub: { fontFamily: fonts.corpo, fontSize: 11, marginTop: 2, color: colors.suave },
  custo: { fontFamily: fonts.mono, fontSize: 12, color: colors.tinta },
});
