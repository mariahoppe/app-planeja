import { useCallback, useRef, useState } from 'react';

export const ITENS_POR_PAGINA = 20;

/**
 * Lista que vem da API em páginas (RNF-04): a primeira página ao abrir e as
 * seguintes quando a pessoa chega ao fim da tela.
 * buscarPagina(pagina, limite): devolve a promessa com o array daquela página.
 *   Mude a função (useCallback com os filtros) para recomeçar com outros filtros:
 *   a lista antiga some e o indicador de carregamento fica no lugar até a resposta.
 *
 * Devolve:
 * - itens: null enquanto a primeira página carrega; depois, tudo o que já veio.
 * - erro: mensagem da primeira página (as seguintes só desligam o "carregar mais").
 * - temMais / carregandoMais: para o rodapé da lista.
 * - recarregar(): volta para a primeira página (ex.: ao voltar para a tela).
 * - carregarMais(): pede a próxima página, se houver.
 */
export function useListaPaginada(buscarPagina) {
  const [itens, setItens] = useState(null);
  const [erro, setErro] = useState(null);
  const [temMais, setTemMais] = useState(false);
  const [carregandoMais, setCarregandoMais] = useState(false);

  const pagina = useRef(1);
  const pedido = useRef(0); // uma resposta antiga não pode sobrescrever uma nova
  const ocupado = useRef(false);
  const fonte = useRef(null); // a buscarPagina da lista que está na tela

  const recarregar = useCallback(
    async ({ limpar = false } = {}) => {
      const numero = ++pedido.current;
      const outrosFiltros = fonte.current !== buscarPagina;
      fonte.current = buscarPagina;
      if (limpar || outrosFiltros) setItens(null);
      try {
        setErro(null);
        const lista = (await buscarPagina(1, ITENS_POR_PAGINA)) || [];
        if (numero !== pedido.current) return;
        pagina.current = 1;
        setItens(lista);
        setTemMais(lista.length === ITENS_POR_PAGINA);
      } catch (e) {
        if (numero === pedido.current) setErro(e.message);
      }
    },
    [buscarPagina]
  );

  const carregarMais = useCallback(async () => {
    if (!temMais || ocupado.current) return;
    ocupado.current = true;
    const numero = pedido.current;
    setCarregandoMais(true);
    try {
      const proxima = pagina.current + 1;
      const lista = (await buscarPagina(proxima, ITENS_POR_PAGINA)) || [];
      if (numero !== pedido.current) return;
      pagina.current = proxima;
      // Se algo foi criado nesse meio-tempo, a página desliza: não repete itens.
      setItens((atuais) => {
        const vistos = new Set((atuais || []).map((i) => i.id));
        return [...(atuais || []), ...lista.filter((i) => !vistos.has(i.id))];
      });
      setTemMais(lista.length === ITENS_POR_PAGINA);
    } catch {
      setTemMais(false);
    } finally {
      ocupado.current = false;
      setCarregandoMais(false);
    }
  }, [buscarPagina, temMais]);

  return { itens, erro, temMais, carregandoMais, recarregar, carregarMais };
}
