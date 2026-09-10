/**
 * MOLECULE — ErrorMessage
 * Faixa de erro exibida acima do formulário. Se não houver mensagem,
 * não renderiza nada — quem chama não precisa fazer o if.
 */
import { StyleSheet, View } from 'react-native';

import { Label } from '../atoms/Label';
import { cores, espacamentos, raios } from '../../theme';

export function ErrorMessage({ mensagem }) {
  if (!mensagem) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Label style={styles.texto}>{mensagem}</Label>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FDEDEC',
    borderLeftWidth: 4,
    borderLeftColor: cores.perigo,
    borderRadius: raios.sm,
    padding: espacamentos.md,
    marginBottom: espacamentos.md,
  },
  texto: { color: cores.perigo },
});
