/**
 * URL base da API do Planeja (pasta server/ deste repositório).
 * Defina EXPO_PUBLIC_API_URL no .env — em aparelho físico, use o IP da máquina na LAN.
 * Sem a variável: emulador Android → 10.0.2.2 | simulador iOS/web → localhost.
 */
import { Platform } from 'react-native';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Platform.select({
    android: 'http://10.0.2.2:3000',
    ios: 'http://localhost:3000',
    default: 'http://localhost:3000',
  });

export const API_PREFIX = `${API_URL}/api`;
