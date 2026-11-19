# Tarefas — Maria Hoppe

**Frentes:** Roteiros · Grupos e Despesas · Navegação
**Prazo:** congelamento de escopo em **03/12** (depois disso, só correção) · entrega em **17/12**
**Referência visual:** https://planeja-prototipo.vercel.app/

> Fluxo de sempre: uma branch por item (`feat/...` ou `fix/...`), PR para a `main` e revisão de outra pessoa antes do merge.

---

## 0. PRIMEIRO, porque destrava o time: 4 abas iguais ao protótipo

Branch `feat/abas-prototipo`. **Abra o PR o quanto antes.** O Mário e a Ana mexem nas mesmas telas e só devem começar os ajustes de cabeçalho depois desse merge.

Decisão do time: as abas passam a ser **Início · Roteiros · Dicas · Grupos**. Destinos fica dentro de Roteiros e Ranking fica dentro de Dicas, cada um num seletor no topo da tela.

- [ ] Criar `planeja/src/features/roteiros/screens/RoteirosTab.js`
  - Guarda o estado `aba` (`'roteiros'` | `'destinos'`). O valor inicial vem de `route.params?.aba ?? 'roteiros'`.
  - Atualiza `aba` com `useEffect(..., [route.params])` sempre que chegar `route.params.aba`.
  - Monta o seletor: `<SeletorSegmentado opcoes={[{ valor: 'roteiros', rotulo: 'Roteiros' }, { valor: 'destinos', rotulo: 'Destinos' }]} valor={aba} onChange={setAba} />`.
  - Renderiza `<RoteirosScreen navigation={navigation} route={route} seletor={seletor} />` ou `<DestinosScreen ... seletor={seletor} />`.
- [ ] Criar `planeja/src/features/dicas/screens/DicasTab.js` com o mesmo padrão: opções Dicas | Ranking, renderizando `DicasScreen` ou `RankingScreen`.
  - Repassar `route` para a `DicasScreen`, porque ela lê `route.params.filtro` (RF-16).
- [ ] Nas 4 telas (`RoteirosScreen`, `DestinosScreen`, `DicasScreen`, `RankingScreen`):
  - receber a prop `seletor` e renderizar `{seletor}` como **primeiro filho** dentro do `ScreenTemplate`. Só isso.
  - Cada tela continua com o próprio `ScreenTemplate`, para a paginação (`aoChegarNoFim`) seguir funcionando.
- [ ] Ajustar os sobretítulos e títulos dessas 4 telas para os do protótipo:
  - Roteiros: **Planejamento / Roteiros**
  - Destinos: **Cadastro / Destinos**
  - Dicas: **Comunidade / Dicas**
  - Ranking: **Custo-benefício / Ranking**
- [ ] `planeja/src/navigation/AbasNavigator.js`: deixar só 4 `Abas.Screen`.
  - `Roteiros` → `RoteirosTab`
  - `Dicas` → `DicasTab`
  - remover `Destinos` e `Ranking`
- [ ] Corrigir as navegações que apontavam para as abas removidas:
  - `features/inicio/screens/InicioScreen.js:111`: `navigation.navigate('Destinos')` → `navigation.navigate('Roteiros', { aba: 'destinos' })`
  - `features/ranking/screens/RankingScreen.js:62`: incluir `aba: 'dicas'` nos params → `navigation.navigate('Dicas', { aba: 'dicas', filtro: { ... } })`
- [ ] Rodar `grep -rn "navigate('Destinos'\|navigate('Ranking'" planeja/src` e confirmar que não sobrou nenhuma.
- [ ] Testar:
  - tocar num destino do ranking abre Dicas já filtrada;
  - o indicador "Destinos" do Início abre Roteiros na aba Destinos;
  - "carregar mais" continua funcionando nas 4 listas.
- [ ] Avisar o Mário e a Ana quando fizer o merge.

---

## 1. Prioridade ALTA: bugs que quebram o escopo

### 1.1 Rateio salvo também na divisão igual (RF-20, RF-23, RF-25)

Branch `fix/rateio-persistido`.

**O problema:** hoje, na divisão igual, o rateio é recalculado a cada leitura com os integrantes **atuais** (`server/src/services/rateio.js:29-38`), e os saldos só incluem quem está no grupo agora (`rateio.js:62`). Isso causa três erros:
- quando alguém sai, o crédito dessa pessoa some;
- o acerto pode aparecer como "Ninguém deve nada" mesmo com saldos negativos;
- quem entra depois passa a dever despesas antigas.

- [ ] `server/src/services/despesaService.js`: ao **criar e editar** uma despesa com `modo_divisao = 'igual'`, calcular a parte de cada um com `rateioDe(despesa, membrosAtuais)` e **gravar em `despesa_rateios`**, igual à divisão personalizada.
- [ ] `rateio.js` → `calcularContas`:
  - sempre usar `d.rateios`, sem recalcular a divisão igual;
  - os participantes passam a ser `membros atuais ∪ pagadores ∪ quem aparece nos rateios`.
