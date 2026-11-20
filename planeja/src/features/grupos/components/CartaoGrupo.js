import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../../../components/atoms/Avatar';
import { Card } from '../../../components/atoms/Card';
import { Etiqueta } from '../../../components/atoms/Etiqueta';
import { colors, fonts } from '../../../config/theme';
import { moeda, nomeViagem, rotuloIntegrantes } from '../formatos';

const MAX_ROSTOS = 3;
const TAMANHO_ROSTO = 30;

const rotuloDespesas = (total) => `${total} ${total === 1 ? 'despesa' : 'despesas'}`;

/**
 * Um grupo na lista "Meus grupos", como no protótipo: "Família · Lisboa",
 * a etiqueta admin/integrante, "3 integrantes · 4 despesas", rostos dos
 * integrantes e o total gasto.
 */
export function CartaoGrupo({ grupo, onPress }) {
  const viagem = nomeViagem(grupo.roteiro);
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
        <Etiqueta tipo={grupo.sou_admin ? 'acento' : 'neutro'}>{grupo.sou_admin ? 'admin' : 'integrante'}</Etiqueta>
      </View>

      <Text style={styles.meta}>
        {rotuloIntegrantes(grupo.total_integrantes)} · {rotuloDespesas(grupo.total_despesas ?? 0)}
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
