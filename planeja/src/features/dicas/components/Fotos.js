import { useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';

import { Button } from '../../../components/atoms/Button';
import { colors, fonts } from '../../../config/theme';

/**
 * Grade de fotos do protótipo, em duas colunas (RF-09).
 * fotos: [{ chave, uri }]. A uri pode ser um link (foto salva) ou um arquivo do aparelho (pré-visualização).
 * onAdicionar: quando informado, mostra o espaço "+ foto" no fim da grade.
 * onRemover: quando informado, a foto ampliada ganha o botão "Remover foto" (recebe a foto).
 * ampliavel: tocar na foto abre ela grande. Desligue quando a grade fica dentro de algo tocável (cartão).
 * adicionando: troca o "+ foto" por um indicador enquanto a foto é preparada.
 */
export function Fotos({ fotos, onAdicionar, onRemover, ampliavel = true, adicionando = false }) {
  const [aberta, setAberta] = useState(null);

  const itens = fotos.map((foto) => ({ chave: foto.chave, foto }));
  if (onAdicionar) itens.push({ chave: 'adicionar' });

  // Duas por linha. Na última linha com um item só, um espaço vazio segura a largura da coluna.
  const linhas = [];
  for (let i = 0; i < itens.length; i += 2) linhas.push(itens.slice(i, i + 2));

  return (
    <View style={styles.grade}>
      {linhas.map((linha) => (
        <View key={linha[0].chave} style={styles.linha}>
          {linha.map((item) =>
            item.foto ? (
              <EspacoFoto
                key={item.chave}
                uri={item.foto.uri}
                onPress={ampliavel ? () => setAberta(item.foto) : undefined}
              />
            ) : (
              <Pressable
                key={item.chave}
                onPress={onAdicionar}
                disabled={adicionando}
                accessibilityRole="button"
                accessibilityLabel="Adicionar foto"
                style={({ pressed }) => [styles.espaco, styles.adicionar, pressed && styles.pressionado]}
              >
                {adicionando ? (
                  <ActivityIndicator color={colors.acento} />
                ) : (
                  <Text style={styles.adicionarTexto}>+ foto</Text>
                )}
              </Pressable>
            )
          )}
          {linha.length === 1 ? <View style={styles.coluna} /> : null}
        </View>
      ))}

      {aberta ? (
        <FotoAmpliada
          foto={aberta}
          onFechar={() => setAberta(null)}
          onRemover={
            onRemover
              ? () => {
                  setAberta(null);
                  onRemover(aberta);
                }
              : undefined
          }
        />
      ) : null}
    </View>
  );
}

// Um espaço de foto. Enquanto a imagem não aparece (ou se ela não abrir), fica o
// espaço listrado do protótipo com a palavra "foto".
function EspacoFoto({ uri, onPress, grande = false }) {
  const [carregada, setCarregada] = useState(false);
  const [falhou, setFalhou] = useState(false);
  const vazio = !carregada || falhou;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'image'}
      accessibilityLabel={onPress ? 'Ampliar foto' : 'Foto'}
      style={({ pressed }) => [
        grande ? styles.espacoGrande : [styles.espaco, styles.coluna],
        vazio && styles.espacoVazio,
        pressed && styles.pressionado,
      ]}
    >
      {vazio ? (
        <>
          <Listras />
          <Text style={[styles.rotuloVazio, grande && styles.rotuloVazioGrande]}>foto</Text>
        </>
      ) : null}
      {!falhou ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onLoad={() => setCarregada(true)}
          onError={() => setFalhou(true)}
        />
      ) : null}
    </Pressable>
  );
}

// Listras diagonais de 3 pontos do espaço vazio, como o fundo do protótipo.
function Listras() {
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
      <Defs>
        <Pattern id="listras" width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <Rect width={3} height={6} fill={colors.linhaTocada} />
          <Rect x={3} width={3} height={6} fill={colors.branco} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#listras)" />
    </Svg>
  );
}

// A foto grande por cima da tela. Toque fora ou no × fecha.
function FotoAmpliada({ foto, onFechar, onRemover }) {
  const { width } = useWindowDimensions();
  const lado = Math.min(width * 0.78, 320);

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={onFechar}>
      <View style={styles.fundo}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onFechar} accessibilityLabel="Fechar" />
        <View style={{ width: lado, height: lado }}>
          <EspacoFoto uri={foto.uri} grande />
          <Pressable
            onPress={onFechar}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Fechar"
            style={styles.fechar}
          >
            <Text style={styles.fecharTexto}>×</Text>
          </Pressable>
        </View>
        {onRemover ? <Button titulo="Remover foto" pequeno onPress={onRemover} /> : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  grade: { marginTop: 8, gap: 8 },
  linha: { flexDirection: 'row', gap: 8 },
  coluna: { flex: 1 },
  espaco: {
    aspectRatio: 4 / 3,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  espacoGrande: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  espacoVazio: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.bordaFoto,
  },
  rotuloVazio: {
    fontFamily: fonts.corpo,
    fontSize: 11,
    color: colors.tenue,
    textAlign: 'center',
  },
  rotuloVazioGrande: { fontSize: 13 },
  adicionar: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.linha,
    backgroundColor: colors.branco,
  },
  adicionarTexto: {
    fontFamily: fonts.corpoForte,
    fontSize: 10,
    color: colors.acento,
  },
  pressionado: { opacity: 0.85 },
  fundo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'rgba(26,26,26,0.4)',
  },
  fechar: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fecharTexto: {
    fontFamily: fonts.corpo,
    fontSize: 18,
    lineHeight: 20,
    color: colors.suave,
  },
});
