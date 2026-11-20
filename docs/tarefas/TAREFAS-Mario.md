# Tarefas — Mário Neto

**Frentes:** Destinos · Ranking · API, infraestrutura e build
**Prazo:** congelamento de escopo em **03/12** (depois disso, só correção) · entrega em **17/12**
**Referência visual:** https://planeja-prototipo.vercel.app/

> Fluxo de sempre: uma branch por item (`feat/...` ou `fix/...`), PR para a `main` e revisão de outra pessoa antes do merge.

> **Status em 19/11:** as seções 1, 2 e 3 foram feitas pela Maria na branch `feat/mario-ranking` (Ranking com países e cidades juntos, "poucas avaliações" no 1º lugar, cidades por país + cidade, escopo pelo país, telas de Ranking e Destinos do protótipo, `GET /usuarios/:id` restrito). Fica de propósito sem mudança o middleware `validate` (ver o comentário nele: aplicar o valor do Joi mudaria o dia das datas). **O que sobra para você é a seção 4 (entrega).**

---

## ⚠️ Antes de começar: mudança na navegação

O time decidiu seguir o protótipo, com **4 abas: Início · Roteiros · Dicas · Grupos**. Destinos vira um seletor dentro de Roteiros, e Ranking vira um seletor dentro de Dicas.

A Maria vai fazer essa mudança na branch `feat/abas-prototipo`. No mesmo PR ela:
- faz `DestinosScreen` e `RankingScreen` receberem a prop `seletor` e renderizarem `{seletor}` como primeiro filho;
- ajusta os sobretítulos;
- corrige o `navigate` do ranking para as dicas.

**Espere o merge dela antes de mexer em `DestinosScreen.js` e `RankingScreen.js`**, para não dar conflito. Os itens de API (seção 1) e de infra (seção 4) podem começar já.

---

## 1. Prioridade ALTA

### 1.1 Ranking: países e cidades ao mesmo tempo (RF-13, RF-14)
- [ ] `planeja/src/features/ranking/screens/RankingScreen.js:79, 96-110`:
  - remover o seletor Cidades/Países;
  - renderizar `ranking.paises` e depois `ranking.cidades`, um abaixo do outro, com os títulos de seção **"Países"** e **"Cidades"**.
- [ ] Nas cidades, a linha secundária mostra "País · N avaliações".

### 1.2 O 1º lugar não mostra "poucas avaliações"
- [ ] `planeja/src/features/ranking/components/ItemRanking.js:35-60`: o card do líder não mostra o aviso que as outras linhas mostram (linha 82). Incluir **"poucas avaliações"** quando `item.poucas_avaliacoes` for verdadeiro e atenuar a barra, como em `barraFraca`.
- [ ] Teste: uma avaliação única com nota 10 vai para o 1º lugar e precisa aparecer marcada.

### 1.3 Cidades com o mesmo nome se misturam
- [ ] `server/src/services/avaliacaoService.js:57-63`: para cidades, agrupar por **`pais_norm, cidade_norm`** em vez de só pela coluna da cidade. Hoje "Santiago" do Chile e "Santiago" da Espanha viram um item só.
- [ ] Corrigir o comentário da linha ~168: `max()` não devolve a "grafia mais comum".

---

## 2. Prioridade MÉDIA

### 2.1 O escopo vem do país (regra do escopo: "cidades herdam o país")
- [ ] `server/src/services/avaliacaoService.js:145`: calcular no servidor `escopo = norm(pais) === 'brasil' ? 'nacional' : 'internacional'` e parar de aceitar o valor vindo do app.
- [ ] Migration nova para corrigir as avaliações já salvas (`UPDATE ... SET escopo = CASE WHEN pais_norm = 'brasil' ...`). **Nunca rodar `db:reset`.**
- [ ] `AvaliacaoFormScreen.js:137-149`: esconder o campo de escopo.

### 2.2 Tela de Ranking igual ao protótipo
- [ ] Nacional/Internacional:
  - trocar `ranking/components/Segmentado.js` pelo `SeletorSegmentado` compartilhado;
  - ordem **Nacional | Internacional**, com Internacional marcado por padrão;
  - apagar `Segmentado.js` quando ninguém mais usar.
- [ ] `RankingScreen.js:72`: tirar o "+ Avaliar" do cabeçalho e pôr o botão **"+ Avaliar destino"** em largura total, logo abaixo do seletor Dicas | Ranking e antes do seletor Nacional | Internacional.
- [ ] `RankingScreen.js:107-109`: rodapé **"Toque em um destino para ver todas as dicas cadastradas sobre ele."** A legenda "Notas de 0 a 10…" pode ficar abaixo.

### 2.3 Formulário de avaliação
- [ ] `AvaliacaoFormScreen.js`:
  - botão **"Registrar avaliação"**;
  - dica abaixo da nota: **"0 = caro para o que oferece · 10 = vale cada centavo"**;
  - toast **"Avaliação registrada. Ranking atualizado."** depois de salvar (hoje não aparece nenhum).

