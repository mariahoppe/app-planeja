# Projeto base do professor

Esta pasta guarda o aplicativo apresentado pelo professor em aula. Ele serve como
**referência**: é dele que tiramos exemplos de navegação, estrutura de telas, chamadas
à API e padrões de código para construir o [Planeja](../planeja/).

> ⚠️ **Não editamos esta pasta.** Ela é uma cópia de consulta. Todo código nosso vai
> para `../planeja/`. Assim, quando quisermos comparar "como o professor fez" com
> "como fizemos", os dois estão lado a lado e intactos.

## Como colocar o projeto aqui

Ainda não subimos os arquivos. Quando tiver a pasta ou o `.zip` do professor:

1. Copie **o conteúdo** do projeto dele para dentro desta pasta — `App.js`,
   `package.json`, `app.json`, `src/` e o resto. Não copie a pasta inteira para dentro
   daqui (evite `base-professor/projeto-do-professor/App.js`); o `package.json` dele
   deve ficar direto em `base-professor/package.json`.
2. **Apague `node_modules/`, `.expo/`, `ios/` e `android/`** se vieram junto. São pastas
   geradas, pesam centenas de MB e o `.gitignore` já as ignora — não precisam ir para o
   GitHub.
3. Confira o que entrou e mande para o GitHub:

   ```bash
   git status                      # veja os arquivos que apareceram
   git add base-professor
   git commit -m "projeto base do professor"
   git push
   ```

## Como rodar o app do professor

Cada projeto do repositório tem suas próprias dependências, então instale as dele
**dentro desta pasta**:

```bash
cd base-professor
pnpm install     # ou: npm install
pnpm start       # ou: npx expo start
```

Se ele usar uma versão de Expo diferente da nossa, tudo bem — os dois projetos são
independentes e não se atrapalham.