- [ ] `server/src/services/grupoService.js:175-178`: o `nomePorId` hoje só conhece os membros atuais. Buscar também os usuários que já saíram, para o nome aparecer no saldo e no acerto.
- [ ] Migração de dados: criar os rateios das despesas "igual" que já existem, usando os membros atuais. Fazer uma migration nova, **nunca `db:reset`**.
- [ ] Trabalhar em **centavos inteiros** ou trocar `> CENTAVO` por `>= 0.005` em `rateio.js:69-70,77`. Hoje um saldo de exatamente R$ 0,01 é ignorado.
- [ ] App, `ResumoContas.js`: quem saiu aparece com "(saiu)" depois do nome.
- [ ] Teste manual: A, B e C no grupo; C paga R$ 300 em divisão igual; C sai.
  - Esperado: A → C R$ 100 e B → C R$ 100.
  - Se alguém entrar depois disso, essa pessoa **não** pode dever nada dessa despesa.

### 1.2 Editar despesa personalizada que inclui um ex-integrante

Mesma branch.

- [ ] `planeja/src/features/grupos/components/DespesaForm.js:40-47`: montar os campos com **membros atuais ∪ usuários que já estão no rateio da despesa**.
- [ ] `server/src/services/despesaService.js:36-39`: aceitar no rateio quem é membro atual **ou** quem já estava no rateio dessa despesa.

### 1.3 Integrante não vê a viagem do grupo nas listas (RF-19)

Branch `fix/roteiros-compartilhados`.

- [ ] `server/src/services/roteiroService.js:23-28`: hoje o `where: { usuario_id: userId }` no include do destino esconde os roteiros dos grupos.
  - Buscar antes os `roteiro_id` dos grupos de que o usuário participa (via `GrupoMembro` + `Grupo`).
  - Filtrar com `Op.or`: dono do destino **ou** `id` nessa lista.
  - Tirar o `where` de dentro do include.
- [ ] `server/src/services/dashboardService.js:9-15`: mesma correção, para a viagem compartilhada aparecer no Início em "Próxima viagem".
- [ ] Teste: entrar num grupo com outro usuário. O roteiro precisa aparecer em Roteiros (com `sou_dono = false`) e no Início.

---

## 2. Prioridade MÉDIA

### Roteiros
- [ ] **Excluir roteiro aberto pelo Grupo cai numa tela morta.** Em `RoteiroFormScreen.js:99`, o `navigation.pop(2)` volta para um GrupoDetalhe que já foi apagado em cascata. Trocar por `navigation.popToTop()`.
- [ ] **Seletor de destino ambíguo** (`RoteiroFormScreen.js:142-151`): mostrar **"cidade · país"**. Se a lista for grande, abrir num `PainelInferior` com a lista em vez de uma fileira de botões.
- [ ] Trocar as fileiras de `Button` por `SeletorSegmentado`:
  - filtro de status na lista (`RoteirosScreen.js:65-75`);
  - status no formulário (`RoteiroFormScreen.js:179-191`).

### Aba Despesas (`features/grupos`)
- [ ] `AbaDespesas.js:60-71`: mudar a ordem para **Totais → Lançamentos → Saldos → Acerto de contas**. O card "Sua situação" pode ficar logo depois dos Totais.
- [ ] `DespesaFormScreen.js:69-70`: sobretítulo **"Nova despesa"** (ou **"Editar"**) e título **"Lançar"**.

### Detalhe do grupo (`GrupoDetalheScreen.js`)
- [ ] Mover o código de convite e as ações Excluir/Sair da aba Viagem para a aba **Integrantes**.
  - Incluir o botão **"Convidar integrantes"**, que abre um `PainelInferior` "Código de convite" com o botão **"Copiar código"**.
  - Copiar com `expo-clipboard`, que precisa ser instalado com `npx expo install expo-clipboard`.
  - Toast **"Código copiado."**
- [ ] Aba Viagem:
  - adicionar a nota **"Todos os integrantes podem inserir e editar o roteiro, as atividades e as despesas desta viagem."**;
  - adicionar a seção **"Atividades recentes"**, com até 4 linhas no formato "Dia N · hora" e o custo (ou "grátis").

### RNF-04
- [ ] Paginar a lista de grupos e as despesas com `server/src/utils/paginacao.js` + `useListaPaginada`, como Destinos e Roteiros já fazem.

---

## 3. Prioridade BAIXA: textos e detalhes para ficar igual ao protótipo

