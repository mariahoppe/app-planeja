import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../../../components/atoms/Avatar';
import { colors, fonts } from '../../../config/theme';
import { dataBR } from '../../atividades/datas';
import { rotuloCategoria } from '../despesas';
import { moeda } from '../formatos';

const primeiroNome = (nome) => (nome ? nome.split(' ')[0] : 'ex-integrante');

/**
 * Uma despesa na aba Despesas, como a linha do protótipo: rosto de quem pagou,
 * "12/04 · pagou Maria · divisão igual" e, à direita, o valor e a categoria.
 * Tocar abre a edição.
 */
export function DespesaItem({ despesa, usuarioId, onPress }) {
  const souEu = despesa.pagador_id === usuarioId;
  const pagador = souEu ? 'você' : primeiroNome(despesa.pagador?.nome);
  const dia = dataBR(despesa.data).slice(0, 5); // "12/04"

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${despesa.descricao}, ${moeda(despesa.valor)}, pagou ${pagador}. Editar`}
      style={({ pressed }) => [styles.linha, pressed && styles.tocada]}
    >
      <Avatar nome={despesa.pagador?.nome} fotoUri={despesa.pagador?.foto_url} tamanho={28} />
      <View style={styles.textos}>
        <Text style={styles.descricao} numberOfLines={1}>
          {despesa.descricao}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {dia} · pagou <Text style={souEu ? styles.voce : null}>{pagador}</Text> · divisão {despesa.modo_divisao}
        </Text>
      </View>
      <View style={styles.direita}>
        <Text style={styles.valor}>{moeda(despesa.valor)}</Text>
        <Text style={styles.sub}>{rotuloCategoria(despesa.categoria).toLowerCase()}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  linha: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.linhaSuave,
  },
  tocada: { backgroundColor: colors.linhaTocada },
  textos: { flex: 1, gap: 2 },
  descricao: { fontFamily: fonts.corpoSemi, fontSize: 14, color: colors.tinta },
  sub: { fontFamily: fonts.corpo, fontSize: 11, color: colors.suave },
  voce: { fontFamily: fonts.corpoForte, color: colors.tinta },
  direita: { alignItems: 'flex-end', gap: 2 },
  valor: { fontFamily: fonts.monoMedio, fontSize: 12.5, color: colors.tinta },
});
