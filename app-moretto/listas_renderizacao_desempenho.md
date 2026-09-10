# Listas, renderização eficiente e desempenho de interface

Material de apoio para a aula de **Desenvolvimento para Dispositivos Móveis**.
Válido para **MeuAppExpo** e **MeuAppCLI** — a estrutura `src/` é a mesma;
só muda o runtime (Expo Go vs build nativo).

Complementa:

- `componentes_propriedade_estado.md` — o que é prop, estado e re-render
- `interface_layout_atomic.md` — layout, scroll e Atomic Design

Aqui o foco é **como listas longas são desenhadas sem travar a UI**.

---

## 1. O problema: a tela precisa parecer instantânea

No celular o usuário percebe atraso a partir de ~100 ms. Uma lista “ingênua”
faz o app parecer lento mesmo com API rápida:

```jsx
<ScrollView>
  {postagens.map(item => (
    <PostCard key={item.id} postagem={item} />
  ))}
</ScrollView>
```

Isso **monta todos os cards de uma vez** — 10 itens ok, 200 itens = dezenas
de `View`/`Text` na memória, JS ocupado e scroll com “engasgos”.

Três ideias resolvem isso no React Native:

| Ideia | O que faz | Onde no app |
|-------|-----------|-------------|
| **Virtualização** | Só monta o que está na tela (+ uma janela) | `FlatList` em `FeedList`, `UserList`, `PostDetailScreen` |
| **Render estável** | Evita recriar funções e re-pintar itens iguais | `useCallback`, `memo`, `extraData` |
| **Menos trabalho por toque** | Atualiza um item em vez de recarregar a lista | `UsersScreen` (seguir / deixar de seguir) |

```
┌─────────────────────────────────────────────┐
│  Tela (estado + navegação)                  │
│   callbacks estáveis (useCallback)          │
│  ┌───────────────────────────────────────┐  │
│  │ FlatList  ← virtualiza                │  │
│  │  renderItem estável                   │  │
│  │  ┌─────────┐ ┌─────────┐              │  │
│  │  │ memo    │ │ memo    │  só estes    │  │
│  │  │ PostCard│ │ PostCard│  na janela   │  │
│  │  └─────────┘ └─────────┘              │  │
│  └───────────────────────────────────────┘  │
│  constants/lista.js — janela e lotes        │
└─────────────────────────────────────────────┘
```

---

## 2. ScrollView + map versus FlatList

| | `ScrollView` + `.map()` | `FlatList` |
|---|-------------------------|------------|
| Quando usar | Poucos blocos: login, um formulário | Listas que **podem crescer** |
| O que monta | **Todos** os filhos | Só a **janela visível** |
| Chave (`key`) | Você coloca no JSX | `keyExtractor` |
| Extra | Simples de ler | `ListHeader`, vazio, pull-to-refresh |

**Regra prática deste projeto**

- Formulário de login → `ScrollView` (`CenteredTemplate`) — poucos campos
- Feed, usuários, respostas → `FlatList` — a lista pode ter dezenas de itens

`getItemLayout` **não** é usado aqui: posts e respostas têm **altura variável**
(texto curto ou longo). Essa prop só vale para linhas de tamanho fixo.

---

## 3. Anatomia da FlatList no blog

### 3.1 Feed — `organisms/FeedList.js`

```js
<FlatList
  data={postagens}
  keyExtractor={extrairChave}
  renderItem={renderItem}
  ListHeaderComponent={ListHeaderComponent}
  ListEmptyComponent={...}
  refreshing={refreshing}
  onRefresh={onRefresh}
  {...listaVirtualizada}
/>
```

Papéis:

| Prop | Função no app |
|------|----------------|
| `data` | Array em estado (`postagens` na `FeedScreen`) |
| `keyExtractor` | Identidade estável (`id` → string). Evita `key={index}` |
| `renderItem` | Como desenhar **um** item — função **memorizada** |
| `ListHeaderComponent` | Saudação + `NewPostForm` (rola junto com o feed) |
| `ListEmptyComponent` | Mensagem quando o array está vazio |
| `refreshing` / `onRefresh` | Pull-to-refresh nativo |

O spinner de primeira carga **não** fica dentro da lista: se ainda não há
dados, o organism devolve um `ActivityIndicator` em tela cheia.

### 3.2 Usuários — `organisms/UserList.js`

Igual ao feed, com um extra: `extraData={idCarregando}`.

A `FlatList` compara `data` por referência. O booleano “esta linha está
carregando” **não** está no objeto `usuario` — mora num estado à parte.
`extraData` avisa a lista: “mesmo se o array for o mesmo, pinte de novo
porque o spinner mudou”.

