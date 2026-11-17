import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../../../components/atoms/Avatar';
import { Card } from '../../../components/atoms/Card';
import { colors, fonts } from '../../../config/theme';
import { mesAno, moeda, nomeViagem, rotuloIntegrantes } from '../formatos';

const MAX_ROSTOS = 3;
const TAMANHO_ROSTO = 30;

/**
 * Um grupo na lista "Meus grupos", como no protótipo:
 * "Família · Lisboa", "3 integrantes · set 2026", rostos dos integrantes e o total gasto.
 */
export function CartaoGrupo({ grupo, onPress }) {
  const viagem = nomeViagem(grupo.roteiro);
  const mes = mesAno(grupo.roteiro?.inicio);
  const membros = grupo.membros || [];
  const visiveis = membros.slice(0, MAX_ROSTOS);
  const restantes = membros.length - visiveis.length;

  return (
    <Card onPress={onPress}>
      <View style={styles.linha}>
        <Text style={styles.nome} numberOfLines={2}>
          {grupo.nome}
          {viagem ? <Text style={styles.viagem}>{` · ${viagem}`}</Text> : null}
        </Text>
        {grupo.sou_admin ? <Text style={styles.selo}>Criador</Text> : null}
      </View>

      <Text style={styles.meta}>
        {rotuloIntegrantes(grupo.total_integrantes)}
        {mes ? ` · ${mes}` : ''}
      </Text>

      <View style={styles.rodape}>
        <View style={styles.rostos} accessibilityLabel={membros.map((m) => m.usuario?.nome).join(', ')}>
          {visiveis.map((m, i) => (
            <View key={m.usuario_id} style={[styles.rosto, i > 0 && styles.sobreposto]}>
              <Avatar nome={m.usuario?.nome} fotoUri={m.usuario?.foto_url} tamanho={TAMANHO_ROSTO} />
            </View>
          ))}
          {restantes > 0 ? (
            <View style={[styles.rosto, styles.sobreposto, styles.mais]}>
              <Text style={styles.maisTexto}>+{restantes}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.total}>{moeda(grupo.total_gasto)}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  nome: { flex: 1, fontFamily: fonts.titulo, fontSize: 17, color: colors.tinta },
  viagem: { color: colors.suave },
  selo: {
    fontFamily: fonts.corpoForte,
    fontSize: 9.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.acento,
    marginTop: 4,
  },
  meta: {
    fontFamily: fonts.corpoSemi,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.tenue,
  },
  rodape: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  rostos: { flexDirection: 'row', alignItems: 'center' },
  rosto: {
    borderRadius: TAMANHO_ROSTO / 2 + 2,
    borderWidth: 2,
    borderColor: colors.branco,
  },
  sobreposto: { marginLeft: -8 },
  mais: {
    width: TAMANHO_ROSTO + 4,
    height: TAMANHO_ROSTO + 4,
    backgroundColor: colors.linhaSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  maisTexto: { fontFamily: fonts.corpoSemi, fontSize: 11, color: colors.suave },
  total: { fontFamily: fonts.monoMedio, fontSize: 14, color: colors.tinta },
});
