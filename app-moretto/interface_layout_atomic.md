# Interface, estilização, layout responsivo e Atomic Design

Material de apoio para a aula de **Desenvolvimento para Dispositivos Móveis**.
Válido para **MeuAppExpo** e **MeuAppCLI** — a estrutura `src/` é a mesma;
só muda o runtime (Expo Go vs build nativo).

Complementa o arquivo `componentes_propriedade_estado.md` (foco em props e
estado). Aqui o foco é **como a interface é construída, estilizada e
organizada**.

---

## 1. Visão geral: três camadas que trabalham juntas

| Camada | O que resolve | Onde no projeto |
|--------|---------------|-----------------|
| **Atomic Design** | Organização dos componentes (do menor ao maior) | `src/components/` + `src/screens/` |
| **Estilização** | Cores, tipografia, bordas, estados visuais | `src/theme/` + `StyleSheet` em cada componente |
| **Layout responsivo** | Adaptar à tela, teclado, notch, listas longas | `flex`, `SafeAreaView`, `ScrollView`, `FlatList`, templates |

```
┌─────────────────────────────────────────┐
│  Screen (dados + navegação)             │
│  ┌───────────────────────────────────┐  │
│  │ Template (esqueleto da tela)      │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │ Organism (formulário, lista)  │  │  │
│  │  │  Molecule → Atom            │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
│  theme: cores, espaçamentos, raios        │
└─────────────────────────────────────────┘
```

---

## 2. Atomic Design no app

Atomic Design (Brad Frost) divide a UI em níveis reutilizáveis. No blog
mobile usamos cinco níveis práticos:

### 2.1 Atoms — peças mínimas

**Pasta:** `src/components/atoms/`

São os blocos visuais mais simples. Não conhecem API, navegação nem regra de
negócio — só **aparência e interação básica**.

| Componente | Função visual | Arquivo |
|------------|---------------|---------|
| `Label` | Texto com variantes tipográficas | `atoms/Label.js` |
| `Input` | Campo de texto com foco e erro | `atoms/Input.js` |
| `TextArea` | Campo multilinha | `atoms/TextArea.js` |
| `Button` | Botão primário, secundário, perigo | `atoms/Button.js` |

**Exemplo — `Label` com variantes:**

```js
<Label variante="titulo">Blog</Label>
<Label variante="legenda">Entre para continuar</Label>
```

As variantes (`titulo`, `subtitulo`, `corpo`, `legenda`) centralizam
tamanho, peso e cor — evitam repetir `fontSize` e `color` em toda tela.

**Exemplo — `Input` com estado visual interno:**

O atom guarda apenas se o campo está **focado** (borda azul) ou em **erro**
(borda vermelha). Quem digita e valida continua sendo o organism/screen.

### 2.2 Molecules — combinação com propósito

**Pasta:** `src/components/molecules/`

Dois ou mais atoms (ou atom + lógica mínima de layout) formam uma unidade
reconhecível.

| Componente | Composição | Arquivo |
|------------|------------|---------|
| `FormField` | `Label` + `Input` | `molecules/FormField.js` |
| `ErrorMessage` | mensagem de erro estilizada | `molecules/ErrorMessage.js` |
| `PostCard` | `Label`s + card clicável | `molecules/PostCard.js` |
| `UserRow` | `Label`s + `Button` Seguir | `molecules/UserRow.js` |
| `ReplyItem` | bloco de resposta com borda lateral | `molecules/ReplyItem.js` |

**Exemplo — `PostCard`:**

- Superficie branca, borda, cantos arredondados (`raios.md`)
- Hierarquia: nome do autor (subtítulo) → login (legenda) → texto do post
- `Pressable` para toque sem misturar navegação dentro do card (a screen
  passa `onPress`)

### 2.3 Organisms — seções completas

**Pasta:** `src/components/organisms/`

Blocos de interface que o usuário entende como uma “parte” da tela: formulário
de login, lista do feed, formulário de nova postagem.

| Componente | Papel | Arquivo |
|------------|-------|---------|
| `LoginForm` | e-mail + senha + botão Entrar | `organisms/LoginForm.js` |
| `RegisterForm` | cadastro completo | `organisms/RegisterForm.js` |
| `NewPostForm` | publicar no feed | `organisms/NewPostForm.js` |
| `ReplyForm` | responder postagem | `organisms/ReplyForm.js` |
| `FeedList` | `FlatList` + `PostCard` + pull-to-refresh | `organisms/FeedList.js` |
| `UserList` | lista de usuários para seguir | `organisms/UserList.js` |

