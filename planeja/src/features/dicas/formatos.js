// Textos e fotos das dicas como o protótipo mostra.
import { BLOCOS } from './validacao';

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// "2026-03-15T12:00:00.000Z" (createdAt da API) → "mar 2026", no fuso do aparelho.
export function mesAno(iso) {
  const data = new Date(iso);
  return `${MESES[data.getMonth()]} ${data.getFullYear()}`;
}

// Começo do primeiro bloco preenchido, cortado em 105 caracteres, como o cartão do protótipo.
export function resumo(dica) {
  const texto = BLOCOS.map((b) => dica[b.chave]).find((t) => t && t.trim()) ?? '';
  return `${texto.slice(0, 105)}…`;
}

// A API não garante a ordem: fotos na ordem dos blocos e, dentro de cada um, pelo espaço (1 a 4).
export function ordenarFotos(fotos) {
  const posicao = (f) => BLOCOS.findIndex((b) => b.chave === f.bloco);
  return [...fotos].sort((a, b) => posicao(a) - posicao(b) || a.ordem - b.ordem);
}

// Fotos da API no formato da grade de fotos ({ chave, uri }), já em ordem.
export function paraGrade(fotos) {
  return ordenarFotos(fotos).map((f) => ({ chave: String(f.id), uri: f.url }));
}
