/**
 * Regras de dinheiro do grupo — a mesma lógica de rateioDe() e contas() do
 * protótipo, mantida no servidor para que app e API nunca discordem.
 *
 * O rateio de cada despesa é gravado em despesa_rateios no momento em que ela é
 * lançada, nos dois modos de divisão. Saldos e acerto de contas não são
 * armazenados: são recalculados a cada leitura da aba de despesas, a partir
 * desses rateios. Assim, quem sai do grupo continua nas contas das despesas de
 * que participou, e quem entra depois não herda despesas antigas.
 *
 * Todas as contas são feitas em centavos inteiros, para não acumular erro de
 * ponto flutuante.
 */

const centavos = (v) => Math.round(Number(v) * 100);
const reais = (c) => c / 100;

const arredondar = (v) => reais(centavos(v));

/**
 * Quanto cada integrante deve numa despesa: { [usuarioId]: valor }.
 *
 * Na divisão igual, o valor é repartido em centavos inteiros e a sobra vai para
 * os primeiros integrantes — é o que faz R$ 380,00 entre três virar
 * 126,67 / 126,67 / 126,66 e a soma fechar exatamente com o total. A ordem de
 * membrosIds decide quem fica com a sobra; o despesaService usa a ordem de
 * entrada no grupo.
 */
const rateioDe = (despesa, membrosIds) => {
  if (despesa.modo_divisao === 'personalizada') {
    const porUsuario = {};
    (despesa.rateios || []).forEach((r) => {
      porUsuario[r.usuario_id] = Number(r.valor_devido);
    });
    return porUsuario;
  }

  const total = centavos(despesa.valor);
  const base = Math.floor(total / membrosIds.length);
  let sobra = total - base * membrosIds.length;

  const porUsuario = {};
  membrosIds.forEach((id) => {
    const parte = base + (sobra > 0 ? 1 : 0);
    if (sobra > 0) sobra -= 1;
    porUsuario[id] = reais(parte);
  });
  return porUsuario;
};

/**
 * Saldos individuais e o acerto de contas.
 *
 * despesas: com os rateios gravados ({ valor, pagador_id, rateios: [{ usuario_id, valor_devido }] }).
 * membrosIds: integrantes atuais, na ordem em que entraram.
 *
 * Os saldos cobrem os integrantes atuais e também quem já saiu mas ainda pagou
 * ou deve alguma despesa (marcado com saiu: true).
 *
 * O acerto usa o algoritmo guloso do protótipo: o maior devedor paga o maior
 * credor, repetidamente. Garante no máximo n-1 transferências; não resolve o
 * caso ótimo, que seria um problema combinatório.
 */
const calcularContas = (despesas, membrosIds) => {
  const pago = {};
  const devido = {};
  const participantes = [...membrosIds];
  const incluir = (id) => {
    if (!participantes.includes(id)) participantes.push(id);
  };

  despesas.forEach((d) => {
    const pagador = Number(d.pagador_id);
    incluir(pagador);
    pago[pagador] = (pago[pagador] || 0) + centavos(d.valor);

    (d.rateios || []).forEach((r) => {
      const id = Number(r.usuario_id);
      incluir(id);
      devido[id] = (devido[id] || 0) + centavos(r.valor_devido);
    });
  });

  const emCentavos = participantes.map((id) => ({
    usuario_id: id,
    saiu: !membrosIds.includes(id),
    pago: pago[id] || 0,
    devido: devido[id] || 0,
    saldo: (pago[id] || 0) - (devido[id] || 0)
  }));

  const credores = emCentavos.filter((s) => s.saldo > 0).map((s) => ({ ...s })).sort((a, b) => b.saldo - a.saldo);
  const devedores = emCentavos.filter((s) => s.saldo < 0).map((s) => ({ ...s })).sort((a, b) => a.saldo - b.saldo);

  const acertos = [];
  let i = 0;
  let j = 0;
  while (i < devedores.length && j < credores.length) {
    const valor = Math.min(-devedores[i].saldo, credores[j].saldo);
    acertos.push({ de: devedores[i].usuario_id, para: credores[j].usuario_id, valor: reais(valor) });
    devedores[i].saldo += valor;
    credores[j].saldo -= valor;
    if (devedores[i].saldo === 0) i += 1;
    if (credores[j].saldo === 0) j += 1;
  }

  const total = despesas.reduce((s, d) => s + centavos(d.valor), 0);

  return {
    total: reais(total),
    total_por_pessoa: membrosIds.length ? arredondar(reais(total) / membrosIds.length) : 0,
    saldos: emCentavos.map((s) => ({ ...s, pago: reais(s.pago), devido: reais(s.devido), saldo: reais(s.saldo) })),
    acertos
  };
};

module.exports = { rateioDe, calcularContas, arredondar };