### 2.4 Destinos
- [ ] Card (`DestinosScreen.js:93-103`): mostrar a **observação** num parágrafo e um rodapé **"Período"** com o período ou **"a definir"**.
- [ ] `DestinosScreen.js:67-77` e `DestinoFormScreen.js:97-109`: trocar as fileiras de `Button` por `SeletorSegmentado`, no filtro e no escopo.
- [ ] `DestinoFormScreen.js:111-119`:
  - rótulo **"Período pretendido"**;
  - dica **"Mês e ano, ou 'a definir'"**;
  - placeholder **"Abril 2026"**.
- [ ] Toasts com `useToast` (`DestinoFormScreen.js:43,66`): **"Destino cadastrado."**, **"Destino atualizado."** e **"Destino excluído."**

---

## 3. Prioridade BAIXA: textos para ficar igual ao protótipo

### Ranking
- [ ] `RankingScreen.js:89-92`: estado vazio **"Sem avaliações"** / **"Avalie um destino para começar o ranking."**
- [ ] `ItemRanking.js`:
  - posição em dois dígitos, **"01", "02"**…, com `String(posicao).padStart(2, '0')`;
  - abaixo do nome, "N avaliações", trocado por **"poucas avaliações"** quando for o caso;
  - a palavra **"média"** embaixo da nota.
- [ ] `RankingScreen.js:43`: trocar `Promise.all` por `Promise.allSettled`. Hoje uma falha em "Minhas avaliações" derruba o ranking inteiro.
- [ ] Remover os comentários que ainda falam em estrelas: `server/src/validators/avaliacaoValidator.js:3-5` e `server/src/models/AvaliacaoDestino.js:33-34`.

### Destinos
- [ ] `DestinosScreen.js:52-56`: trocar o "+ Novo" do cabeçalho por **"+ Novo destino"** em largura total, abaixo do seletor.
- [ ] `DestinosScreen.js:81-90`: estado vazio **"Nenhum destino aqui"** / **"Cadastre uma cidade para começar a planejar."**, com o botão **"+ Adicionar destino"**.
- [ ] `DestinoFormScreen.js:74-77`: sobretítulo **"Novo"** (ou **"Editar"**), título **"Destino"**.
- [ ] `DestinoFormScreen.js:121-130`: placeholder das observações **"O que você quer priorizar nesse destino"**.
- [ ] `DestinoFormScreen.js:133`: botão **"Cadastrar destino"**.

### API
- [ ] `server/src/middlewares/validate.js:2`: atribuir o valor validado (`req.body = value`), para os defaults e o `uppercase()` do Joi valerem.
- [ ] `server/src/routes/usuarioRoutes.js` (`GET /usuarios/:id`): hoje qualquer usuário logado lê o nome e o e-mail de qualquer outro. Restringir ao próprio usuário ou ao admin, ou tirar o e-mail da resposta.

---

## 4. Entrega: infra e build (começar já, sem depender de ninguém)

- [ ] **Publicar a API no Render** com o `render.yaml`. Preencher no painel:
  - `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` e as variáveis SMTP;
  - `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (secreta), para a API apagar as fotos excluídas do Storage.
  - Testar `GET /health`.
- [ ] Rodar as migrations no banco: `cd server && npm run db:migrate`. A do rateio (`20261119000001`) já foi aplicada em 19/11; falta a do escopo (`20261119000002`), que não altera nenhum dado de hoje.
- [x] ~~Criar `planeja/eas.json`~~ feito: perfis `preview` e `production` geram APK; `android.package` = `app.planeja.mobile` no `app.json`.
- [ ] **Gerar o APK de teste** (RNF-01), na pasta `planeja/`:
  1. `npm i -g eas-cli` e `eas login` (conta Expo do time);
  2. `eas init` (grava o `projectId` no `app.json`; commitar);
  3. criar as variáveis do perfil `preview` (não ficam no Git):
     - `eas env:create --environment preview --name EXPO_PUBLIC_API_URL --value https://<api-no-render>.onrender.com --visibility plaintext`
     - `eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value https://<projeto>.supabase.co --visibility plaintext`
     - `eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <anon-key> --visibility plaintext`
  4. `eas build -p android --profile preview` e instalar o APK num Android físico.
- [ ] Configurar no painel do Supabase o **limite de tamanho** do bucket `dicas` (ex.: 1 MB, igual à compressão do app, RNF-09).
- [ ] Gerar o **APK final** depois do congelamento (03/12), com tudo mergeado.
- [ ] Branches `origin/feat/destinos` e `origin/fix/db-ssl-opcional`: são as únicas fora da `main`.
  - Se `feat/destinos` foi substituída pela `feat/destinos-crud`, apagar.
  - Ver se o `DB_SSL=false` ainda é necessário; se for, abrir PR; se não, apagar.
- [ ] Criar a tag da versão de entrega na `main` (ex.: `v1.0.0`).

---

**Pronto quando:** a seção 1 estiver na `main` até 26/11, as seções 2 e 3 até 03/12, e o APK final instalado e testado até 10/12.