Organisms podem ter **estado local de formulário** (`email`, `senha`, `texto`),
mas não chamam a API diretamente — devolvem dados ao pai via props (`onSubmit`).

### 2.4 Templates — esqueleto de layout

**Pasta:** `src/components/templates/`

Definem **onde** os blocos ficam na tela, sem dados reais. São o lugar certo
para Safe Area, scroll, teclado e padding global.

| Template | Uso | Características |
|----------|-----|-----------------|
| `CenteredTemplate` | Login, Cadastro | Conteúdo centralizado, `KeyboardAvoidingView`, cabeçalho/rodapé opcionais |
| `ScreenTemplate` | Telas internas (legado) | Título + subtítulo + scroll + rodapé |

**Fluxo Login (Atomic completo):**

```
LoginScreen
  └── CenteredTemplate          ← layout + teclado + safe area
        ├── cabecalho (Label)   ← átomo
        ├── LoginForm           ← organism
        │     ├── FormField     ← molecule
        │     └── Button        ← atom
        └── rodapé (Button)
```

### 2.5 Screens — páginas do app

**Pasta:** `src/screens/`

Topo da hierarquia de UI: conectam organisms/templates à **navegação** e aos
**services** (`auth`, `postagem`, `usuario`).

| Tela | Organisms / layout principal |
|------|------------------------------|
| `LoginScreen` | `CenteredTemplate` + `LoginForm` |
| `RegisterScreen` | `CenteredTemplate` + `RegisterForm` |
| `FeedScreen` | `FeedList` + `NewPostForm` (header da lista) |
| `PostDetailScreen` | `FlatList`: header = `PostCard` + `ReplyForm`; itens = `ReplyItem` |
| `UsersScreen` | `UserList` |

**Regra de ouro:** quanto mais “baixo” na árvore, menos o componente sabe
sobre o app. Atoms não sabem de JWT; screens não desenham cada borda de input.

---

## 3. Interface e estilização

No React Native a estilização é feita com **`StyleSheet.create`** e objetos
JavaScript — não há CSS tradicional. O projeto centraliza tokens em
**`src/theme/index.js`**.

### 3.1 Design tokens (`theme/`)

```js
export const cores = {
  fundo: '#F5F7FA',
  superficie: '#FFFFFF',
  primaria: '#1E5AA8',
  perigo: '#C0392B',
  sucesso: '#1E8E5A',
  texto: '#1A2430',
  textoSecundario: '#5B6B7C',
  borda: '#D5DDE5',
  bordaFoco: '#1E5AA8',
};

export const espacamentos = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const raios = { sm: 6, md: 12, lg: 20 };
export const tipografia = { titulo: 28, subtitulo: 18, corpo: 16, legenda: 13 };
```

**Por que tokens?**

- Uma mudança de cor primária altera header, botões e bordas de foco juntos
- Espaçamentos consistentes (`md`, `lg`) entre cards, formulários e listas
- Evita “números mágicos” (`padding: 17`) espalhados no código

### 3.2 StyleSheet por componente

Cada atom/molecule/organism/template define estilos **locais** importando o
tema:

```js
const styles = StyleSheet.create({
  card: {
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.md,
  },
});
```

**Composição de estilos** (array) permite variantes e overrides:

```js
<Text style={[styles.texto, variante === 'secundario' && styles.textoSecundario]} />
<Pressable style={({ pressed }) => [styles.base, pressed && styles.pressionado]} />
```

### 3.3 Variantes visuais

| Padrão | Onde | Exemplo |
|--------|------|---------|
| Variante por prop | `Button`, `Label` | `variante="secundario"` |
| Estado booleano | `Input`, `FormField` | `erro={true}` → borda vermelha |
| Estado interno | `Input` | `focado` → borda azul |
| Override local | qualquer componente | `style={styles.botao}` no pai |

**`Button`** — três variantes visuais:

- `primario`: fundo azul, texto branco
- `secundario`: contorno azul, fundo transparente
- `perigo`: fundo vermelho (ex.: Sair)

Estados: `carregando` (spinner), `desabilitado` / `inativo` (opacidade).

