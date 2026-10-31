// Datas e valores da tela Início. As datas da API chegam como "2026-12-01".
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MESES_LONGOS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];
const DIAS_SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const UM_DIA = 24 * 60 * 60 * 1000;

export const STATUS_VIAGEM = {
  planejando: 'Planejando',
  confirmado: 'Confirmada',
  concluido: 'Concluída',
};

// Lê "aaaa-mm-dd" como data local (new Date("aaaa-mm-dd") seria UTC e voltaria um dia no Brasil).
export function paraData(iso) {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

export function saudacao(agora = new Date()) {
  const hora = agora.getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

// "sexta, 30 de outubro"
export function hojePorExtenso(agora = new Date()) {
  return `${DIAS_SEMANA[agora.getDay()]}, ${agora.getDate()} de ${MESES_LONGOS[agora.getMonth()]}`;
}

// "12–17 abr 2026", "28 mar – 3 abr 2026" ou "A partir de 12 abr 2026"
export function periodoCurto(inicio, fim) {
  const i = paraData(inicio);
  if (!fim) return `A partir de ${i.getDate()} ${MESES[i.getMonth()]} ${i.getFullYear()}`;

  const f = paraData(fim);
  if (i.getFullYear() !== f.getFullYear()) {
    return `${i.getDate()} ${MESES[i.getMonth()]} ${i.getFullYear()} – ${f.getDate()} ${MESES[f.getMonth()]} ${f.getFullYear()}`;
  }
  if (i.getMonth() !== f.getMonth()) {
    return `${i.getDate()} ${MESES[i.getMonth()]} – ${f.getDate()} ${MESES[f.getMonth()]} ${f.getFullYear()}`;
  }
  return `${i.getDate()}–${f.getDate()} ${MESES[i.getMonth()]} ${f.getFullYear()}`;
}

/**
 * Onde a viagem está em relação a hoje:
 * { tipo: 'faltam', dias } · { tipo: 'andamento', diaAtual, totalDias } · { tipo: 'passou', dias }
 */
export function situacaoViagem(inicio, fim, agora = new Date()) {
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const i = paraData(inicio);
  const f = fim ? paraData(fim) : i;

  if (hoje < i) return { tipo: 'faltam', dias: Math.round((i - hoje) / UM_DIA) };
  if (hoje <= f) {
    return {
      tipo: 'andamento',
      diaAtual: Math.round((hoje - i) / UM_DIA) + 1,
      totalDias: Math.round((f - i) / UM_DIA) + 1,
    };
  }
  return { tipo: 'passou', dias: Math.round((hoje - f) / UM_DIA) };
}

// 1234.5 → "R$ 1.234,50"
export function moeda(valor) {
  const [inteiro, centavos] = Number(valor || 0).toFixed(2).split('.');
  return `R$ ${inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${centavos}`;
}

// "09:00:00" → "09:00"
export function horaCurta(horario) {
  return horario ? horario.slice(0, 5) : null;
}
