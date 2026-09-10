/**
 * SCREEN — HomeScreen
 * Destino após o login. Os botões grandes vêm do organism MainMenu;
 * a tela só monta a lista de itens e diz o que cada um faz.
 */
import { Alert, StyleSheet, View } from 'react-native';

import { Button } from '../components/atoms/Button';
import { Label } from '../components/atoms/Label';
import { MainMenu } from '../components/organisms/MainMenu';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { logout } from '../services/auth';
import { cores, espacamentos, raios } from '../theme';

export function HomeScreen({ navigation }) {
  function emConstrucao(nome) {
    Alert.alert(nome, 'Rota hipotética — ainda não implementada nesta aula.');
  }

  function handleSair() {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.replace('Login');
        },
      },
    ]);
  }

  const itens = [
    {
      id: 'perfil',
      icone: '👤',
      titulo: 'Meu Perfil',
      descricao: 'Ver e editar seus dados',
      onPress: () => navigation.navigate('Perfil'),
    },
    {
      id: 'config',
      icone: '⚙️',
      titulo: 'Configurações',
      descricao: 'Preferências do aplicativo',
      onPress: () => navigation.navigate('Config'),
    },
    {
      id: 'notificacoes',
      icone: '🔔',
      titulo: 'Notificações',
      descricao: 'Avisos e mensagens recebidas',
      onPress: () => emConstrucao('Notificações'),
    },
    {
      id: 'relatorios',
      icone: '📊',
      titulo: 'Relatórios',
      descricao: 'Resumo das suas atividades',
      onPress: () => emConstrucao('Relatórios'),
    },
  ];

  return (
    <ScreenTemplate
      titulo="Bem-vindo!"
      subtitulo="Escolha uma das opções abaixo"
      rodape={<Button title="Sair" variante="perigo" onPress={handleSair} />}>
      <View style={styles.aviso}>
        <Label variante="legenda">
          Sessão iniciada com o usuário de teste. O token ficou salvo no
          armazenamento local — feche e reabra o app para ver o login automático.
        </Label>
      </View>

      <MainMenu itens={itens} />
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  aviso: {
    backgroundColor: '#E7F3EC',
    borderLeftWidth: 4,
    borderLeftColor: cores.sucesso,
    borderRadius: raios.sm,
    padding: espacamentos.md,
    marginBottom: espacamentos.lg,
  },
});
