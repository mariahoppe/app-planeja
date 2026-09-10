# MeuAppExpo — Blog mobile (Expo)

App de blog com **Atomic Design**, autenticação JWT e consumo da API
**desenvweb2026** (login, posts, respostas e seguir usuários).

## Requisitos

- Node.js **20.19+** (recomendado **22** — use `nvm use` se houver `.nvmrc`)
- Backend **desenvweb2026** em `http://localhost:8080`
- Expo Go no celular **ou** emulador Android / simulador iOS

## Configuração da API

A URL fica em `src/services/config.js`:

| Ambiente              | Host padrão              |
|-----------------------|--------------------------|
| iOS Simulator         | `http://localhost:8080`  |
| Android Emulator      | `http://10.0.2.2:8080`   |
| Dispositivo físico    | IP da sua máquina na LAN |

## Instalação

```bash
cd MeuAppExpo
nvm use          # se usar nvm
npm install
```

## Subir o backend desenvweb2026 (outro terminal)

```bash
cd desenvweb2026
cp .env.example .env   # se ainda não tiver
npm install
npm run db:migrate
npm run db:seed
npm start
```

(Postgres precisa estar rodando — ex. `docker compose up -d db` em `desenvolvimento-web`.)

A API deve responder em `http://localhost:8080`.

## Rodar com Metro separado

### Terminal 1 — Metro (Expo)

```bash
cd MeuAppExpo
npx expo start
```

### Terminal 2 — abrir o app

```bash
npx expo start --android
# ou
npx expo start --ios
```

Ou escaneie o QR code com o **Expo Go**.

### Fluxo resumido

1. Postgres
2. Backend: `npm start` em `desenvweb2026/`
3. Metro: `npx expo start` em `MeuAppExpo/`
4. App: Expo Go ou `--android` / `--ios`

## Contas de teste (seed)

| Login | Senha |
|-------|-------|
| `admin@localhost` | `admin123` |
| `ana@localhost` | `ana123` |
| `bruno@localhost` | `bruno123` |
| `carla@localhost` | `carla123` |

## Telas principais

| Tela       | Função                                      |
|------------|---------------------------------------------|
| Login      | `POST /blog/api/v1/rpc/login`               |
| Cadastro   | `POST /blog/api/v1/usuarios`                |
| Feed       | posts (`?feed=seguindo`) + publicar         |
| Postagem   | detalhe + respostas                         |
| Seguir     | listar usuários e seguir / deixar de seguir |

## Estrutura (Atomic Design)

```
src/
  components/   atoms → molecules → organisms → templates
  screens/
  services/     auth, api, postagem, resposta, usuario, storage
  theme/
  constants/    janela da FlatList
```

## Material de aula (nesta pasta)

| Arquivo | Tema |
|---------|------|
| `componentes_propriedade_estado.md` | Componentes, props e estado |
| `interface_layout_atomic.md` | Interface, layout e Atomic Design |
| `listas_renderizacao_desempenho.md` | Listas, renderização eficiente e desempenho |

## Problemas comuns

- **Network request failed**: `desenvweb2026` parado, IP errado no `config.js`, ou firewall.
- **Metro não sobe**: Node antigo — rode `nvm use` / Node 22.
- **401 no app**: faça login de novo; confira `SECRET` no `.env` do desenvweb2026.
