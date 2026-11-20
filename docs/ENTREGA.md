# Entrega e apresentação · semana de 23/11/2026

O código das três listas (`docs/tarefas/TAREFAS-*.md`) está todo na `main`. O que falta é **publicar, gerar o APK, testar em aparelho e preparar a apresentação**. Plano considerando a apresentação até **sexta, 27/11** — ajustar os dias se a data for outra.

> Regra da semana: depois de **terça à noite**, só correção de bug. Nada de funcionalidade nova.

---

## 1. Plano por dia

### Segunda 23/11 — publicar e gerar o APK de teste
- [ ] **Mário** · Publicar a API no Render (`render.yaml`), com `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, SMTP, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Testar `https://<api>.onrender.com/health`.
- [ ] **Mário** · `eas init`, os 3 `eas env:create` (URL da API do Render + Supabase) e `eas build -p android --profile preview`. Passos exatos no `TAREFAS-Mario.md`, seção 4. A fila do EAS gratuito pode levar de 15 a 40 min: disparar cedo.
- [ ] **Mário** · Instalar o APK num **Android físico** (RNF-01) e mandar o link do build no grupo.
- [ ] **Todos** · `git pull` + `pnpm install` + rodar no próprio celular (guia: `docs/COMO-RODAR.md`).

### Terça 24/11 — testar tudo e corrigir
- [ ] **Todos** · Rodar o **roteiro de teste** (seção 3) no APK (Android) e no Expo Go (iPhone). Anotar cada problema no grupo com print e tela.
- [ ] **Maria** · Corrigir os bugs encontrados (prioridade: o que aparece no roteiro da apresentação).
- [ ] **Ana** · Primeira versão dos **slides** e do **roteiro do vídeo**.
- [ ] **Fim do dia: congelamento.** Daqui pra frente, só correção.

### Quarta 25/11 — versão final
- [ ] **Mário** · Build final: `eas build -p android --profile production` com a `main` congelada. Instalar e conferir.
- [ ] **Maria** · Criar a tag `v1.0.0` na `main` (`git tag v1.0.0` + `git push origin v1.0.0`) e uma *Release* no GitHub com o APK anexado.
- [ ] **Maria** · Atualizar o `README.md`: link do APK/Release, link da API publicada e contas de teste.
- [ ] **Ana** · Gravar o **vídeo demonstrativo** com o APK final, seguindo o roteiro da seção 3.
- [ ] **Ana** · Atualizar o **ClickUp**: tarefas concluídas, citando os RFs.

### Quinta 26/11 — ensaio
- [ ] **Todos** · Ensaiar a apresentação com o app no celular (quem fala o quê, ver seção 4).
- [ ] **Todos** · Revisar os slides e conferir que o vídeo abre no computador da sala.

### Dia da apresentação
- [ ] **Uns 5 minutos antes**, abrir a API do Render no navegador (`/health`): o plano gratuito "dorme" e a primeira requisição pode levar ~50 s.
- [ ] Celular com o APK instalado, carregado e com o login feito. Ter o **vídeo como plano B** se a rede da sala falhar.

---

## 2. Checklist do que entregar

- [ ] APK final (Release `v1.0.0` no GitHub)
- [ ] API publicada no Render
- [ ] Vídeo demonstrativo
- [ ] Slides
- [ ] Repositório: `main` estável, tag `v1.0.0`, README com links e contas de teste
- [ ] ClickUp atualizado

---

## 3. Roteiro de teste (e da demonstração)

Segue o fluxo do escopo ("do ranking à dica"). Usar `maria@planeja.app` / `planeja123`, e `ana@planeja.app` para o grupo.