### 3.4 Hierarquia visual (tipografia e cor)

Ordem de leitura nas telas do blog:

1. **Título** — `Label variante="titulo"` ou header da navegação
2. **Subtítulo / nome** — `variante="subtitulo"` (autor do post, nome na lista)
3. **Corpo** — texto do post, respostas
4. **Legenda** — login, dicas, mensagens secundárias (`textoSecundario`)

Cards (`PostCard`, `UserRow`) usam **superficie** branca sobre **fundo**
cinza claro — separação visual sem sombras pesadas.

### 3.5 Navegação e chrome global

Em `App.js` (Expo) ou equivalente no CLI, o **header** do stack navigator
usa o tema:

```js
const opcoesPadrao = {
  headerStyle: { backgroundColor: cores.primaria },
  headerTintColor: '#FFFFFF',
  contentStyle: { backgroundColor: cores.fundo },
};
```

`SafeAreaProvider` + `StatusBar` garantem contraste e área segura no topo.
Telas de login usam `headerShown: false` — o template cuida do layout.

### 3.6 Feedback visual

| Situação | Como aparece |
|----------|----------------|
| Carregando login | `Button carregando` + `ActivityIndicator` |
| Erro de formulário | `ErrorMessage` + borda vermelha nos campos |
| Lista vazia | texto centralizado em `FeedList` / `UserList` |
| Pull to refresh | `FlatList refreshing` + `onRefresh` |
| Splash de sessão | tela cheia com spinner (`LoginScreen`) |

---

## 4. Layout responsivo

Em mobile, “responsivo” não é só largura de browser: inclui **altura variável**,
**teclado**, **notch**, **listas longas** e **diferentes densidades de tela**.

### 4.1 Flexbox — base de tudo

React Native usa **Flexbox** por padrão (`flexDirection: 'column'`).

Padrões usados no projeto:

| Propriedade | Uso no app |
|-------------|------------|
| `flex: 1` | Tela ocupa altura inteira (`SafeAreaView`, containers) |
| `flexGrow: 1` | Conteúdo do scroll expande (`contentContainerStyle`) |
| `flexDirection: 'row'` | `UserRow`: nome à esquerda, botão à direita |
| `alignItems: 'center'` | Centralizar verticalmente em linhas |
| `justifyContent: 'center'` | Centralizar login no `CenteredTemplate` |
| `flex: 1` em filho de row | `UserRow` → área de texto ocupa espaço restante |

**Exemplo — `UserRow` responsivo à largura:**

```js
row: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.sm },
info: { flex: 1 },  // texto encolhe/expande; botão mantém tamanho
```

Em telas estreitas o nome quebra linha; o botão “Seguir” permanece visível.

### 4.2 Safe Area (notch, barra de status, home indicator)

```js
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={styles.safe} edges={['bottom']}>
```

- **`CenteredTemplate`**: safe area em todos os lados no login
- **`ScreenTemplate`**: `edges={['bottom']}` — header nativo já ocupa o topo
- **`App.js`**: `SafeAreaProvider` envolve toda a árvore

Sem isso, conteúdo pode ficar sob o notch (iPhone) ou gestos do sistema.

### 4.3 Scroll e conteúdo maior que a tela

| Componente | Quando usar |
|------------|-------------|
| `ScrollView` | Formulários e poucos blocos (login/cadastro) |
| `FlatList` | Feed, usuários e respostas — **virtualiza** itens (performance) |

**`CenteredTemplate`:**

- `ScrollView` + `flexGrow: 1` + `justifyContent: 'center'` → login
  centralizado em telas altas, rolável em telas baixas ou com teclado aberto
- `keyboardShouldPersistTaps="handled"` → toque no botão funciona com teclado aberto

**`FeedList`:**

- `contentContainerStyle` com padding — lista respira nas bordas
- `ListHeaderComponent` — formulário “Publicar” rola junto com os posts

### 4.4 Teclado (`KeyboardAvoidingView`)

No login/cadastro:

```js
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
```

- **iOS**: empurra conteúdo quando o teclado sobe
- **Android**: muitas vezes o sistema já redimensiona; `undefined` evita conflito

Combinado com `ScrollView`, o usuário consegue rolar até o botão “Entrar”.

### 4.5 Listas e telas cheias

