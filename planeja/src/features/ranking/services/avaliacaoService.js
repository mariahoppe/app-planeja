import { get, post, del } from '../../../api/api';

// Os dois rankings sob o mesmo filtro: { escopo, paises: [...], cidades: [...] }.
// Cada item: { posicao, nome, pais, media, qtd, poucas_avaliacoes }.
export function ranking(escopo) {
  return get('/avaliacoes/ranking', { escopo });
}

// Avaliações da pessoa logada, da mais recente para a mais antiga.
export function minhas() {
  return get('/avaliacoes/minhas');
}

// Registra a nota de um destino. "dados": { cidade, pais, escopo, nota }.
// Se a pessoa já avaliou o mesmo destino, a API só atualiza a nota.
export function registrar(dados) {
  return post('/avaliacoes', dados);
}

// Exclui uma avaliação da pessoa.
export function excluir(id) {
  return del(`/avaliacoes/${id}`);
}
