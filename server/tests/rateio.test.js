const { rateioDe, calcularContas } = require('../src/services/rateio');

// Despesa com o rateio igual já gravado, como o despesaService faz no lançamento
const despesaIgual = (pagadorId, valor, participantes) => ({
  pagador_id: pagadorId,
  valor,
  modo_divisao: 'igual',
  rateios: Object.entries(rateioDe({ modo_divisao: 'igual', valor }, participantes))
    .map(([usuarioId, valorDevido]) => ({ usuario_id: Number(usuarioId), valor_devido: valorDevido }))
});

describe('rateioDe', () => {
  it('divide em centavos e dá a sobra para os primeiros', () => {
    expect(rateioDe({ modo_divisao: 'igual', valor: 380 }, [1, 2, 3])).toEqual({ 1: 126.67, 2: 126.67, 3: 126.66 });
  });
});

describe('calcularContas', () => {
  it('mantém nas contas quem saiu do grupo', () => {
    // A, B e C no grupo; C paga R$ 300 dividido igual; depois C sai
    const despesas = [despesaIgual(3, 300, [1, 2, 3])];
    const contas = calcularContas(despesas, [1, 2]);

    expect(contas.acertos).toEqual([
      { de: 1, para: 3, valor: 100 },
      { de: 2, para: 3, valor: 100 }
    ]);
    expect(contas.saldos.find((s) => s.usuario_id === 3)).toMatchObject({ saiu: true, saldo: 200 });
  });

  it('não cobra despesa antiga de quem entrou depois', () => {
    // A e B dividem R$ 100; depois D entra
    const despesas = [despesaIgual(1, 100, [1, 2])];
    const contas = calcularContas(despesas, [1, 2, 4]);

    expect(contas.saldos.find((s) => s.usuario_id === 4)).toMatchObject({ pago: 0, devido: 0, saldo: 0 });
    expect(contas.acertos).toEqual([{ de: 2, para: 1, valor: 50 }]);
  });

  it('não descarta um acerto de exatamente R$ 0,01', () => {
    // R$ 0,03 entre dois: 0,02 para o primeiro, 0,01 para o segundo
    const despesas = [despesaIgual(1, 0.03, [1, 2])];
    const contas = calcularContas(despesas, [1, 2]);

    expect(contas.acertos).toEqual([{ de: 2, para: 1, valor: 0.01 }]);
  });

  it('reproduz o exemplo do wireframe do escopo', () => {
    // Hotel 2.400 (Maria), jantar 380 (Mario), museu 210 (Ana), entre os três
    const despesas = [
      despesaIgual(1, 2400, [1, 2, 3]),
      despesaIgual(2, 380, [1, 2, 3]),
      despesaIgual(3, 210, [1, 2, 3])
    ];
    const contas = calcularContas(despesas, [1, 2, 3]);

    expect(contas.total).toBe(2990);
    const somaSaldos = contas.saldos.reduce((s, x) => s + Math.round(x.saldo * 100), 0);
    expect(somaSaldos).toBe(0);
    expect(contas.acertos.every((a) => a.para === 1)).toBe(true);
  });
});
