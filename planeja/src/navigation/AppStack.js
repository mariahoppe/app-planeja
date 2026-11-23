import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AtividadeFormScreen } from '../features/atividades/screens/AtividadeFormScreen';
import { DespesaFormScreen } from '../features/grupos/screens/DespesaFormScreen';
import { DestinoFormScreen } from '../features/destinos/screens/DestinoFormScreen';
import { DicaDetalheScreen } from '../features/dicas/screens/DicaDetalheScreen';
import { DicaFormScreen } from '../features/dicas/screens/DicaFormScreen';
import { GrupoDetalheScreen } from '../features/grupos/screens/GrupoDetalheScreen';
import { GrupoFormScreen } from '../features/grupos/screens/GrupoFormScreen';
import { ConfiguracoesScreen } from '../features/perfil/screens/ConfiguracoesScreen';
import { AvaliacaoFormScreen } from '../features/ranking/screens/AvaliacaoFormScreen';
import { MinhasAvaliacoesScreen } from '../features/ranking/screens/MinhasAvaliacoesScreen';
import { RoteiroDetalheScreen } from '../features/roteiros/screens/RoteiroDetalheScreen';
import { RoteiroFormScreen } from '../features/roteiros/screens/RoteiroFormScreen';
import { AbasNavigator } from './AbasNavigator';

const Stack = createNativeStackNavigator();

/**
 * Telas de quem está logado. As abas são a base da pilha (o Perfil é uma delas);
 * Configurações e as telas de detalhe e formulário abrem por cima (com "‹ Voltar").
 */
export function AppStack() {
  return (
    <Stack.Navigator initialRouteName="Abas" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Abas" component={AbasNavigator} />
      <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} />
      <Stack.Screen name="RoteiroDetalhe" component={RoteiroDetalheScreen} />
      <Stack.Screen name="RoteiroForm" component={RoteiroFormScreen} />
      <Stack.Screen name="AtividadeForm" component={AtividadeFormScreen} />
      <Stack.Screen name="DestinoForm" component={DestinoFormScreen} />
      <Stack.Screen name="AvaliacaoForm" component={AvaliacaoFormScreen} />
      <Stack.Screen name="MinhasAvaliacoes" component={MinhasAvaliacoesScreen} />
      <Stack.Screen name="DicaDetalhe" component={DicaDetalheScreen} />
      <Stack.Screen name="DicaForm" component={DicaFormScreen} />
      <Stack.Screen name="GrupoForm" component={GrupoFormScreen} />
      <Stack.Screen name="GrupoDetalhe" component={GrupoDetalheScreen} />
      <Stack.Screen name="DespesaForm" component={DespesaFormScreen} />
    </Stack.Navigator>
  );
}
