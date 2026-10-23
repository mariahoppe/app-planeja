import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Recursos do aparelho: câmera, galeria, GPS, permissões e aviso local.
 * As telas não importam expo-* direto — só este arquivo.
 * Cada permissão é pedida na hora do uso (no toque do botão), nunca na abertura do app.
 * Retorno null = o usuário cancelou. throw = permissão negada ou recurso indisponível.
 */

const CANAL_ANDROID = 'planeja';
let handlerPronto = false;

// Faz o aviso aparecer mesmo com o app aberto. Pode ser chamada várias vezes.
export function configurarNotificacoes() {
  if (handlerPronto) {
    return;
  }
  handlerPronto = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

function recusarSeWeb() {
  if (Platform.OS === 'web') {
    throw new Error('Recurso nativo indisponível no navegador.');
  }
}

// Foto quadrada e comprimida (quality 0.6) para não pesar no envio.
const opcoesFoto = {
  mediaTypes: ['images'],
  quality: 0.6,
  allowsEditing: true,
  aspect: [1, 1],
};

export async function capturarFoto() {
  recusarSeWeb();
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permissão da câmera negada.');
  }
  const resultado = await ImagePicker.launchCameraAsync(opcoesFoto);
  if (resultado.canceled) {
    return null;
  }
  return { uri: resultado.assets[0].uri };
}

export async function escolherImagem() {
  recusarSeWeb();
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permissão da galeria negada.');
  }
  const resultado = await ImagePicker.launchImageLibraryAsync(opcoesFoto);
  if (resultado.canceled) {
    return null;
  }
  return { uri: resultado.assets[0].uri };
}

const ESPERA_GPS_MS = 15000;

// Sem sinal (emulador sem ponto fictício, dentro de prédio) o GPS pode nunca responder:
// espera no máximo ESPERA_GPS_MS e depois tenta a última posição que o aparelho conhece.
async function posicaoComLimite() {
  const tempoEsgotado = new Promise((resolver) => setTimeout(() => resolver(null), ESPERA_GPS_MS));
  const atual = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const posicao = await Promise.race([atual, tempoEsgotado]);
  return posicao ?? Location.getLastKnownPositionAsync();
}

// Posição atual (só "enquanto usa o app") + cidade e país, quando o sistema consegue descobrir.
export async function obterPosicao() {
  recusarSeWeb();
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permissão de localização negada.');
  }
  if (!(await Location.hasServicesEnabledAsync())) {
    throw new Error('A localização do aparelho está desligada. Ligue-a e tente de novo.');
  }
  const posicao = await posicaoComLimite();
  if (!posicao) {
    throw new Error('Não foi possível obter a localização. Tente de novo em um lugar aberto.');
  }
  const { latitude, longitude, accuracy } = posicao.coords;

  let cidade = null;
  let pais = null;
  try {
    const [endereco] = await Location.reverseGeocodeAsync({ latitude, longitude });
    cidade = endereco?.city || endereco?.subregion || null;
    pais = endereco?.country || null;
  } catch {
    // Sem internet o sistema não traduz coordenadas em cidade; fica só lat/lng.
  }

  return { latitude, longitude, precisao: accuracy, cidade, pais };
}

// Situação atual de cada permissão: 'granted', 'denied', 'undetermined' ou 'indisponivel'.
export async function statusPermissoes() {
  if (Platform.OS === 'web') {
    return {
      camera: 'indisponivel',
      galeria: 'indisponivel',
      localizacao: 'indisponivel',
      notificacoes: 'indisponivel',
    };
  }
  const [camera, galeria, localizacao, notificacoes] = await Promise.all([
    ImagePicker.getCameraPermissionsAsync(),
    ImagePicker.getMediaLibraryPermissionsAsync(),
    Location.getForegroundPermissionsAsync(),
    Notifications.getPermissionsAsync(),
  ]);
  return {
    camera: camera.status,
    galeria: galeria.status,
    localizacao: localizacao.status,
    notificacoes: notificacoes.status,
  };
}

export async function pedirPermissaoNotificacao() {
  recusarSeWeb();
  configurarNotificacoes();
  // No Android 13+ o canal precisa existir antes do pedido de permissão.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL_ANDROID, {
      name: 'Planeja',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const atual = await Notifications.getPermissionsAsync();
  let status = atual.status;
  if (status !== 'granted') {
    const pedido = await Notifications.requestPermissionsAsync();
    status = pedido.status;
  }
  return status === 'granted';
}

// Aviso LOCAL: o próprio aparelho agenda, sem servidor de push. Aparece em ~2 segundos.
export async function enviarAvisoLocal({ titulo, corpo }) {
  const ok = await pedirPermissaoNotificacao();
  if (!ok) {
    throw new Error('Permissão de notificação negada.');
  }
  await Notifications.scheduleNotificationAsync({
    content: { title: titulo, body: corpo },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
      channelId: CANAL_ANDROID,
    },
  });
}
