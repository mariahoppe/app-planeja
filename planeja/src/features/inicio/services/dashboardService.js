import { get } from '../../../api/api';

// Painel da tela Início: { totais, proxima_viagem, outros_roteiros, proximas_atividades }.
export function obter() {
  return get('/dashboard');
}
