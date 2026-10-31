import { paraData } from '../inicio/formatos';

const UM_DIA = 24 * 60 * 60 * 1000;
const doisDigitos = (n) => String(n).padStart(2, '0');

// "2026-12-01" → "01/12/2026"
export function dataBR(iso) {
  if (!iso) return '—';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

// A API guarda o "dia N da viagem" e a tela mostra a data. Dia 1 = início do roteiro.
export function dataDoDia(inicio, dia) {
  const data = paraData(inicio);
  data.setDate(data.getDate() + dia - 1);
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
}

export function diaDaData(inicio, data) {
  return Math.round((paraData(data) - paraData(inicio)) / UM_DIA) + 1;
}

// O teclado numérico do Android não tem ":", então ele entra sozinho: "1430" → "14:30".
export function mascaraHorario(texto) {
  const numeros = texto.replace(/\D/g, '').slice(0, 4);
  return numeros.length > 2 ? `${numeros.slice(0, 2)}:${numeros.slice(2)}` : numeros;
}
