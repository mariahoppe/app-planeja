# Tarefas — Ana Vitória

**Frentes:** Interface e identidade visual · Atividades · Dicas · Conta (auth, perfil, Início)
**Prazo:** congelamento de escopo em **03/12** (depois disso, só correção) · entrega em **17/12**
**Referência visual:** https://planeja-prototipo.vercel.app/

> Fluxo de sempre: uma branch por item (`feat/...` ou `fix/...`), PR para a `main` e revisão de outra pessoa antes do merge.

> **Status em 19/11:** as seções 1, 2 e 3 foram feitas pela Maria nas branches `feat/barra-abas-prototipo` → `feat/ana-secao2` → `feat/ana-secao3`. Pendências de configuração: `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` no servidor (limpeza das fotos) e o limite de tamanho do bucket no painel do Supabase. **O que sobra para você é a seção 4 (ClickUp, vídeo e slides).**

---

## ⚠️ Antes de começar: mudança na navegação

O time decidiu seguir o protótipo, com **4 abas: Início · Roteiros · Dicas · Grupos**. Destinos vira um seletor dentro de Roteiros, e Ranking vira um seletor dentro de Dicas.

A Maria vai fazer essa mudança na branch `feat/abas-prototipo`. Ela mexe em `AbasNavigator.js`, `DicasScreen.js` (só para receber a prop `seletor`) e `InicioScreen.js:111`.

**Espere o merge dela antes de mexer nesses três arquivos.** A barra de abas (item 1.1) também vive no `AbasNavigator.js`, então vem logo depois do merge da Maria.

---

## 1. Prioridade ALTA: identidade visual (vale para o app inteiro)

### 1.1 Barra de abas igual ao protótipo
Depois do merge da Maria. Arquivos: `planeja/src/navigation/AbasNavigator.js` e `planeja/src/components/atoms/IconeAba.js`.

- [ ] **Formato:** pílula flutuante. Configurar o `tabBarStyle` com:
  - `position: 'absolute'`, `left: 12`, `right: 12`, `bottom: margens.bottom || 30`;
  - `borderRadius: 999`, `borderWidth: 1`, `borderColor: colors.linha`;
  - `padding: 6`, altura ≈ 58;
  - a sombra do protótipo: `0 8px 24px rgba(26,26,26,.14)` + `0 2px 6px rgba(26,26,26,.06)` (no Android, `elevation` equivalente).
- [ ] **Aba ativa:**
  - o fundo `acentoSuave` cobre o **botão inteiro** (ícone e rótulo), com `borderRadius: 999` e `minHeight: 46`;
  - tirar a pílula que hoje fica só atrás do ícone (`IconeAba.js:36-61`).
- [ ] **Rótulo:**
  - `fontSize 9.5`, `letterSpacing 0.38`;
  - aba inativa: `fonts.corpo`, cor `suave`;
  - aba ativa: `fonts.corpoForte`, cor `acento`.
- [ ] **Ícones:** SVG de 20px, `strokeWidth 1.6` fixo, com os caminhos do protótipo:
  - Início (casa): `M4 11.5 12 4l8 7.5M6 10v9h5v-6h2v6h5v-9`
  - Roteiros (caderno): `M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z` + `M9 9h6M9 13h6`
  - Dicas (pino de mapa): `M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z` + círculo `r=2.4` em (12,10)
  - Grupos (pessoas): círculo `r=3` em (8.5,8) + círculo `r=2.4` em (16.5,9) + `M3 20v-1.5A4.5 4.5 0 0 1 7.5 14h2A4.5 4.5 0 0 1 14 18.5V20M15 14.3a3.6 3.6 0 0 1 6 2.7V20`
  - Apagar os ícones de "destinos" e "ranking", que ficam sem uso.
- [ ] `components/templates/ScreenTemplate.js`:
  - `paddingBottom` do corpo ≈ **104**, para a barra flutuante não cobrir o fim das listas (hoje é `margens.bottom + 24`, linha 46);
  - `paddingTop` do cabeçalho = `margens.top` (hoje `+ 12`, linha 28);
  - `lineHeight` do título ≈ 30 (linha 98).

### 1.2 Tokens (`planeja/src/config/theme.js`)
- [ ] `acentoSuave`: `#F3E6DF` → **`#F3EBE4`**
- [ ] `okSuave`: `#EDF2E6` → **`#DFE8D6`**
- [ ] Acrescentar `aviso: '#8A6B1F'`, `avisoFundo: '#F1E9D2'` e `neutroFundo: '#E6E3DC'`.
- [ ] `radius`: `{ sm: 8, md: 10, lg: 12, xl: 14, painel: 18, etiqueta: 20, pilula: 999 }`. Os valores 6 e 16 não existem no protótipo.
- [ ] `spacing`: `{ margem: 18, intervalo: 11, ... }`. Hoje ninguém usa a escala.

---

## 2. Prioridade MÉDIA

### 2.1 Componentes compartilhados
- [ ] `components/atoms/Avatar.js`:
  - tamanho padrão **28**;
  - **duas iniciais** (nome e sobrenome, ex.: "MH");
  - abaixo de ~40px, fonte `corpoForte` 10px; Fraunces só no avatar grande (52).
