/**
 * URL base da API — backend desenvweb2026
 * Android emulator → 10.0.2.2 | iOS simulator → localhost
 * Em dispositivo físico, use o IP da máquina na LAN.
 */
import { Platform } from 'react-native';

export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8080',
  ios: 'http://localhost:8080',
  default: 'http://localhost:8080',
});

export const API_PREFIX = `${API_BASE_URL}/blog/api/v1`;
