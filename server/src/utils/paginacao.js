/**
 * Paginação opcional das listas: ?pagina=1&limite=20.
 * Sem "limite" a lista vem inteira, como sempre veio (o site web não muda).
 * A resposta continua sendo o array; quem pede sabe que acabou quando a
 * página vem com menos itens que o limite.
 */
const LIMITE_MAXIMO = 50;

const paginacao = (query = {}) => {
  const limite = parseInt(query.limite, 10);
  if (!Number.isInteger(limite) || limite < 1) return {};

  const pagina = Math.max(parseInt(query.pagina, 10) || 1, 1);
  const limit = Math.min(limite, LIMITE_MAXIMO);
  return { limit, offset: (pagina - 1) * limit };
};

module.exports = { paginacao, LIMITE_MAXIMO };
