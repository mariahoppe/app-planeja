<div align="center">

# 🧭 Planeja · Repositório da disciplina

**Dois projetos lado a lado: o app que estamos construindo e o app base do professor,
usado como referência.**

Disciplina de **Desenvolvimento de Dispositivos Móveis** — 6º semestre de Sistemas de Informação

</div>

---

## O que tem aqui

| Pasta | O que é | Mexemos? |
| --- | --- | --- |
| [`planeja/`](./planeja/) | **Nosso app.** O Planeja Mobile, em React Native + Expo. É aqui que todo o nosso código vive. | ✅ Sim |
| [`base-professor/`](./base-professor/) | **App base do professor**, apresentado em aula. Serve de referência para navegação, telas e chamadas à API. | ❌ Não — só consulta |
| [`docs/`](./docs/) | Documento de escopo do Planeja (PDF). | — |

As duas pastas são **projetos Expo independentes**: cada uma tem seu próprio
`package.json` e suas próprias dependências. Instalar ou rodar um não afeta o outro.

```
app-planeja/
├─ README.md            ← você está aqui
├─ docs/                 documento de escopo
├─ planeja/             ← NOSSO app  (cd planeja && pnpm start)
│  ├─ App.js
│  ├─ package.json
│  └─ src/
│     ├─ api/  config/  navigation/  contexts/  components/  hooks/  utils/
│     └─ features/       destinos · roteiros · atividades · dicas · ranking · grupos · auth
└─ base-professor/      ← app do professor (referência)
```

## Como rodar

Escolha o projeto e trabalhe **de dentro da pasta dele** — os comandos do Expo precisam
enxergar o `package.json` correto.

```bash
# nosso app
cd planeja
pnpm install
pnpm start

# app do professor
cd base-professor
pnpm install
pnpm start
```

Leia o QR Code com o **Expo Go** no celular
([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) ·
[iOS](https://apps.apple.com/app/expo-go/id982107779)).

> **Atenção à versão do Expo.** O Planeja usa **SDK 54**, que é o que o Expo Go
> publicado nas lojas suporta hoje. Subir de SDK sem que o Expo Go acompanhe faz o QR
> Code falhar com *"Project is incompatible with this version of Expo Go"*.

## Como usar o projeto do professor de base

A ideia de manter os dois no mesmo repositório é poder abrir o código dele e o nosso ao
mesmo tempo, no mesmo VS Code:

1. Achou um trecho útil no app dele (uma tela, um serviço, a configuração de navegação)?
2. **Copie para `planeja/`** e adapte para o nosso domínio — nossos nomes, nosso tema
   (`planeja/src/config/theme.js`), nossa estrutura por funcionalidade.
3. Nunca edite `base-professor/`. Ele fica intacto para continuar servindo de consulta e
   para conseguirmos mostrar o que mudamos em relação à base.

## Equipe

| Integrante | Responsável por |
| --- | --- |
| **Maria Hoppe** | Roteiros · Grupos e despesas · Arquitetura e navegação |
| **Mario Neto** | Destinos · Ranking · API e infraestrutura |
| **Ana Vitória** | Atividades · Dicas · Interface e imagens |

---

<div align="center">
<sub>Detalhes do nosso app em <a href="./planeja/README.md"><code>planeja/README.md</code></a> · Entrega: 17 de dezembro de 2026</sub>
</div>
