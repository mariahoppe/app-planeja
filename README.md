<div align="center">

# 🧭 Planeja · Repositório da disciplina

**O app Planeja Mobile e a API que ele consome.**

Disciplina de **Desenvolvimento de Dispositivos Móveis** — 6º semestre de Sistemas de Informação

</div>

---

## Para avaliar

| | |
| --- | --- |
| 📱 **App (Android)** | [Baixar o APK](https://expo.dev/artifacts/eas/5ThHkTX-l0Q09bVpoEeMh2CVFzfJKfrsUycs02iWWb8.apk) — instalar no celular (permitir "fontes desconhecidas") |
| 🌐 **API publicada** | [`planeja-api-q8te.onrender.com`](https://planeja-api-q8te.onrender.com/health) — plano gratuito do Render: a primeira requisição depois de um tempo parada pode levar ~50 s |
| 👤 **Contas de teste** | `maria@planeja.app` · `mario@planeja.app` · `ana@planeja.app` — senha `planeja123` |

No iPhone, o app roda pelo **Expo Go** a partir do código (ver [como rodar](./docs/COMO-RODAR.md)).

---

## O que tem aqui

| Pasta | O que é |
| --- | --- |
| [`planeja/`](./planeja/) | **Nosso app.** O Planeja Mobile, em React Native + Expo. |
| [`server/`](./server/) | **API do Planeja**, em Node + Express + Sequelize, com PostgreSQL no Supabase. |
| [`docs/`](./docs/) | Escopo e plano do Planeja, e o guia [como rodar](./docs/COMO-RODAR.md). |

```
app-planeja/
├─ README.md            ← você está aqui
├─ docs/                 escopo, plano e guia de como rodar
├─ server/               API  (ver server/README.md)
└─ planeja/             ← NOSSO app  (cd planeja && pnpm start)
   ├─ App.js
   ├─ package.json
   └─ src/
      ├─ api/  config/  navigation/  contexts/  components/  hooks/  services/
      └─ features/       inicio · destinos · roteiros · atividades · dicas · ranking · grupos · auth · perfil
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

> **Atenção à versão do Expo.** O Planeja usa **SDK 58**, que é o que o Expo Go
> publicado nas lojas suporta hoje. Subir de SDK sem que o Expo Go acompanhe faz o QR
> Code falhar com *"Project is incompatible with this version of Expo Go"*.

---

<div align="center">
<sub>Detalhes do nosso app em <a href="./planeja/README.md"><code>planeja/README.md</code></a> · Versão 1.0.0</sub>
</div>
