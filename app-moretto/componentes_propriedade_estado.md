# Componentes, propriedades, estado e estrutura de projeto

Material de apoio alinhado aos apps **MeuAppCLI** e **MeuAppExpo**.
Os exemplos abaixo existem de fato no código deste repositório (caminhos
relativos a `src/`).

---

## 1. O que é um componente?

No React / React Native, um **componente** é uma função (ou classe) que
devolve uma interface: elementos nativos (`View`, `Text`, `Pressable`…) ou
outros componentes.

Neste projeto usamos **function components**:

```js
export function Button({ title, onPress }) {
  return (
    <Pressable onPress={onPress}>
      <Text>{title}</Text>
    </Pressable>
  );
}
```

Arquivo: `components/atoms/Button.js`

### Por que separar em componentes?

- Reutilizar a mesma UI em várias telas
- Isolar responsabilidade (um botão não sabe o que é “login”)
- Facilitar leitura e teste

### Hierarquia deste app (Atomic Design)

| Nível        | Pasta                        | Papel                                      | Exemplos no projeto                          |
|--------------|------------------------------|--------------------------------------------|---------------------------------------------|
| **Atom**     | `components/atoms/`          | Peça mínima, sem regra de negócio          | `Button`, `Input`, `Label`, `TextArea`      |
| **Molecule** | `components/molecules/`      | Junta atoms com um propósito               | `FormField`, `PostCard`, `UserRow`, `ReplyItem` |
| **Organism** | `components/organisms/`      | Seção completa (formulário, lista)         | `LoginForm`, `FeedList`, `NewPostForm`      |
| **Template** | `components/templates/`      | Esqueleto de tela (layout, sem dados)      | `CenteredTemplate`, `ScreenTemplate`        |
| **Screen**   | `screens/`                   | Tela real: dados, navegação, API           | `LoginScreen`, `FeedScreen`, `UsersScreen`  |

Fluxo típico:

```
Screen  →  Template / Organism  →  Molecule  →  Atom
```

Exemplo concreto no login:

```
LoginScreen
  └── CenteredTemplate
        └── LoginForm          (organism)
              ├── FormField    (molecule → Label + Input)
              ├── FormField
              └── Button       (atom)
```

Arquivos: `screens/LoginScreen.js`, `organisms/LoginForm.js`,
`molecules/FormField.js`, `atoms/Button.js`.

---

## 2. Propriedades (props)

**Props** são os dados (e funções) que o componente **pai** passa para o
**filho**. São somente leitura do ponto de vista do filho: ele não altera a
prop diretamente; no máximo avisa o pai (ex.: `onChangeText`, `onPress`).

### Exemplo 1 — atom com várias props

Em `Button.js`:

```js
export function Button({
  title,                 // texto
  onPress,               // callback (função)
  variante = 'primario', // valor padrão
  carregando = false,
  desabilitado = false,
  style,
}) { ... }
```

Uso na `LoginScreen`:

```jsx
<Button
  title="Criar conta"
  variante="secundario"
  onPress={() => navigation.navigate('Cadastro')}
/>
```

- `title` e `variante` → dados de apresentação
- `onPress` → comportamento definido pelo pai (navegação)

### Exemplo 2 — molecule repassando props (`...props`)

Em `FormField.js`:

```js
export function FormField({ label, erro = false, ...props }) {
  return (
    <View>
      <Label>{label}</Label>
      <Input erro={erro} {...props} />
    </View>
  );
}
```

O `LoginForm` passa props de `TextInput` sem o `FormField` precisar listar
todas:

```jsx
<FormField
  label="E-mail"
  placeholder="seu@email.com"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
/>
```

`value` e `onChangeText` são props “controladas”: o valor vem do estado do
pai; cada tecla chama `setEmail`.

### Exemplo 3 — props de callback (contrato entre camadas)

`LoginForm` **não** chama a API. Ele só recebe `onSubmit`:

```js
export function LoginForm({ onSubmit, carregando = false, erro = null }) {
  // ...
  <Button title="Entrar" onPress={() => onSubmit(email, senha)} />
}
```

A `LoginScreen` injeta a regra de negócio:

```jsx
<LoginForm onSubmit={handleLogin} carregando={carregando} erro={erro} />
```

Assim a prop `onSubmit` é o “contrato”: o organism devolve dados; a screen
decide o que fazer.

### Exemplo 4 — props de navegação

