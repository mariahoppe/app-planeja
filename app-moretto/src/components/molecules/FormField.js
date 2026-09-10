/**
 * MOLECULE — FormField
 * "Campo de texto com label" citado na aula: junta os atoms Label e Input
 * em uma unidade com função própria dentro de um formulário.
 */
import { StyleSheet, View } from 'react-native';

import { Input } from '../atoms/Input';
import { Label } from '../atoms/Label';
import { espacamentos } from '../../theme';

export function FormField({ label, erro = false, ...props }) {
  return (
    <View style={styles.container}>
      <Label variante="legenda" style={styles.label}>
        {label}
      </Label>
      <Input erro={erro} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: espacamentos.md },
  label: {
    marginBottom: espacamentos.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
