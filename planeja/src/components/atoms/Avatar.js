import { Image, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../../config/theme';

/**
 * Foto redonda do usuário; sem foto, um círculo com a inicial do nome.
 * fotoUri: endereço da imagem (ex.: a foto local do perfil).
 * tamanho: diâmetro em pontos (padrão 40, mínimo de toque confortável).
 * onPress: quando informado, o avatar é tocável (ex.: abre o Perfil).
 */
export function Avatar({ nome, fotoUri, tamanho = 40, onPress }) {
  const inicial = (nome || '?').trim().charAt(0).toUpperCase();
  const dimensoes = { width: tamanho, height: tamanho, borderRadius: tamanho / 2 };

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      hitSlop={8}
      accessibilityRole={onPress ? 'button' : 'image'}
      accessibilityLabel={`Perfil de ${nome || 'usuário'}`}
      style={({ pressed }) => [styles.circulo, dimensoes, pressed && styles.pressionado]}
    >
      {fotoUri ? (
        <Image source={{ uri: fotoUri }} style={dimensoes} />
      ) : (
        <Text style={[styles.inicial, { fontSize: tamanho * 0.42 }]}>{inicial}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circulo: {
    backgroundColor: colors.acento,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pressionado: {
    opacity: 0.85,
  },
  inicial: {
    fontFamily: fonts.titulo,
    color: colors.branco,
  },
});
