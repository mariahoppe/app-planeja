/**
 * URL base da API do Planeja (pasta server/ deste repositório).
 * Defina EXPO_PUBLIC_API_URL no .env — em aparelho físico, use o IP da máquina na LAN.
 * Sem a variável: emulador Android → 10.0.2.2 | simulador iOS/web → localhost.
 *
 * HTTP só vale em desenvolvimento (rede local / emulador). Em produção use HTTPS,
 * senão o token e a senha do login viajam abertos pela rede.
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

/**
 * Fotos das dicas: vão para o bucket "dicas" do Supabase Storage, e a API guarda só o endereço.
 * A anon key é pública por natureza (fica dentro do app): o bucket só deixa enviar arquivos.
 */
export const SUPABASE_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