Com `memo` no `UserRow`, só a linha cujo `carregando` mudou re-renderiza.

### 3.3 Detalhe da postagem — de map para FlatList

Antes o detalhe fazia `respostas.map()` dentro de `ScrollView`. Funciona
com 3 respostas; com 80 a tela inteira monta de uma vez.

Agora `PostDetailScreen` usa `FlatList`:

- **Header** = card da postagem + dica + `ReplyForm`
- **`data`** = `respostas`
- **Item** = `ReplyItem` (memoizado)

O formulário continua no topo da rolagem (`ListHeaderComponent`), como o
“Publicar” do feed.

---

## 4. Por que a lista re-renderiza (e como parar o desperdício)

Todo `setState` na screen re-executa a função da tela. Se `renderItem` ou
`onPress` forem **funções novas** a cada vez, a `FlatList` trata cada card
como “sujo” e o `memo` não ajuda.

### 4.1 `renderItem` estável (`useCallback`)

**Ruim** (função anônima nova a cada render do organism):

```js
renderItem={({ item }) => (
  <PostCard postagem={item} onPress={() => onAbrir(item)} />
)}
```

**Bom** (referência estável enquanto `onAbrir` for o mesmo):

```js
const renderItem = useCallback(
  ({ item }) => <PostCard postagem={item} onPress={onAbrir} />,
  [onAbrir],
);
```

O `PostCard` chama `onPress(postagem)` por dentro. Assim **um** callback
serve para todos os itens — não precisamos de uma closure por card.

### 4.2 Callbacks estáveis na screen

`FeedScreen` memoriza:

- `handleAbrir` — navega para o detalhe
- `handleRefresh` — pull-to-refresh
- `handlePublicar` — cria post e recarrega o feed
- `cabecalho` (`useMemo`) — header da lista só muda se saudação / formulário mudarem

`UsersScreen` memoriza `handleToggle` e `handleRefresh`.

Sem isso, o `useCallback` do `FeedList` vê `onAbrir` novo e recria
`renderItem` — o ganho some.

### 4.3 `memo` nas molecules da lista

```js
export const PostCard = memo(function PostCard({ postagem, onPress, acoes }) {
  // ...
});
```

`React.memo` faz comparação rasa das props. O card **não** redesenha se
`postagem`, `onPress` e `acoes` forem as mesmas referências.

Aplicado em:

| Componente | Arquivo | Evita re-pintar quando… |
|------------|---------|-------------------------|
| `PostCard` | `molecules/PostCard.js` | o feed re-renderiza mas o post não mudou |
| `UserRow` | `molecules/UserRow.js` | só **outra** linha está com spinner |
| `ReplyItem` | `molecules/ReplyItem.js` | o formulário de resposta muda (`enviando` / `erro`) |

`memo` **não** substitui virtualização: 200 itens memoizados dentro de
`ScrollView` ainda ocupam memória. Os dois se complementam.

### 4.4 Atualização otimista (um item, não a lista toda)

Ao seguir alguém, o código antigo chamava `listarUsuarios()` de novo —
novo array, novos objetos, **todas** as linhas re-renderizam.

Agora, depois do sucesso da API, só o usuário tocado é copiado:

```js
setUsuarios(atual =>
  atual.map(u =>
    u.id === usuario.id ? { ...u, seguindo: !u.seguindo } : u,
  ),
);
```

As outras referências `usuario` permanecem iguais → `memo` no `UserRow`
pula o trabalho. A interface responde ao toque sem um round-trip extra
só para redesenhar a lista.

Pull-to-refresh continua buscando a lista completa no servidor.

---

## 5. Janela de virtualização (`constants/lista.js`)

A `FlatList` não desenha “só 1 tela”: ela mantém uma **janela** para o
scroll não “piscar” itens em branco.

```js
export const listaVirtualizada = {
  initialNumToRender: 8,
  maxToRenderPerBatch: 6,
  windowSize: 7,
  updateCellsBatchingPeriod: 50,
  removeClippedSubviews: true,
};
```

| Prop | Significado | Valor no app |
|------|-------------|--------------|
| `initialNumToRender` | Itens na **primeira** pintura | 8 — feed aparece rápido |
| `maxToRenderPerBatch` | Quantos entram **por lote** ao rolar | 6 — não trava o JS em um frame |
| `windowSize` | Telas de altura mantidas montadas (acima + visível + abaixo) | 7 |
| `updateCellsBatchingPeriod` | Espera (ms) entre lotes | 50 |
| `removeClippedSubviews` | Android: descarta views fora da tela (nativo) | `true` |