Telas do React Navigation recebem props automáticas:

```js
export function LoginScreen({ navigation }) {
  navigation.replace('Feed');
  navigation.navigate('Cadastro');
}
```

`FeedScreen`, `PostDetailScreen` e `UsersScreen` também usam `navigation`
(e `route` quando há parâmetros, ex. `{ id }` na postagem).

### Resumo props

| Tipo de prop     | Exemplo no projeto              | Quem define          |
|------------------|--------------------------------|----------------------|
| Dado             | `title`, `label`, `postagem`   | Pai                  |
| Estilo / variante| `variante="secundario"`        | Pai                  |
| Callback         | `onPress`, `onSubmit`, `onToggleSeguir` | Pai            |
| Estado derivado  | `carregando`, `erro`           | Pai (screen)         |
| Children         | conteúdo dentro do Template    | Pai                  |

---

## 3. Estado (state)

**Estado** é o dado que **pertence** ao componente e, quando muda, provoca
uma nova renderização. No React usamos o hook `useState`:

```js
const [email, setEmail] = useState('');
//      ^valor   ^função para atualizar   ^valor inicial
```

### Estado local do formulário (organism)

`LoginForm.js` guarda o que o usuário digita:

```js
const [email, setEmail] = useState('');
const [senha, setSenha] = useState('');

const podeEnviar =
  email.trim().length > 0 && senha.length > 0 && !carregando;
```

- Enquanto digita → `setEmail` / `setSenha` → UI atualiza
- `podeEnviar` **não** é estado: é valor derivado de props + state

`NewPostForm` e `ReplyForm` fazem o mesmo com `texto`.

### Estado da tela (screen) — fluxo assíncrono

`LoginScreen.js` controla sessão, loading e erro:

```js
const [verificandoSessao, setVerificandoSessao] = useState(true);
const [carregando, setCarregando] = useState(false);
const [erro, setErro] = useState(null);

async function handleLogin(email, senha) {
  setCarregando(true);
  setErro(null);
  try {
    await login(email, senha);
    navigation.replace('Feed');
  } catch (e) {
    setErro(e.message);
  } finally {
    setCarregando(false);
  }
}
```

Esse estado sobe para o formulário via **props**:

```jsx
<LoginForm onSubmit={handleLogin} carregando={carregando} erro={erro} />
```

### Estado de lista (dados da API)

`FeedScreen.js`:

```js
const [postagens, setPostagens] = useState([]);
const [carregando, setCarregando] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [publicando, setPublicando] = useState(false);
const [erroPost, setErroPost] = useState(null);
const [usuario, setUsuario] = useState(null);
```

Após `listarFeed()`:

```js
setPostagens(feed || []);
setUsuario(sessao);
```

`UsersScreen` guarda `usuarios` e `idCarregando` (qual linha está no
“Seguir…”).

`PostDetailScreen` guarda `postagem`, `respostas`, `enviando`, `erro`.

### Props vs estado — regra prática neste app

| Pergunta                                      | Use          | Onde no app                          |
|-----------------------------------------------|--------------|--------------------------------------|
| O valor vem de fora e o filho só exibe?       | **Prop**     | `Button title`, `PostCard postagem`  |
| O usuário digita / a tela busca da API?       | **Estado**   | `email` no LoginForm; `postagens` no Feed |
| Loading / erro da chamada HTTP?               | **Estado** na screen, **prop** no form | `carregando`, `erro`        |
| Preciso avisar o pai que algo mudou?          | Callback prop | `onSubmit`, `onToggleSeguir`       |

### Estado + efeitos (quando carregar dados)

Não é “estado”, mas anda junto:

- `useEffect` na `LoginScreen` → verifica token ao montar
- `useFocusEffect` na `FeedScreen` / `UsersScreen` → recarrega ao focar a tela
- `useCallback` → memoriza `carregar` (e os handlers das listas) para não recriar a cada render
- `React.memo` nos itens (`PostCard`, `UserRow`, `ReplyItem`) → o card não redesenha se as props forem as mesmas
- Detalhes de lista e desempenho: `listas_renderizacao_desempenho.md`

---

## 4. Estrutura de projeto

