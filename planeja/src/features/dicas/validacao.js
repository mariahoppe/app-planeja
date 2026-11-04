// Regras do formulário de dica, espelhando o dicaValidator da API.

// Os quatro blocos de conteúdo, na ordem do protótipo. "chave" é o nome do campo na API.
export const BLOCOS = [
  { chave: 'onde_comer', rotulo: 'Onde comer', placeholder: 'Restaurantes, mercados, o que vale o preço' },
  { chave: 'o_que_fazer', rotulo: 'O que fazer', placeholder: 'Passeios, caminhadas, feiras' },
  { chave: 'onde_visitar', rotulo: 'Onde visitar', placeholder: 'Museus, pontos turísticos e o melhor horário' },
  { chave: 'onde_ficar', rotulo: 'Onde ficar', placeholder: 'Bairros e hospedagem' },
];

// O banco aceita até 4 fotos em cada bloco (CHECK + UNIQUE em dica_fotos).
export const MAX_FOTOS_POR_BLOCO = 4;

// Devolve um objeto de erros por campo ({} = tudo certo).
// "dica": { cidade, pais, onde_comer, o_que_fazer, onde_visitar, onde_ficar }.
export function validarDica(dica) {
  const e = {};
  const cidade = dica.cidade.trim();
  const pais = dica.pais.trim();

  if (!cidade) e.cidade = 'Informe a cidade';
  else if (cidade.length > 80) e.cidade = 'Cidade deve ter no máximo 80 caracteres';

  if (!pais) e.pais = 'Informe o país';
  else if (pais.length > 60) e.pais = 'País deve ter no máximo 60 caracteres';

  if (!BLOCOS.some((b) => (dica[b.chave] ?? '').trim())) {
    e.blocos = 'Preencha pelo menos um dos quatro blocos';
  }

  return e;
}
