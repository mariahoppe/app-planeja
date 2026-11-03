import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../../config/theme';

/**
 * Foto redonda do usuário; sem foto, um círculo com a inicial do nome.
 * fotoUri: a imagem (arquivo, link ou texto em base64, como vem do banco).
 * tamanho: diâmetro em pontos (padrão 40, mínimo de toque confortável).
 * onPress: quando informado, o avatar é tocável (ex.: abre o Perfil).
 */
export function Avatar({ nome, fotoUri, tamanho = 40, onPress }) {
  const [fotoComErro, setFotoComErro] = useState(null);

  const inicial = (nome || '?').trim().charAt(0).toUpperCase();
  const dimensoes = { width: tamanho, height: tamanho, borderRadius: tamanho / 2 };
  // Se a imagem não carregar, volta para a inicial em vez de um círculo vazio.
  const mostrarFoto = fotoUri && fotoUri !== fotoComErro;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      hitSlop={8}
      accessibilityRole={onPress ? 'button' : 'image'}
      accessibilityLabel={`Perfil de ${nome || 'usuário'}`}
      style={({ pressed }) => [styles.circulo, dimensoes, pressed && styles.pressionado]}
    >
      {mostrarFoto ? (
        <Image source={{ uri: fotoUri }} style={dimensoes} onError={() => setFotoComErro(fotoUri)} />
      ) : (
        <Text style={[styles.inicial, { fontSize: tamanho * 0.33 }]}>{inicial}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circulo: {
    backgroundColor: colors.acentoSuave,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pressionado: {
    opacity: 0.85,
  },
  inicial: {
    fontFamily: fonts.tituloMedio,
    color: colors.acento,
  },
});
