/**
 * Regras de dinheiro do grupo — a mesma lógica de rateioDe() e contas() do
 * protótipo, mantida no servidor para que app e API nunca discordem.
 *
 * Nada disso é armazenado: saldos e acerto de contas são recalculados a cada
 * leitura da aba de despesas.
 */

const CENTAVO = 0.01;

const arredondar = (v) => Math.round(v * 100) / 100;

/**
 * Quanto cada integrante deve numa despesa.
 *
 * Na divisão igual, o valor é repartido em centavos inteiros e a sobra vai para
 * os primeiros integrantes — é o que faz R$ 380,00 entre três virar
 * 126,67 / 126,67 / 126,66 e a soma fechar exatamente com o total.
 */
const rateioDe = (despesa, membrosIds) => {
  if (despesa.modo_divisao === 'personalizada') {
    const porUsuario = {};
    (despesa.rateios || []).forEach((r) => {
      porUsuario[r.usuario_id] = Number(r.valor_devido);
    });
    return porUsuario;
  }

  const total = Math.round(Number(despesa.valor) * 100);
  const base = Math.floor(total / membrosIds.length);
  let sobra = total - base * membrosIds.length;

  const porUsuario = {};
  membrosIds.forEach((id) => {
    const centavos = base + (sobra > 0 ? 1 : 0);
    if (sobra > 0) sobra -= 1;
    porUsuario[id] = centavos / 100;
  });
  return porUsuario;
};

/**
 * Saldos individuais e o acerto de contas.
 *
 * O acerto usa o algoritmo guloso do protótipo: o maior devedor paga o maior
 * credor, repetidamente. Isso produz o menor número de transferências na
 * prática, sem precisar resolver o caso ótimo.
 */
const calcularContas = (despesas, membrosIds) => {
  const pago = {};
  const devido = {};
  membrosIds.forEach((id) => { pago[id] = 0; devido[id] = 0; });

  despesas.forEach((d) => {
    pago[d.pagador_id] = (pago[d.pagador_id] || 0) + Number(d.valor);
    const rateio = rateioDe(d, membrosIds);
    Object.entries(rateio).forEach(([id, valor]) => {
      devido[id] = (devido[id] || 0) + Number(valor);
    });
  });

  const saldos = membrosIds.map((id) => ({
    usuario_id: id,
    pago: arredondar(pago[id] || 0),
    devido: arredondar(devido[id] || 0),
    saldo: arredondar((pago[id] || 0) - (devido[id] || 0))
  }));

  const credores = saldos.filter((s) => s.saldo > CENTAVO).map((s) => ({ ...s })).sort((a, b) => b.saldo - a.saldo);
  const devedores = saldos.filter((s) => s.saldo < -CENTAVO).map((s) => ({ ...s })).sort((a, b) => a.saldo - b.saldo);

  const acertos = [];
  let i = 0;
  let j = 0;
  while (i < devedores.length && j < credores.length) {
    const valor = Math.min(-devedores[i].saldo, credores[j].saldo);
    if (valor > CENTAVO) {
      acertos.push({ de: devedores[i].usuario_id, para: credores[j].usuario_id, valor: arredondar(valor) });
    }
    devedores[i].saldo += valor;
    credores[j].saldo -= valor;
    if (Math.abs(devedores[i].saldo) < CENTAVO) i += 1;
    if (Math.abs(credores[j].saldo) < CENTAVO) j += 1;
  }

  const total = arredondar(despesas.reduce((s, d) => s + Number(d.valor), 0));

  return {
    total,
    total_por_pessoa: membrosIds.length ? arredondar(total / membrosIds.length) : 0,
    saldos,
    acertos
  };
};

module.exports = { rateioDe, calcularContas, arredondar };
