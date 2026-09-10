/**
 * SCREEN — SettingsScreen
 * Segunda tela de exemplo, com um estado local simples (Switch).
 */
import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { Button } from '../components/atoms/Button';
import { Label } from '../components/atoms/Label';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { cores, espacamentos, raios } from '../theme';

export function SettingsScreen({ navigation }) {
  const [notificacoes, setNotificacoes] = useState(true);
  const [modoEscuro, setModoEscuro] = useState(false);

  const opcoes = [
    {
      id: 'notificacoes',
      titulo: 'Notificações push',
      descricao: 'Receber avisos do aplicativo',
      valor: notificacoes,
      aoMudar: setNotificacoes,
    },
    {
      id: 'modoEscuro',
      titulo: 'Modo escuro',
      descricao: 'Ainda não implementado nesta aula',
      valor: modoEscuro,
      aoMudar: setModoEscuro,
    },
  ];

  return (
    <ScreenTemplate
      titulo="Configurações"
      subtitulo="Preferências salvas apenas em memória"
      rodape={
        <Button title="Voltar" variante="secundario" onPress={() => navigation.goBack()} />
      }>
      <View style={styles.cartao}>
        {opcoes.map(opcao => (
          <View key={opcao.id} style={styles.linha}>
            <View style={styles.textos}>
              <Label variante="subtitulo">{opcao.titulo}</Label>
              <Label variante="legenda">{opcao.descricao}</Label>
            </View>
            <Switch value={opcao.valor} onValueChange={opcao.aoMudar} />
          </View>
        ))}
      </View>
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: espacamentos.md,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: espacamentos.md,
  },
  textos: { flex: 1, marginRight: espacamentos.md },
});
