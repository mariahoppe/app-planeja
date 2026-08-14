<div align="center">

# 🧭 Planeja · Mobile

**Organize suas viagens: roteiros, destinos e atividades no bolso — com dicas da comunidade, ranking de custo-benefício e grupos com divisão de despesas.**

![Expo](https://img.shields.io/badge/Expo-SDK%2057-000?logo=expo&logoColor=fff)
![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB?logo=react&logoColor=000)
![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=fff)

</div>

---

## Sobre

Aplicativo mobile multiplataforma (Android e iOS) para planejar viagens. É a evolução do
projeto **Planeja Web** para o celular, reaproveitando a mesma API (Node/Express/MySQL).
Projeto da disciplina de **Desenvolvimento de Dispositivos Móveis** — 6º semestre de
Sistemas de Informação.

## Funcionalidades

Seis cadastros completos (criar, listar, editar e excluir) mais as funções de conta:

| Cadastro | Descrição | Origem |
| --- | --- | --- |
| **Destinos** | Países e cidades que o usuário quer visitar | Herdado do web |
| **Roteiros** | O plano de uma viagem: datas, status e dias | Herdado do web |
| **Atividades** | O que fazer em cada dia do roteiro | Herdado do web |
| **Dicas** | Relatos por destino (onde comer, o que fazer…) com fotos | Novo |
| **Ranking** | Custo-benefício de países e cidades por avaliações | Novo |
| **Grupos** | Viagem compartilhada com despesas e acerto de contas | Novo |

Mais: login, cadastro, recuperação de senha e perfil, com sessão mantida no dispositivo.

## Tecnologias

- **React Native + Expo** — app nativo a partir de uma base de código em JavaScript
- **React Navigation** — abas inferiores + navegação em pilha
- **Axios** — cliente HTTP com instância única e token automático
- **API** — Node/Express/MySQL, reaproveitada do projeto web ([repositório separado](https://github.com/mariahoppe/app-planeja))

## Como rodar

**Pré-requisitos:** [Node.js](https://nodejs.org) 20+, [pnpm](https://pnpm.io) e o app
**Expo Go** no seu celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) · [iOS](https://apps.apple.com/app/expo-go/id982107779)).

```bash
# 1. Instale as dependências
pnpm install

# 2. Configure o ambiente (aponte para o IP da sua máquina na rede local)
cp .env.example .env

# 3. Inicie o projeto
pnpm start
```

Leia o QR Code com o app Expo Go e o Planeja abre no seu celular.

## Estrutura

O código é organizado **por domínio**: cada funcionalidade guarda tudo o que é seu
(telas, componentes, serviços e hooks) numa pasta em `src/features/`.

```
src/
├─ api/          # cliente Axios (instância única, token)
├─ config/       # tema (identidade Planeja) e variáveis de ambiente
├─ navigation/   # abas e navegação em pilha
├─ contexts/     # estado global (autenticação/sessão)
├─ components/   # UI compartilhada entre telas
├─ hooks/        # hooks reutilizáveis
├─ utils/        # funções puras (moeda, datas, acerto de contas)
└─ features/     # um diretório por domínio (os 6 CRUDs + conta)
```

---

<div align="center">
<sub>Documento de escopo completo em <a href="./docs/EscopoPlanejaMobile.pdf"><code>docs/</code></a> · Entrega: 17 de dezembro de 2026</sub>
</div>