`FeedScreen` usa **`flex: 1`** no container + **`FlatList`** no organism:

- Lista ocupa o espaço entre header e fim da tela
- Pull-to-refresh nativo (`refreshing` / `onRefresh`)
- Empty state quando não há posts

Isso escala melhor que mapear `postagens.map()` dentro de `ScrollView` com
muitos itens. Detalhes de janela, `memo` e callbacks: ver
`listas_renderizacao_desempenho.md`.

### 4.6 Largura e densidade

O app **não fixa largura em pixels** para simular desktop. Estratégias
adotadas:

- **Padding horizontal** via `espacamentos.lg` nos templates e listas
- **Largura 100%** implícita em filhos de coluna
- **Botões** com `minHeight: 52` (área de toque confortável)
- **Cards** com `marginBottom` entre itens, não altura fixa de tela

Para **dispositivo físico vs emulador**, o layout flex se adapta; o que muda
é a URL da API (`config.js`), não o CSS.

### 4.7 Platform-specific (quando necessário)

```js
import { Platform } from 'react-native';

behavior={Platform.OS === 'ios' ? 'padding' : undefined}
// config.js — host da API
Platform.select({ android: 'http://10.0.2.2:8080', ios: 'http://localhost:8080' })
```

Use `Platform` só para diferenças reais de SO — não para cada margem.

---

## 5. Mapa de arquivos (referência rápida)

```
src/
├── theme/
│   └── index.js              ← tokens: cores, espaços, raios, tipografia
├── constants/
│   └── lista.js              ← janela da FlatList (ver listas_renderizacao_desempenho.md)
├── components/
│   ├── atoms/                ← Label, Input, Button, TextArea
│   ├── molecules/            ← FormField, PostCard, UserRow, ReplyItem, ErrorMessage
│   ├── organisms/            ← LoginForm, FeedList, NewPostForm, UserList, ...
│   └── templates/            ← CenteredTemplate, ScreenTemplate
├── screens/                  ← LoginScreen, FeedScreen, PostDetailScreen, ...
└── services/                 ← sem UI (auth, api, postagem)
App.js                        ← navegação + tema do header + SafeAreaProvider
```

---

## 6. Exercícios sugeridos para a aula

1. **Atom:** criar `Badge` (texto pequeno com fundo `cores.sucesso`) e usar
   no `PostCard` para “novo”.
2. **Molecule:** extrair `StatRow` (ícone + label + valor) a partir de padrão
   repetido em uma tela.
3. **Organism:** adicionar `SearchBar` na tela `UsersScreen` (estado local +
   filtro na lista).
4. **Template:** criar `ListTemplate` com título fixo + `FlatList` em
   `children`.
5. **Estilização:** alterar `cores.primaria` no tema e observar header +
   botões + borda de foco mudando juntos.
6. **Layout:** testar login em emulador pequeno com teclado aberto — validar
   scroll e `KeyboardAvoidingView`.
7. **Atomic:** desenhar no quadro a árvore de `FeedScreen` até os atoms.

---

## 7. Relação com o outro material

| Arquivo | Foco |
|---------|------|
| `componentes_propriedade_estado.md` | Componentes, **props**, **state**, services, API |
| `interface_layout_atomic.md` (este) | **Visual**, **layout**, **Atomic Design** |
| `listas_renderizacao_desempenho.md` | **FlatList**, virtualização, `memo`, desempenho |
| `README.md` | Como rodar Metro, backend e app |

---

## 8. Checklist para apresentação em sala

- [ ] Abrir `src/theme/index.js` e explicar tokens
- [ ] Mostrar um **atom** (`Button`) — variantes e estados
- [ ] Mostrar uma **molecule** (`FormField`) — composição
- [ ] Mostrar um **organism** (`LoginForm`) — formulário completo
- [ ] Mostrar um **template** (`CenteredTemplate`) — safe area + teclado
- [ ] Abrir **screen** (`FeedScreen`) — onde layout encontra dados da API
- [ ] Demonstrar **FlatList** vs **ScrollView** no feed
- [ ] Encaminhar para `listas_renderizacao_desempenho.md` (janela, memo, extraData)
- [ ] Rotacionar emulador ou reduzir janela — flex + scroll absorvem a mudança
- [ ] Reforçar: **CLI e Expo compartilham a mesma árvore de componentes**