1. **Conta** — criar conta nova (RF-01), sair, entrar (RF-02), "Esqueci a senha" com o código por e-mail (RF-03), editar nome e foto no Perfil (RF-04).
2. **Destinos** — Roteiros › Destinos › "+ Novo destino" (RF-05).
3. **Roteiro** — "+ Novo roteiro" com o destino, datas e status (RF-06).
4. **Atividades** — no roteiro, "+ Nova", marcar como feita (RF-07).
5. **Dica com foto** — Dicas › "+ Publicar dica", foto pela câmera ou galeria (RF-08, RF-09). Buscar "Paris" (RF-10). Editar e excluir a própria (RF-11).
6. **Ranking** — Dicas › Ranking › "+ Avaliar destino" (RF-12). Países e Cidades juntos (RF-13, RF-14), trocar Nacional/Internacional (RF-15), tocar num destino → abre as dicas dele (RF-16).
7. **Grupo** — Grupos › "+ Criar" vinculado ao roteiro (RF-17), copiar o código, entrar com a conta da Ana pelo código (RF-18). Com a Ana, ver e editar o roteiro do grupo (RF-19). Renomear, remover integrante (RF-20).
8. **Despesas** — "+ Despesa" igual e personalizada (RF-21, RF-22), ver Saldos e Acerto de contas (RF-23), Total da viagem (RF-24), editar e excluir uma (RF-25).

---

## 4. Rastreabilidade: requisito → onde está no app

Útil para os slides: cada RF do escopo e a tela que o atende.

| RF | Requisito | Onde |
|---|---|---|
| RF-01 | Cadastro | Login › Criar conta |
| RF-02 | Login e sessão no aparelho | Login (token no SecureStore) |
| RF-03 | Recuperação de senha | Login › Esqueci a senha (código por e-mail) |
| RF-04 | Meu perfil (dados, foto, senha, sair) | Início › avatar › Perfil |
| RF-05 | CRUD de destinos | Roteiros › Destinos |
| RF-06 | CRUD de roteiros | Roteiros › Roteiros |
| RF-07 | CRUD de atividades | Detalhe do roteiro › Atividades |
| RF-08 | Publicar dica (4 blocos) | Dicas › + Publicar dica |
| RF-09 | Fotos pela câmera/galeria | Formulário da dica |
| RF-10 | Buscar dicas por destino (sem acento) | Dicas › busca |
| RF-11 | Editar/excluir as próprias dicas | Detalhe da dica |
| RF-12 | Avaliar destino (1 por usuário, editável) | Ranking › + Avaliar destino / Minhas avaliações |
| RF-13 | Ranking de países | Dicas › Ranking › Países |
| RF-14 | Ranking de cidades | Dicas › Ranking › Cidades |
| RF-15 | Filtro nacional/internacional | Ranking › seletor (escopo vem do país) |
| RF-16 | Ranking → dicas do destino | Tocar num item do ranking |
| RF-17 | Criar grupo vinculado à viagem | Grupos › + Criar |
| RF-18 | Convite por código | Grupo › Integrantes › Convidar / Grupos › Entrar em um grupo |
| RF-19 | Acesso compartilhado à viagem | Integrante vê e edita o roteiro e as atividades |
| RF-20 | Administrar grupo | Grupo › Editar / Integrantes (remover, sair, excluir) |
| RF-21 | Registrar despesa | Grupo › + Despesa |
| RF-22 | Divisão igual ou personalizada | Formulário da despesa |
| RF-23 | Acerto de contas | Grupo › Despesas › Acerto de contas |
| RF-24 | Total da viagem e por pessoa | Grupo › Despesas › totais e saldos |
| RF-25 | Editar/excluir despesa, recálculo | Tocar num lançamento |

**RNFs para citar:** paginação nas listas (RNF-04), token no armazenamento seguro (RNF-05), "Tentar de novo" em erro de rede (RNF-06), carregamento e estados vazios (RNF-07), identidade visual do protótipo (RNF-08), fotos comprimidas até 1 MB (RNF-09), código por domínio e componentes reutilizáveis (RNF-10), branch por funcionalidade e PRs (RNF-11).

---

## 5. Riscos e plano B

| Risco | Plano B |
|---|---|
| Render "dormindo" na hora | Abrir `/health` 5 min antes |
| Wi-Fi da sala bloqueia algo | O APK usa a API publicada (HTTPS), não o computador; vídeo como reserva |
| Build do EAS demorar | Disparar segunda de manhã; o de quarta é só se houve correção |
| Bug descoberto na quarta | Só corrigir se estiver no roteiro da demonstração; o resto vira "próximos passos" nos slides |
