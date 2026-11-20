# Como rodar o Planeja no computador e no iPhone

Guia do jeito que funcionou em 20/11/2026: API no computador, app no iPhone pelo **Expo Go**.

> Nenhuma senha ou chave fica neste arquivo. Elas ficam só nos `.env` (que não vão para o Git) e no seu gerenciador de senhas.

---

## Resumo rápido (quando já está tudo configurado)

1. Descobrir o IP do Wi-Fi (`ipconfig`) e conferir `EXPO_PUBLIC_API_URL` no `planeja/.env`.
2. **Terminal 1:** `cd server` → `npm run dev`
3. **Terminal 2:** `cd planeja` → `pnpm expo start -c` (com o token e o IP, veja o passo 4)
4. iPhone: câmera no QR code → login `maria@planeja.app` / `planeja123`

---

## 1. Uma vez só: o que precisa ter instalado

- **Node** (estou com a 24) e **pnpm** (`npm i -g pnpm`).
- **Expo Go** no iPhone (App Store). Não aceite atualizar a versão do `expo` no projeto: a SDK 58 está fixada para funcionar com o Expo Go da loja.
- Depois de cada `git pull` que mexa em dependências: `cd planeja` → `pnpm install` e `cd server` → `npm install`.

## 2. Uma vez só: os arquivos `.env`

Os dois arquivos ficam fora do Git. Se perder, copie do `.env.example` de cada pasta e preencha.

**`server/.env`**

| Variável | O que é | Onde pegar |
|---|---|---|
| `DATABASE_URL` | conexão com o banco | Supabase → Project Settings → Database (pooler, porta 5432) |
| `JWT_SECRET` | chave dos logins | qualquer texto longo (32+ caracteres) |
| `SUPABASE_URL` | endereço do projeto | Supabase → Project Settings → API. **Só** `https://<projeto>.supabase.co` — **sem** o `/rest/v1/` que o painel mostra |
| `SUPABASE_SERVICE_ROLE_KEY` | chave secreta do Storage (apaga fotos excluídas) | Supabase → API Keys → aba **Legacy** → `service_role` (começa com `eyJ`). **Secreta: só aqui** |
| `RATE_LIMIT_MAX` | opcional | o padrão já é 1000 |

**`planeja/.env`**

| Variável | O que é |
|---|---|
| `EXPO_PUBLIC_API_URL` | `http://<IP do Wi-Fi>:3000` — **muda a cada rede**, ver o passo 3 |
| `EXPO_PUBLIC_SUPABASE_URL` | a mesma URL do Supabase (sem `/rest/v1/`) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API Keys → aba **Legacy** → `anon` (pode ficar no app) |

Depois de mexer num `.env`, reinicie a API e o Expo (o Expo com `-c`).

## 3. Toda vez que mudar de rede: o IP

O celular acessa a API pelo IP do computador na rede. Em outra rede, o IP muda.

1. No terminal: `ipconfig`
2. Procure **"Adaptador de Rede sem Fio Wi-Fi" → Endereço IPv4** (em casa foi `192.168.1.6`).
   Ignore o **Radmin VPN** (26.x) e o **vEthernet** (172.x).
3. No `planeja/.env`: `EXPO_PUBLIC_API_URL=http://<esse IP>:3000`
4. O celular precisa estar **no mesmo Wi-Fi** que o computador.

## 4. Rodar

**Terminal 1 — API**
```
cd server
npm run dev
```
Se o Windows perguntar sobre o firewall: **Permitir em redes privadas**.

**Terminal 2 — App (PowerShell)**
```
cd planeja
$env:EXPO_TOKEN="<seu token>"; $env:REACT_NATIVE_PACKAGER_HOSTNAME="<IP do Wi-Fi>"; pnpm expo start -c
```
- `EXPO_TOKEN`: login da sua conta Expo no terminal (ver o passo 5).
- `REACT_NATIVE_PACKAGER_HOSTNAME`: força o QR code a usar o IP do Wi-Fi. Sem isso, por causa do Radmin VPN, o QR pode sair com o IP errado.
- `-c`: limpa o cache e relê o `.env`.

Se o terminal for Git Bash em vez de PowerShell:
`EXPO_TOKEN=<token> REACT_NATIVE_PACKAGER_HOSTNAME=<IP> pnpm expo start -c`

**No iPhone:** aponte a câmera para o QR code. O QR fica **acima** da linha "Using Expo Go"; role o terminal para cima ou maximize o painel. Sem QR: no Expo Go, "Enter URL manually" → `exp://<IP>:8081`.

**Login no app** (contas de exemplo do banco): `maria@planeja.app` / `planeja123` — também `mario@planeja.app` e `ana@planeja.app`, mesma senha.

## 5. O token da Expo (por que e como)

O Expo Go do iPhone está logado na conta **mafeh_x0x0**. Assim, ele só abre projetos servidos por um terminal logado na mesma conta. O `npx expo login` pelo navegador não funcionou (o site já estava logado e não devolveu o login para o terminal), então usamos um **token**:

1. expo.dev → seu nome (canto inferior esquerdo) → **Account settings** → **Access tokens** → **Create token**.
2. Copie e guarde no seu gerenciador de senhas. Ele só aparece uma vez. Não cole em chat nem em arquivo do projeto.
3. Use no comando do passo 4.

**Para não colar o token toda vez**, salve-o como variável do seu usuário do Windows (PowerShell, uma vez só):
```
[Environment]::SetEnvironmentVariable("EXPO_TOKEN", "<seu token>", "User")
```
Feche e abra o VS Code. A partir daí basta `$env:REACT_NATIVE_PACKAGER_HOSTNAME="<IP>"; pnpm expo start -c`.

Alternativa sem token: sair da conta no Expo Go do iPhone (ícone de perfil → Log out).

## 6. Banco de dados

- Mudou alguma migration (`server/src/database/migrations`)? `cd server` → `npm run db:migrate`.
- **Nunca** rode `npm run db:reset`: apaga o banco compartilhado do time.
- Em rede corporativa (como a do trabalho), a conexão com o banco pode cair com `ECONNRESET` porque a rede bloqueia o SSL do Postgres. Não use `DB_SSL=false` nessa rede (a senha do banco iria sem criptografia): rode o que for de banco de outra rede (casa ou 4G do celular).

## 7. Quando algo dá errado

| Sintoma | O que fazer |
|---|---|
| Terminal diz "signed in to Expo Go … but not signed in to Expo CLI" | Faltou o `EXPO_TOKEN` (passo 5) |
| QR code dá timeout no celular | Mesmo Wi-Fi? Conferir o IP (passo 3). Último recurso: `pnpm expo start -c --tunnel` |
| App abre, mas login dá erro de conexão | API parada, IP errado no `planeja/.env` ou firewall bloqueando a porta 3000 |
| "Muitas requisições, tente novamente mais tarde" | Reiniciar a API (Ctrl+C → `npm run dev`) zera a contagem |
| "Muitas tentativas de login, aguarde 15 minutos" | Proteção do login (20 a cada 15 min). Reiniciar a API também zera |
| Foto da dica não envia ("não está configurado") | Faltam as `EXPO_PUBLIC_SUPABASE_*` no `planeja/.env` |
| Foto excluída continua no bucket | Ver no terminal da API a linha `[storage]`. A URL pública pode seguir abrindo por alguns minutos por cache; a listagem do bucket é o que vale |
| Mudou o `.env` e nada mudou | Reiniciar a API e o Expo com `-c` |
| "An update for expo is available" | Ignorar. Não atualizar |
