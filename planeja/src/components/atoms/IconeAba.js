import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '../../config/theme';

// Desenhos em traço (viewBox 24x24), um para cada aba.
const DESENHOS = {
  inicio: <Path d="M3 11.5 12 4l9 7.5M5.5 9.5v10h13v-10M10 19.5V14h4v5.5" />,
  roteiros: <Path d="M9 4 3 6.5V20l6-2.5 6 2.5 6-2.5V4l-6 2.5L9 4zM9 4v13.5M15 6.5V20" />,
  destinos: (
    <>
      <Path d="M12 21s7-6.2 7-11.5a7 7 0 1 0-14 0C5 14.8 12 21 12 21z" />
      <Circle cx={12} cy={9.5} r={2.5} />
    </>
  ),
  dicas: (
    <Path d="M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z" />
  ),
  ranking: <Path d="M4 20h16M6 20v-6h3.5v6M10.25 20V7h3.5v13M14.5 20v-9H18v9" />,
  grupos: (
    <>
      <Circle cx={9} cy={8} r={3.5} />
      <Path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M15.5 4.8a3.5 3.5 0 0 1 0 6.4M17.5 14.4c2.1.8 3.5 2.9 3.5 5.6" />
    </>
  ),
};

/**
 * Ícone de uma aba inferior. Na aba ativa, ganha um fundo em pílula.
 * nome: uma das chaves de DESENHOS. cor: vem do navegador (ativa ou inativa).
 */
export function IconeAba({ nome, cor, ativo }) {
  return (
    <View style={[styles.pilula, ativo && styles.pilulaAtiva]}>
      <Svg
        width={22}
        height={22}
        viewBox="0 0 24 24"
        fill="none"
        stroke={cor}
        strokeWidth={ativo ? 2.2 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {DESENHOS[nome]}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  pilula: {
    width: 48,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pilulaAtiva: {
    backgroundColor: colors.acentoSuave,
  },
});
