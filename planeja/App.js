import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Button } from './src/components/atoms/Button';
import { Card } from './src/components/atoms/Card';
import { FormField } from './src/components/molecules/FormField';
import { ScreenTemplate } from './src/components/templates/ScreenTemplate';
import { colors, fonts } from './src/config/theme';
import useFontesPlaneja from './src/hooks/useFontesPlaneja';

// Bancada de teste dos componentes base. Será substituída pela navegação do app.
export default function App() {
  const fontesProntas = useFontesPlaneja();

  if (!fontesProntas) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ScreenTemplate
        sobretitulo="Componentes"
        titulo="Planeja"
        aoVoltar={() => console.log('voltar')}
        direita={<Button titulo="Editar" pequeno onPress={() => console.log('clicou no pequeno')} />}
      >
        <Text style={styles.texto}>Cinco dias · três atividades por dia</Text>
        <Text style={styles.valor}>01 · R$ 2.400,00</Text>
        <FormField label="O que fazer" placeholder="Museu do Louvre" />
        <FormField label="Custo previsto" placeholder="0" keyboardType="numeric" dica="Deixe zero para atividades gratuitas" />
        <FormField label="Horário" defaultValue="25:99" erro="Use o formato 14:30" />
        <FormField label="Local" placeholder="Rue de Rivoli" />
        <FormField label="Link (opcional)" placeholder="https://..." dica="Onde a atividade foi comprada" />
        <Button titulo="+ Publicar dica" variante="primario" bloco onPress={() => console.log('clicou no primário')} />
        <Button titulo="Criar conta" bloco onPress={() => console.log('clicou no secundário')} />
        <Button titulo="Salvar" variante="primario" bloco carregando onPress={() => console.log('não deve aparecer')} />
        <Button titulo="Excluir" bloco desabilitado onPress={() => console.log('não deve aparecer')} />
        <Card onPress={() => console.log('abriu o card')}>
          <Text style={styles.texto}>Paris</Text>
          <Text style={styles.valor}>3 fotos · ler dica ›</Text>
        </Card>
        <Card>
          <Text style={styles.texto}>Card sem toque</Text>
        </Card>
      </ScreenTemplate>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
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
