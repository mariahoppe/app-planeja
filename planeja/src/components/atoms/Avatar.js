import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../../config/theme';

// Abaixo disso o avatar é "de lista" (Source Sans forte); a partir dele, "de perfil" (Fraunces)
const TAMANHO_GRANDE = 40;

// "Maria Hoppe" → "MH"; "Maria" → "M", como o .avat do protótipo
function iniciais(nome) {
  const partes = (nome || '?').trim().split(/\s+/);
  const primeira = partes[0].charAt(0);
  const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : '';
  return `${primeira}${ultima}`.toUpperCase();
}

/**
 * Foto redonda do usuário; sem foto, um círculo com as iniciais do nome.
 * fotoUri: a imagem (arquivo, link ou texto em base64, como vem do banco).
 * tamanho: diâmetro em pontos (padrão 28, o do protótipo; 52 no Perfil).
 * onPress: quando informado, o avatar é tocável (ex.: abre o Perfil); o hitSlop
 *   completa a área de toque de 44pt (RNF-03).
 */
export function Avatar({ nome, fotoUri, tamanho = 28, onPress }) {
  const [fotoComErro, setFotoComErro] = useState(null);

  const texto = iniciais(nome);
  const grande = tamanho >= TAMANHO_GRANDE;
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
        <Text
          style={grande ? [styles.inicialGrande, { fontSize: tamanho * 0.33 }] : [styles.inicial, { fontSize: tamanho * 0.36 }]}
        >
          {texto}
        </Text>
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
    fontFamily: fonts.corpoForte,
    color: colors.acento,
  },
  inicialGrande: {
    fontFamily: fonts.tituloMedio,
    color: colors.acento,
  },
});
