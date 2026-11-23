<div align="center">

# 🧭 Planeja · Mobile

**Organize suas viagens: roteiros, destinos e atividades no bolso — com dicas da comunidade, ranking de custo-benefício e grupos com divisão de despesas.**

![Expo](https://img.shields.io/badge/Expo-SDK%2058-000?logo=expo&logoColor=fff)
![React Native](https://img.shields.io/badge/React%20Native-0.88-61DAFB?logo=react&logoColor=000)
![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=fff)

</div>

---

## Sobre

Aplicativo mobile multiplataforma (Android e iOS) para planejar viagens. É a evolução do
projeto **Planeja Web** para o celular. A API (Node/Express com PostgreSQL no Supabase)
evoluiu a do projeto web e fica na pasta [`server/`](../server/) deste repositório.
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

### Recursos do aparelho

| Tela | O que usa |
| --- | --- |
| **Perfil** (avatar no Início) | Foto pela câmera ou galeria (gravada na conta) e a cidade onde você está (GPS, guardada só no aparelho) |
| **Dicas** | Fotos pela câmera ou galeria, comprimidas no aparelho antes do envio |
| **Configurações** (pelo Perfil) | Preferência de notificações salva no aparelho, situação de cada permissão e um aviso local de teste |

Cada permissão é pedida na hora do uso, nunca na abertura do app.

### Onde cada dado fica

| Dado | Onde | No logout |
| --- | --- | --- |
| Token (JWT) | Cofre do sistema (`expo-secure-store`, só com o aparelho desbloqueado) | Apagado |
| Nome e e-mail do usuário | AsyncStorage | Apagado |
| Foto de perfil | Banco de dados (`usuarios.foto_url`), reduzida para 256 px | **Fica** — é da conta |
| Fotos das dicas | Supabase Storage (bucket `dicas`); a API guarda só o endereço | **Ficam** — são públicas |
| Última localização | AsyncStorage | Apagada |
| Preferência de notificações | AsyncStorage | **Fica** — é do aparelho, não da conta |
| Senha | Em lugar nenhum — só viaja no corpo do login | — |

## Tecnologias

- **React Native + Expo** — app nativo a partir de uma base de código em JavaScript
- **React Navigation** — abas inferiores + navegação em pilha
- **Axios** — cliente HTTP com instância única e token automático
- **API** — Node/Express/Sequelize com PostgreSQL (Supabase), na pasta [`server/`](../server/) deste repositório

## Como rodar

**Pré-requisitos:** [Node.js](https://nodejs.org) 20+, [pnpm](https://pnpm.io) e o app
**Expo Go** no seu celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) · [iOS](https://apps.apple.com/app/expo-go/id982107779)).

```bash
# 1. Entre na pasta do app (o repositório também guarda a API, em server/)
cd planeja

# 2. Instale as dependências
pnpm install

# 3. Configure o ambiente (aponte para o IP da sua máquina na rede local)
cp .env.example .env

# 4. Inicie o projeto
pnpm start
```

Leia o QR Code com o app Expo Go e o Planeja abre no seu celular.

## Estrutura

O código é organizado **por domínio**: cada funcionalidade guarda tudo o que é seu
(telas, componentes, serviços e hooks) numa pasta em `src/features/`.

```
src/
├─ api/          # cliente Axios (instância única, token) e endereços lidos do .env
├─ config/       # tema (identidade Planeja)
├─ navigation/   # abas e navegação em pilha
├─ contexts/     # estado global (autenticação/sessão e avisos)
├─ components/   # UI compartilhada entre telas
├─ hooks/        # hooks reutilizáveis
├─ services/     # aparelho: dados locais, preferências, perfil local e recursos nativos
└─ features/     # um diretório por domínio (os 6 CRUDs + conta, início e perfil)
```

## Problemas comuns

- **App mostra uma versão antiga**: no Expo Go, apague o histórico (CLEAR) e abra pelo QR Code; se continuar, `pnpm start --clear`.
- **"Não foi possível conectar ao servidor"**: API parada, IP errado no `.env` ou firewall bloqueando a porta 3000. Depois de mudar o `.env`, reinicie com `pnpm start --clear`.
- **Aviso "expo-notifications is not fully supported in Expo Go"**: esperado. Push remoto não funciona no Expo Go; o aviso local, que o app usa, funciona.
- **Câmera no emulador**: mostra uma cena virtual; se falhar, use **Escolher da galeria**.
- **Localização no emulador**: defina um ponto em *Extended controls → Location → Set location*. Sem sinal, o app avisa em até 15 segundos em vez de travar.

---

<div align="center">
<sub>Documento de escopo completo em <a href="../docs/EscopoPlanejaMobile.pdf"><code>docs/</code></a> · Entrega: 17 de dezembro de 2026</sub>
</div>
