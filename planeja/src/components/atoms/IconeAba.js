import Svg, { Circle, Path } from 'react-native-svg';

// Os desenhos do protótipo (viewBox 24x24), um para cada aba.
const DESENHOS = {
  inicio: <Path d="M4 11.5 12 4l8 7.5M6 10v9h5v-6h2v6h5v-9" />,
  roteiros: <Path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4zM9 9h6M9 13h6" />,
  dicas: (
    <>
      <Path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z" />
      <Circle cx={12} cy={10} r={2.4} />
    </>
  ),
  grupos: (
    <>
      <Circle cx={8.5} cy={8} r={3} />
      <Circle cx={16.5} cy={9} r={2.4} />
      <Path d="M3 20v-1.5A4.5 4.5 0 0 1 7.5 14h2A4.5 4.5 0 0 1 14 18.5V20M15 14.3a3.6 3.6 0 0 1 6 2.7V20" />
    </>
  ),
};

/**
 * Ícone de uma aba inferior, em traço de 1.6 como no protótipo (o destaque da
 * aba ativa é o fundo da BarraAbas, não o ícone).
 * nome: uma das chaves de DESENHOS. cor: muda entre a aba ativa e as demais.
 */
export function IconeAba({ nome, cor }) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke={cor}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {DESENHOS[nome]}
    </Svg>
  );
}
