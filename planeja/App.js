import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Button from './src/components/Button';
import { colors, fonts, spacing } from './src/config/theme';
import useFontesPlaneja from './src/hooks/useFontesPlaneja';

export default function App() {
  const fontesProntas = useFontesPlaneja();

  if (!fontesProntas) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Planeja</Text>
      <Text style={styles.texto}>Cinco dias · três atividades por dia</Text>
      <Text style={styles.valor}>01 · R$ 2.400,00</Text>
      <Button titulo="Entrar" variante="primario" onPress={() => console.log('clicou no primário')} />
      <Button titulo="Criar conta" onPress={() => console.log('clicou no secundário')} />
      <Button titulo="+ Publicar dica" variante="primario" bloco onPress={() => console.log('clicou no bloco')} />
      <Button titulo="Editar" pequeno onPress={() => console.log('clicou no pequeno')} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.papel,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  titulo: {
    fontFamily: fonts.tituloMedio,
    fontSize: 27,
    color: colors.tinta,
  },
  texto: {
    fontFamily: fonts.corpo,
    fontSize: 15,
    color: colors.suave,
  },
  valor: {
    fontFamily: fonts.monoMedio,
    fontSize: 12.5,
    color: colors.tinta,
  },
});