### Lista de grupos
- [ ] `GruposScreen.js:55`: sobretítulo **"Colaborativo"**, título **"Grupos"**.
- [ ] `GruposScreen.js:63-64`: estado vazio **"Nenhum grupo"** / **"Crie um grupo para dividir o planejamento e as despesas de uma viagem."**
- [ ] `CartaoGrupo.js:29`: tag **"admin"** ou **"integrante"** em todo cartão.
- [ ] `CartaoGrupo.js:32-35`: rodapé **"N integrantes · N despesas"** e o total. A API já devolve `total_despesas`.
- [ ] `EntrarComCodigo.js:46-58`:
  - título da seção **"Entrar em um grupo"**;
  - placeholder **"Código de convite"**;
  - botão **"Entrar"**;
  - toasts **"Código não encontrado."**, **"Você já está nesse grupo."** e **"Você entrou em {nome}."**

### Criar grupo
- [ ] `GrupoFormScreen.js:86-104`:
  - campo **"Nome do grupo"**, placeholder **"Grupo 1"**;
  - campo **"Viagem vinculada"**, com a dica **"Todos os integrantes poderão editar esse roteiro"**.
- [ ] `GrupoFormScreen.js:69`: toast **"Grupo criado. Código de convite: {código}"**.

### Detalhe do grupo
- [ ] Sobretítulo = título do roteiro; título = nome do grupo.
- [ ] Abrir na aba **Despesas** (`GrupoDetalheScreen.js:40`). Com a aba Despesas ativa, mostrar **"+ Despesa"** no cabeçalho.
- [ ] `IntegranteItem.js`: **"Nome (você)"** + tag **"admin"**.
- [ ] Toasts: **"Integrante removido."**, **"Grupo excluído."**, **"Você saiu do grupo."**

### Aba Despesas
- [ ] `ResumoContas.js:35`: **"Por pessoa"**, com a legenda "N integrantes".
- [ ] `DespesaItem.js:17-31`:
  - avatar de quem pagou;
  - linha "12/04 · **pagou** Maria · divisão igual";
  - à direita, o valor e a categoria.
- [ ] `ResumoContas.js:53-59`: acerto como "Mario **→** Maria R$ 220", com os avatares.
- [ ] `ResumoContas.js:68,81,88`:
  - seção **"Saldos"**;
  - linha "pagou R$ X · deve R$ Y";
  - saldo com sinal **+ / −**.
- [ ] `ResumoContas.js:43`: **"Todo mundo está quite."**
- [ ] Nota abaixo do acerto: **"O acerto é recalculado a cada despesa lançada, editada ou excluída."**
- [ ] `AbaDespesas.js:53-54`: estado vazio **"Sem despesas"** / **"Registre o primeiro gasto da viagem."**

### Formulário de despesa
- [ ] `DespesaForm.js:106`: **"Valor total"**.
- [ ] `DespesaForm.js:97`: placeholder **"Jantar no bistrô"**.
- [ ] `despesas.js:14`: seletor **"Igual" / "Personalizada"**.
- [ ] `DespesaForm.js:38`: categoria padrão **alimentação**.
- [ ] `DespesaForm.js:192`: botão **"Registrar despesa"** (ou **"Salvar alterações"** ao editar).
- [ ] Toasts:
  - **"Despesa registrada. Saldos recalculados."**
  - **"Despesa atualizada. Saldos recalculados."**
  - **"Despesa excluída. Saldos recalculados."**

### Roteiros
- [ ] `RoteirosScreen.js:50-54`: trocar o "+ Novo" do cabeçalho por **"+ Novo roteiro"** em largura total, logo abaixo do seletor.
- [ ] `validacao.js:9`: rótulos do filtro **"Todos / Planejando / Confirmados"**. Se o status "concluída" continuar existindo, acrescentar **"Concluídos"**.
- [ ] `RoteirosScreen.js:83-87`: estado vazio **"Nenhum roteiro"** / **"Crie um roteiro a partir de um destino cadastrado."**
- [ ] `RoteiroFormScreen.js:111-114`: sobretítulo **"Novo"** (ou **"Editar"**), título **"Roteiro"**.
- [ ] `validacao.js:16-21`: mensagens **"Informe um título"**, **"Informe a data de início"** e **"Fim antes do início"**.
- [ ] Toasts: **"Roteiro criado."**, **"Roteiro atualizado."**, **"Roteiro excluído."**
- [ ] Detalhe do roteiro:
  - sobretítulo **"cidade · país"**;
  - card do grupo (`RoteiroDetalheScreen.js:98-106`) com a tag **"em grupo"**, os avatares e o rodapé **"Viagem compartilhada / ver despesas ›"**.
- [ ] `roteiroService.js:98-104`: ao encurtar as datas do roteiro, recusar a mudança (ou avisar) se alguma atividade ficar fora do novo período.

---

**Pronto quando:** os itens 0 e 1 estiverem na `main` até 26/11, e os itens 2 e 3 até 03/12.