- [ ] `components/molecules/ErrorMessage.js:21-33`: fundo `acentoSuave`, texto `acento`, **sem borda**, raio 8, padding 9×11, `fontSize 12`, peso 600.
- [ ] Criar o átomo **`Etiqueta`** (o `.tag` do protótipo): 9px, `letterSpacing 0.9`, peso 700, padding 4×8, raio 20, com os tipos `neutro` / `acento` / `ok` / `aviso`. Trocar as versões avulsas de `CartaoRoteiro.js:40-55` e das telas de Dicas. Avisar o time para usar nas outras telas.
- [ ] Criar **`TituloSecao`** (o `.sec-h`): 10px, peso 700, `letterSpacing 1.6`, maiúsculas, cor `tenue`.

### 2.2 Início (`features/inicio/screens/InicioScreen.js`)
Depois do merge da Maria.

- [ ] Usar o `ScreenTemplate` (hoje é a única tela sem ele, linhas 63-87):
  - sobretítulo **"Olá, {primeiro nome}"**;
  - título **"Início"**;
  - à direita, o avatar de 28 que abre o Perfil.
- [ ] Nova seção **"Atalhos"** com 4 cards:
  - **"Meus destinos"**, legenda "N cidades cadastradas" → `navigation.navigate('Roteiros', { aba: 'destinos' })`
  - **"Buscar dicas"**, legenda "Veja o que outros viajantes recomendam" → `navigation.navigate('Dicas', { aba: 'dicas' })`
  - **"Ranking custo-benefício"**, legenda "Países e cidades melhor avaliados" → `navigation.navigate('Dicas', { aba: 'ranking' })`
  - card do **grupo da próxima viagem**, legenda "N integrantes · despesas da viagem" → GrupoDetalhe (só aparece se a viagem tiver grupo)
- [ ] Trocar o `Secao` próprio (Fraunces 20, linhas 164 e 218) pelo `TituloSecao`.

### 2.3 Atividades
- [ ] `features/atividades/screens/AtividadeFormScreen.js:33-43,60`: pedir **confirmação** (`Alert`) antes de excluir, como Destino e Roteiro já fazem.
- [ ] Toasts: **"Atividade adicionada."**, **"Atividade atualizada."** e **"Atividade excluída."**

### 2.4 Dicas
- [ ] `features/dicas/screens/DicaDetalheScreen.js:106`: pedir **confirmação** antes de excluir. Toast **"Dica excluída."**
- [ ] **Fotos órfãs no Storage** (`server/src/services/dicaService.js:77-80,108-113`): ao remover uma foto ou excluir uma dica, apagar também o arquivo no bucket do Supabase. Isso precisa da chave de serviço numa variável de ambiente do servidor; combinar com o Mário para ela entrar no Render.
- [ ] Configurar no bucket um **limite de tamanho** por arquivo (ex.: 1 MB, igual à compressão do app, RNF-09) e documentar no README do servidor.

### 2.5 Conta
- [ ] **E-mail com maiúsculas** (`server/src/services/authService.js:19,34,55`):
  - normalizar com `email.trim().toLowerCase()` no cadastro, no login e no "esqueci a senha";
  - no app, aplicar o mesmo antes de enviar.
  - Hoje quem cadastrou "Maria@x.com" não consegue entrar com "maria@x.com".

---

## 3. Prioridade BAIXA

- [ ] `CadastroScreen.js:37-38`: toast **"Conta criada. Bem-vinda ao Planeja."**
- [ ] `CadastroScreen.js:52,63`: placeholders **"Maria Hoppe"** e **"voce@email.com"**.
- [ ] `AtividadeForm.js:61`: quando o roteiro não tem data de fim, a dica aparece como "01/12/2026 a —". Nesse caso, mostrar só "A partir de 01/12/2026".
- [ ] `atoms/Card.js:34-36`: ao tocar, fundo `#FDFCF9` e `scale 0.995`, no lugar de `opacity .85`.
- [ ] `contexts/ToastContext.js`: o toast fica atrás do `PainelInferior` aberto. Renderizar acima do `Modal` (no protótipo o toast fica sobre o painel).
- [ ] O overlay `rgba(26,26,26,.4)` está escrito direto em `PainelInferior.js:55` e `dicas/components/Fotos.js:203`. Criar o token `colors.sombraFundo`.

---

## 4. Documentação e apresentação (frente de organização)
- [ ] Atualizar o ClickUp com as tarefas destes três arquivos (um card por item, citando o RF).
- [ ] Roteiro do vídeo demonstrativo, seguindo o fluxo do escopo: login → destino → roteiro → atividades → dica com foto → ranking → dicas filtradas → grupo por código → despesa → acerto de contas.
- [ ] Slides da apresentação de 17/12.

---

**Pronto quando:** a seção 1 estiver na `main` até 26/11, as seções 2 e 3 até 03/12, e o vídeo gravado até 14/12 com o APK final.
