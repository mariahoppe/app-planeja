import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '../atoms/Button';
import { colors } from '../../config/theme';
import { ErrorMessage } from './ErrorMessage';

/**
 * Estados de uma tela que fala com a API (RNF-06/07): carregando (indicador),
 * erro (faixa com "Tentar de novo") ou nada (quem chamou desenha os dados).
 */
export function EstadoCarga({ carregando, erro, onTentarDeNovo }) {
  if (carregando) {
    return <ActivityIndicator size="large" color={colors.acento} style={styles.indicador} />;
  }

  if (erro) {
    return (
      <View style={styles.caixa}>
        <ErrorMessage mensagem={erro} />
        {onTentarDeNovo ? <Button titulo="Tentar de novo" onPress={onTentarDeNovo} /> : null}
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  indicador: { marginVertical: 24 },
  caixa: { gap: 10 },
});
