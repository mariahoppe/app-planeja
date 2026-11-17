import { paraData } from '../inicio/formatos';

export { moeda } from '../inicio/formatos';

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// "2026-04-12" → "abr 2026" (mês da viagem, como no protótipo).
export function mesAno(iso) {
  if (!iso) return null;
  const d = paraData(iso);
  return `${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

// "1 integrante" / "5 integrantes"
export function rotuloIntegrantes(total) {
  return `${total} ${total === 1 ? 'integrante' : 'integrantes'}`;
}

// Nome da viagem do grupo: "Paris" (cidade do destino) ou, sem destino, o título do roteiro.
export function nomeViagem(roteiro) {
  if (!roteiro) return null;
  return roteiro.destino?.cidade || roteiro.titulo;
}
