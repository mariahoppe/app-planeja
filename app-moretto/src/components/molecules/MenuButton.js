/**
 * MOLECULE — MenuButton
 * Botão grande da Home: ícone + título + descrição dentro de uma área
 * clicável generosa (mínimo de 96px de altura, confortável para o dedo).
 */
import { Pressable, StyleSheet, View } from 'react-native';

import { Label } from '../atoms/Label';
import { cores, espacamentos, raios } from '../../theme';

export function MenuButton({ icone, titulo, descricao, onPress, destaque = false }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      style={({ pressed }) => [
        styles.container,
        destaque && styles.destaque,
        pressed && styles.pressionado,
      ]}>
      <View style={[styles.iconeArea, destaque && styles.iconeAreaDestaque]}>
        <Label style={styles.icone}>{icone}</Label>
      </View>

      <View style={styles.textos}>
        <Label variante="subtitulo" style={destaque && styles.textoDestaque}>
          {titulo}
        </Label>
        {descricao ? (
          <Label variante="legenda" style={[styles.descricao, destaque && styles.textoDestaque]}>
            {descricao}
          </Label>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.md,
    marginBottom: espacamentos.md,
  },
  destaque: {
    backgroundColor: cores.primaria,
    borderColor: cores.primaria,
  },
  pressionado: { opacity: 0.75 },
  iconeArea: {
    width: 60,
    height: 60,
    borderRadius: raios.md,
    backgroundColor: cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: espacamentos.md,
  },
  iconeAreaDestaque: { backgroundColor: 'rgba(255, 255, 255, 0.18)' },
  icone: { fontSize: 30 },
  textos: { flex: 1 },
  descricao: { marginTop: 2 },
  textoDestaque: { color: '#FFFFFF' },
});
