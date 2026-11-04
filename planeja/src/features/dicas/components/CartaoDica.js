import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../../../components/atoms/Avatar';
import { Card } from '../../../components/atoms/Card';
import { colors, fonts } from '../../../config/theme';
import { mesAno, paraGrade, resumo } from '../formatos';
import { Fotos } from './Fotos';

/**
 * Uma dica na lista, como no protótipo: destino, autor e data, o começo do texto,
 * até 3 fotos e o total de fotos. Tocar em qualquer parte abre o detalhe.
 */
export function CartaoDica({ dica, onPress }) {
  const total = dica.fotos.length;
  const primeiroNome = (dica.autor?.nome ?? 'Usuário').split(' ')[0];

  return (
    <Card onPress={onPress}>
      <View style={styles.topo}>
        <View style={styles.destino}>
          <Text style={styles.cidade}>{dica.cidade}</Text>
          <Text style={styles.pais}>{dica.pais}</Text>
        </View>
        <View style={styles.autor}>
          <Avatar nome={dica.autor?.nome} fotoUri={dica.autor?.foto_url} tamanho={28} />
          <Text style={styles.autorTexto}>
            {primeiroNome} · {mesAno(dica.createdAt)}
          </Text>
        </View>
      </View>

      <Text style={styles.texto}>{resumo(dica)}</Text>

      {total > 0 ? <Fotos fotos={paraGrade(dica.fotos).slice(0, 3)} ampliavel={false} /> : null}

      <View style={styles.rodape}>
        <Text style={styles.rodapeTexto}>
          {total} {total === 1 ? 'foto' : 'fotos'}
        </Text>
        <Text style={styles.ler}>ler dica ›</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  topo: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  destino: { flexShrink: 1 },
  cidade: { fontFamily: fonts.titulo, fontSize: 17, lineHeight: 20, color: colors.tinta },
  pais: {
    fontFamily: fonts.corpo,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.suave,
    marginTop: 2,
  },
  autor: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  autorTexto: { fontFamily: fonts.corpo, fontSize: 11, color: colors.suave },
  texto: { fontFamily: fonts.corpo, fontSize: 13, lineHeight: 19, color: colors.tintaSuave },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    borderTopWidth: 1,
    borderTopColor: colors.linhaSuave,
    paddingTop: 7,
  },
  rodapeTexto: { fontFamily: fonts.corpo, fontSize: 11.5, color: colors.suave },
  ler: { fontFamily: fonts.corpoSemi, fontSize: 11.5, color: colors.tinta },
});
