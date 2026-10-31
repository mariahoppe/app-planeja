import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../../../components/atoms/Card';
import { colors, fonts } from '../../../config/theme';
import { horaCurta } from '../formatos';

/**
 * Linha do tempo das atividades pendentes da próxima viagem (até 5, vindas do dashboard).
 */
export function ProximasAtividades({ atividades, onPress }) {
  return (
    <Card onPress={onPress} style={styles.card}>
      {atividades.map((a, i) => {
        const ultima = i === atividades.length - 1;
        return (
          <View key={a.id} style={styles.linha}>
            <View style={styles.quando}>
              <Text style={styles.dia}>Dia {a.dia}</Text>
              {a.horario ? <Text style={styles.hora}>{horaCurta(a.horario)}</Text> : null}
            </View>

            <View style={styles.trilha}>
              <View style={styles.ponto} />
              {ultima ? null : <View style={styles.traco} />}
            </View>

            <View style={[styles.oque, !ultima && styles.oqueEspaco]}>
              <Text style={styles.titulo} numberOfLines={1}>
                {a.titulo}
              </Text>
              {a.local ? (
                <Text style={styles.local} numberOfLines={1}>
                  {a.local}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: 16, gap: 0 },
  linha: { flexDirection: 'row', gap: 12 },
  quando: { width: 52, alignItems: 'flex-end', paddingTop: 1 },
  dia: {
    fontFamily: fonts.corpoForte,
    fontSize: 9.5,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.acento,
  },
  hora: { fontFamily: fonts.mono, fontSize: 12, color: colors.suave },
  trilha: { width: 10, alignItems: 'center' },
  ponto: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 3,
    borderWidth: 2,
    borderColor: colors.acento,
    backgroundColor: colors.branco,
  },
  traco: { flex: 1, width: 1.5, backgroundColor: colors.linha, marginVertical: 3 },
  oque: { flex: 1, gap: 2 },
  oqueEspaco: { paddingBottom: 16 },
  titulo: { fontFamily: fonts.corpoSemi, fontSize: 15, color: colors.tinta },
  local: { fontFamily: fonts.corpo, fontSize: 13, color: colors.suave },
});