`windowSize: 21` (padrão da RN) é mais “liso” e mais pesado. `7` é um
meio-termo para cards médios. Se o scroll mostrar itens em branco,
**aumente** a janela; se a lista engasgar ao abrir, **diminua**
`initialNumToRender`.

`removeClippedSubviews` pode cortar sombras que vazam da célula. Os cards
deste app usam borda, não sombra — por isso está ligado.

Não use `getItemLayout` com altura chutada: posts longos quebrariam o
cálculo do scroll.

---

## 6. Desempenho de interface além da lista

Virtualizar não resolve tudo. No app também importa:

| Cuidado | Por quê | Neste projeto |
|---------|---------|---------------|
| Estado no **lugar certo** | Digitar no form não pode `setState` na screen | `NewPostForm` / `ReplyForm` guardam `texto` localmente |
| `StyleSheet.create` | Evita objeto de estilo novo a cada render | todos os componentes |
| Tokens no `theme` | Menos números mágicos; um lugar para mudar | `src/theme/index.js` |
| `ActivityIndicator` pontual | Feedback sem bloquear a lista | spinner da linha em `UserRow`, não da tela inteira ao seguir |
| `keyboardShouldPersistTaps` | Toque no card/botão com teclado aberto | listas com formulário no header |

O que **não** fazer em sala (e no código):

- `key={index}` — ao inserir/remover, o React reaproveita o card errado
- Colocar o array em `useState` e fazer `.push()` no mesmo array — a
  referência não muda e a lista pode não atualizar
- Buscar a API **dentro** de `renderItem`
- Imagens pesadas sem tamanho definido (não há no feed atual; quando
  houver, fixar `width`/`height` ou `style`)

---

## 7. Mapa de arquivos

```
listas_renderizacao_desempenho.md   ← este material
src/
  constants/
    lista.js              ← janela, lotes, keyExtractor
  components/
    molecules/
      PostCard.js         ← memo; onPress(postagem)
      UserRow.js          ← memo
      ReplyItem.js        ← memo
    organisms/
      FeedList.js         ← FlatList + renderItem estável
      UserList.js         ← FlatList + extraData
  screens/
    FeedScreen.js         ← callbacks / header memorizados
    UsersScreen.js        ← patch local ao seguir
    PostDetailScreen.js   ← FlatList (header = post + form)
```

---

## 8. Exercícios sugeridos para a aula

1. **Ver o custo:** no `FeedList`, troque temporariamente a `FlatList` por
   `ScrollView` + `postagens.map`. Publique vários posts (ou duplique o
   array no estado) e compare o scroll.
2. **Quebrar de propósito:** remova o `useCallback` de `renderItem` e o
   `memo` do `PostCard`. No React Native, ative o highlight de re-renders
   (ou um `console.count` no `PostCard`) e puxe o refresh — todos os
   cards piscam de novo.
3. **`extraData`:** em `UserList`, comente `extraData={idCarregando}` e
   siga alguém. O spinner da linha some ou atrasa? Por quê?
4. **Janela:** altere `windowSize` para `2` e role o feed rápido. Depois
   volte ao valor do material.
5. **Altura fixa (opcional):** crie uma lista de notificações com altura
   constante e implemente `getItemLayout`. Explique por que o feed **não**
   pode copiar isso.
6. **Próximo passo:** pesquisar `@shopify/flash-list` — mesma ideia de
   virtualização, reciclagem mais agressiva. Não fazer no projeto-base.

---

## 9. Relação com os outros materiais

| Arquivo | Foco |
|---------|------|
| `componentes_propriedade_estado.md` | Props, state, por que o componente re-renderiza |
| `interface_layout_atomic.md` | Visual, Flexbox, quando cabe `ScrollView` |
| `listas_renderizacao_desempenho.md` (este) | **Virtualização**, **memo**, **janela**, **patch local** |
| `README.md` | Como rodar Metro, backend e app |

---

## 10. Checklist para apresentação em sala

- [ ] Desenhar no quadro: `ScrollView` monta tudo × `FlatList` monta a janela
- [ ] Abrir `constants/lista.js` e explicar cada número
- [ ] Abrir `FeedList` — `keyExtractor`, `renderItem`, header, vazio, refresh
- [ ] Abrir `PostCard` — `memo` + `onPress(postagem)` (um callback para todos)
- [ ] Abrir `FeedScreen` — `useCallback` / `useMemo` alimentando a lista
- [ ] Abrir `UserList` — `extraData={idCarregando}`
- [ ] Abrir `UsersScreen` — `setUsuarios` com `.map` (só um objeto novo)
- [ ] Abrir `PostDetailScreen` — header da lista = post + formulário
- [ ] Reforçar: **CLI e Expo compartilham o mesmo `src/`** (exceto `storage.js`)
