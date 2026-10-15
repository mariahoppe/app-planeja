<div align="center">

# 🧭 Planeja · Repositório da disciplina

**O app Planeja Mobile e a API que ele consome.**

Disciplina de **Desenvolvimento de Dispositivos Móveis** — 6º semestre de Sistemas de Informação

</div>

---

## O que tem aqui

| Pasta | O que é |
| --- | --- |
| [`planeja/`](./planeja/) | **Nosso app.** O Planeja Mobile, em React Native + Expo. |
| [`server/`](./server/) | **API do Planeja**, em Node + Express + Sequelize. |
| [`app-moretto/`](./app-moretto/) | **App do professor**, apresentado em aula. Referência para componentes, telas, navegação e chamadas à API. Só consulta — não editamos. |
| [`docs/`](./docs/) | Documento de escopo do Planeja. |

```
app-planeja/
├─ README.md            ← você está aqui
├─ docs/                 documento de escopo
├─ server/               API  (ver server/README.md)
├─ app-moretto/          app do professor (referência)
└─ planeja/             ← NOSSO app  (cd planeja && pnpm start)
   ├─ App.js
   ├─ package.json
   └─ src/
      ├─ api/  config/  navigation/  contexts/  components/  hooks/  utils/
      └─ features/       destinos · roteiros · atividades · dicas · ranking · grupos · auth
```

## Como rodar

Trabalhe **de dentro da pasta `planeja/`**, porque os comandos do Expo precisam
enxergar o `package.json` correto.

```bash
cd planeja
pnpm install
pnpm start
```

Leia o QR Code com o **Expo Go** no celular
([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) ·
[iOS](https://apps.apple.com/app/expo-go/id982107779)).

> **Atenção à versão do Expo.** O Planeja usa **SDK 54**, que é o que o Expo Go
> publicado nas lojas suporta hoje. Subir de SDK sem que o Expo Go acompanhe faz o QR
> Code falhar com *"Project is incompatible with this version of Expo Go"*.

---

<div align="center">
<sub>Detalhes do nosso app em <a href="./planeja/README.md"><code>planeja/README.md</code></a> · Entrega: 17 de dezembro de 2026</sub>
</div>