```
App.js                 → navegação (Stack); não desenha formulários
index.js               → registra o App no React Native / Expo

src/
  components/
    atoms/             → peças mínimas
    molecules/         → combinações pequenas
    organisms/         → blocos de tela
    templates/         → layouts reutilizáveis
  screens/             → telas conectadas à navegação e aos services
  services/            → HTTP, auth, storage (sem UI)
  theme/               → cores, espaçamentos, tipografia
  constants/           → ajustes de FlatList (janela, keyExtractor)
```

### Papel de cada pasta

#### `App.js`

Só monta o navegador e declara rotas:

- `Login`, `Cadastro`, `Feed`, `Postagem`, `Usuarios`
- Opções de header (`headerStyle`, títulos)

Não contém `useState` de formulário nem `fetch` — isso fica nas screens /
services.

#### `src/screens/`

Telas “inteligentes”:

1. Leem/escrevem **estado**
2. Chamam **services** (`auth`, `postagem`, `usuario`…)
3. Passam **props** para organisms/templates
4. Usam `navigation` / `route`

Exemplos: `LoginScreen.js`, `FeedScreen.js`, `PostDetailScreen.js`,
`UsersScreen.js`, `RegisterScreen.js`.

(Há também `HomeScreen`, `ProfileScreen`, `SettingsScreen` de aulas
anteriores; o fluxo atual do blog usa as telas listadas no `App.js`.)

#### `src/components/`

UI pura ou quase pura. Preferência:

- Atoms/molecules: só props e estilo
- Organisms: podem ter estado **local** de formulário (`email`, `texto`)
- Templates: recebem `children`, `titulo`, `cabecalho`, `rodape`

#### `src/services/`

Sem JSX. Responsabilidades:

| Arquivo        | Função                                      |
|----------------|---------------------------------------------|
| `config.js`    | URL base da API                             |
| `api.js`       | `fetch` + header `Authorization: Bearer`    |
| `auth.js`      | login, registro, sessão, logout             |
| `storage.js`   | token/usuário (SecureStore no Expo / AsyncStorage no CLI) |
| `postagem.js`  | listar feed, criar post                     |
| `resposta.js`  | listar/criar respostas                     |
| `usuario.js`   | listar usuários, seguir / deixar de seguir  |

A screen chama o service; o componente visual não conhece a URL da API.

#### `src/theme/`

Tokens visuais (`cores`, `espacamentos`, `raios`, `tipografia`) importados
pelos StyleSheets — evita “números mágicos” espalhados.

---

## 5. Um fluxo completo (do toque à API)

1. Usuário digita e-mail → **estado** `email` no `LoginForm`
2. Toca em “Entrar” → prop **`onSubmit(email, senha)`**
3. `LoginScreen.handleLogin` → **estado** `carregando = true`
4. `services/auth.login` → `apiRequest('/rpc/login')` → grava token no storage
5. Sucesso → `navigation.replace('Feed')`
6. `FeedScreen` → **estado** `postagens` preenchido via `listarFeed()`
7. `FeedList` / `PostCard` recebem cada item como **prop** `postagem`

Isso ilustra a divisão:

- **Estado** = o que muda com o tempo neste nível  
- **Props** = o que desce na árvore de componentes  
- **Services** = I/O (rede / disco)  
- **Estrutura de pastas** = onde cada tipo de código mora  

---

## 6. Diferença prática CLI × Expo (estrutura)

A organização `src/` (componentes, screens, services, theme) é **a mesma**.
O que muda:

| Aspecto        | MeuAppExpo              | MeuAppCLI                    |
|----------------|-------------------------|------------------------------|
| Entrada        | Expo (`expo start`)     | Metro + build nativo         |
| Storage        | `expo-secure-store`     | `@react-native-async-storage/async-storage` |
| Pastas nativas | Gerenciadas pelo Expo   | `android/` e `ios/` no repo  |

Componentes, props e estado funcionam igual nos dois.

---

## 7. Checklist rápido para a aula

- [ ] Apontar um **atom** e listar suas props (`Button`)
- [ ] Mostrar **estado local** no `LoginForm` (`email`, `senha`)
- [ ] Mostrar **estado da screen** + props para o form (`carregando`, `erro`)
- [ ] Seguir o caminho Screen → Organism → Molecule → Atom no login
- [ ] Abrir `FeedScreen` e explicar estado de lista vindo da API
- [ ] Abrir `services/auth.js` e reforçar: service não é componente
- [ ] Abrir `App.js` e mostrar onde a estrutura de navegação começa
- [ ] Encaminhar listas longas para `listas_renderizacao_desempenho.md`
