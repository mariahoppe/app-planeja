-- =============================================================================
-- Planeja · schema completo (PostgreSQL / Supabase)
-- =============================================================================
-- Equivalente consolidado das migrations em src/database/migrations/.
-- Use este arquivo se preferir criar tudo de uma vez pelo SQL Editor do
-- Supabase, em vez de rodar `npm run db:migrate`.
--
-- Destinado a um banco NOVO e VAZIO. Não é idempotente: rodar duas vezes
-- falha no primeiro CREATE TYPE.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Extensões e normalização de texto
-- -----------------------------------------------------------------------------
-- Busca de destino sem acento e sem diferenciar maiúsculas ("paris" = "Paris").
-- No Supabase as extensões vivem no schema `extensions`; em um Postgres comum
-- troque por `CREATE EXTENSION IF NOT EXISTS unaccent;` e remova o prefixo
-- `extensions.` da função abaixo.
CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA extensions;

-- A forma de dois argumentos de unaccent() é IMMUTABLE, o que permite usá-la
-- em colunas geradas e índices. A de um argumento não é.
CREATE OR REPLACE FUNCTION public.f_unaccent(text)
RETURNS text
LANGUAGE sql
IMMUTABLE PARALLEL SAFE STRICT
AS $$ SELECT extensions.unaccent('extensions.unaccent'::regdictionary, $1) $$;

-- Espelha exatamente o norm() do protótipo: sem acento, minúsculo, sem espaços
-- nas pontas.
CREATE OR REPLACE FUNCTION public.norm(text)
RETURNS text
LANGUAGE sql
IMMUTABLE PARALLEL SAFE STRICT
AS $$ SELECT lower(btrim(public.f_unaccent($1))) $$;

-- -----------------------------------------------------------------------------
-- 2. Tipos ENUM
-- -----------------------------------------------------------------------------
CREATE TYPE perfil_usuario    AS ENUM ('admin', 'comum');
CREATE TYPE escopo_destino    AS ENUM ('nacional', 'internacional');
CREATE TYPE status_roteiro    AS ENUM ('planejando', 'confirmado', 'concluido');
CREATE TYPE bloco_dica        AS ENUM ('onde_comer', 'o_que_fazer', 'onde_visitar', 'onde_ficar');
CREATE TYPE papel_membro      AS ENUM ('admin', 'integrante');
CREATE TYPE categoria_despesa AS ENUM ('alimentacao', 'hospedagem', 'transporte', 'atividade', 'outros');
CREATE TYPE modo_divisao      AS ENUM ('igual', 'personalizada');

-- =============================================================================
-- 3. Entidades herdadas do projeto web
-- =============================================================================

-- -----------------------------------------------------------------------------
-- usuarios
-- -----------------------------------------------------------------------------
CREATE TABLE usuarios (
  id                 SERIAL        PRIMARY KEY,
  nome               VARCHAR(80)   NOT NULL,
  email              VARCHAR(120)  NOT NULL,
  senha_hash         VARCHAR(255)  NOT NULL,
  perfil             perfil_usuario NOT NULL DEFAULT 'comum',
  foto_url           TEXT,
  reset_token        VARCHAR(255),
  reset_token_expira TIMESTAMPTZ,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),

  CONSTRAINT usuarios_nome_check  CHECK (btrim(nome) <> ''),
  CONSTRAINT usuarios_email_check CHECK (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[a-z]{2,}$')
);

-- E-mail único ignorando maiúsculas: maria@x.com = Maria@X.com
CREATE UNIQUE INDEX usuarios_email_unique ON usuarios (lower(email));

COMMENT ON COLUMN usuarios.foto_url IS 'Foto de perfil enviada pela galeria (tela Meu perfil)';
COMMENT ON COLUMN usuarios.reset_token IS 'Código de 6 dígitos do fluxo "esqueci minha senha"';

-- -----------------------------------------------------------------------------
-- destinos
-- -----------------------------------------------------------------------------
CREATE TABLE destinos (
  id         SERIAL         PRIMARY KEY,
  usuario_id INTEGER        NOT NULL REFERENCES usuarios (id) ON UPDATE CASCADE ON DELETE CASCADE,
  cidade     VARCHAR(80)    NOT NULL,
  pais       VARCHAR(60)    NOT NULL,
  escopo     escopo_destino NOT NULL DEFAULT 'internacional',
  periodo    VARCHAR(40),
  obs        TEXT,
  created_at TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ    NOT NULL DEFAULT now(),

  CONSTRAINT destinos_cidade_check CHECK (btrim(cidade) <> ''),
  CONSTRAINT destinos_pais_check   CHECK (btrim(pais) <> '')
);

CREATE INDEX destinos_usuario_id_idx ON destinos (usuario_id);

COMMENT ON COLUMN destinos.periodo IS 'Período pretendido em texto livre: "Abril 2026", "A definir"';
COMMENT ON COLUMN destinos.escopo  IS 'Alimenta o filtro Nacional/Internacional da lista de destinos';

-- -----------------------------------------------------------------------------
-- roteiros
-- -----------------------------------------------------------------------------
CREATE TABLE roteiros (
  id         SERIAL         PRIMARY KEY,
  destino_id INTEGER        NOT NULL REFERENCES destinos (id) ON UPDATE CASCADE ON DELETE CASCADE,
  titulo     VARCHAR(100)   NOT NULL,
  inicio     DATE           NOT NULL,
  fim        DATE,
  status     status_roteiro NOT NULL DEFAULT 'planejando',
  obs        TEXT,
  created_at TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ    NOT NULL DEFAULT now(),

  CONSTRAINT roteiros_titulo_check CHECK (btrim(titulo) <> ''),
  CONSTRAINT roteiros_periodo_check CHECK (fim IS NULL OR fim >= inicio)
);

CREATE INDEX roteiros_destino_id_idx ON roteiros (destino_id);
CREATE INDEX roteiros_status_idx     ON roteiros (status);

-- -----------------------------------------------------------------------------
-- atividades
-- -----------------------------------------------------------------------------
CREATE TABLE atividades (
  id         SERIAL        PRIMARY KEY,
  roteiro_id INTEGER       NOT NULL REFERENCES roteiros (id) ON UPDATE CASCADE ON DELETE CASCADE,
  titulo     VARCHAR(120)  NOT NULL,
  dia        SMALLINT      NOT NULL,
  horario    TIME          NOT NULL,
  local      VARCHAR(150),
  custo      NUMERIC(10,2) NOT NULL DEFAULT 0,
  link       TEXT,
  obs        TEXT,
  feita      BOOLEAN       NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ   NOT NULL DEFAULT now(),

  CONSTRAINT atividades_titulo_check CHECK (btrim(titulo) <> ''),
  CONSTRAINT atividades_dia_check    CHECK (dia >= 1),
  CONSTRAINT atividades_custo_check  CHECK (custo >= 0),
  CONSTRAINT atividades_link_check   CHECK (link IS NULL OR link ~* '^https?://')
);

-- Ordenação da tela de detalhe do roteiro: agrupada por dia, ordenada por hora
CREATE INDEX atividades_roteiro_dia_horario_idx ON atividades (roteiro_id, dia, horario);

COMMENT ON COLUMN atividades.dia  IS 'Dia N da viagem, contado a partir de roteiros.inicio (1 = primeiro dia)';
COMMENT ON COLUMN atividades.link IS 'Link opcional de compra: ingresso, passagem, reserva';

-- =============================================================================
-- 4. Entidades novas · Dicas e Ranking
-- =============================================================================

-- -----------------------------------------------------------------------------
-- dicas
-- -----------------------------------------------------------------------------
-- Dicas são globais: qualquer usuário lê, só o autor edita. O destino é gravado
-- como texto (país + cidade), não como FK para `destinos`, porque `destinos` é
-- a lista pessoal de cada usuário.
CREATE TABLE dicas (
  id           SERIAL         PRIMARY KEY,
  autor_id     INTEGER        NOT NULL REFERENCES usuarios (id) ON UPDATE CASCADE ON DELETE CASCADE,
  pais         VARCHAR(60)    NOT NULL,
  cidade       VARCHAR(80)    NOT NULL,
  pais_norm    TEXT GENERATED ALWAYS AS (public.norm(pais))   STORED,
  cidade_norm  TEXT GENERATED ALWAYS AS (public.norm(cidade)) STORED,
  escopo       escopo_destino NOT NULL DEFAULT 'internacional',
  onde_comer   TEXT,
  o_que_fazer  TEXT,
  onde_visitar TEXT,
  onde_ficar   TEXT,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ    NOT NULL DEFAULT now(),

  CONSTRAINT dicas_cidade_check CHECK (btrim(cidade) <> ''),
  CONSTRAINT dicas_pais_check   CHECK (btrim(pais) <> ''),

  -- Regra do protótipo: pelo menos um dos quatro blocos preenchido
  CONSTRAINT dicas_algum_bloco_check CHECK (
    btrim(coalesce(onde_comer,   '')) <> '' OR
    btrim(coalesce(o_que_fazer,  '')) <> '' OR
    btrim(coalesce(onde_visitar, '')) <> '' OR
    btrim(coalesce(onde_ficar,   '')) <> ''
  )
);

CREATE INDEX dicas_cidade_norm_idx ON dicas (cidade_norm);
CREATE INDEX dicas_pais_norm_idx   ON dicas (pais_norm);
CREATE INDEX dicas_escopo_idx      ON dicas (escopo);
CREATE INDEX dicas_autor_id_idx    ON dicas (autor_id);
CREATE INDEX dicas_recentes_idx    ON dicas (created_at DESC);

COMMENT ON TABLE  dicas IS 'Dicas de viagem por destino. Leitura pública, escrita só do autor.';
COMMENT ON COLUMN dicas.cidade_norm IS 'Coluna gerada para busca sem acento/caixa';

-- -----------------------------------------------------------------------------
-- dica_fotos
-- -----------------------------------------------------------------------------
-- Fotos organizadas por bloco, no máximo 4 por bloco. O limite é garantido pelo
-- par CHECK(ordem BETWEEN 1 AND 4) + UNIQUE(dica_id, bloco, ordem): não existe
-- combinação possível que permita uma quinta foto no mesmo bloco.
CREATE TABLE dica_fotos (
  id         SERIAL       PRIMARY KEY,
  dica_id    INTEGER      NOT NULL REFERENCES dicas (id) ON UPDATE CASCADE ON DELETE CASCADE,
  bloco      bloco_dica   NOT NULL,
  url        TEXT         NOT NULL,
  legenda    VARCHAR(120),
  ordem      SMALLINT     NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT dica_fotos_url_check   CHECK (btrim(url) <> ''),
  CONSTRAINT dica_fotos_ordem_check CHECK (ordem BETWEEN 1 AND 4),
  CONSTRAINT dica_fotos_slot_unique UNIQUE (dica_id, bloco, ordem)
);

CREATE INDEX dica_fotos_dica_id_idx ON dica_fotos (dica_id);

-- -----------------------------------------------------------------------------
-- avaliacoes_destino
-- -----------------------------------------------------------------------------
-- Uma avaliação por usuário por destino, editável depois (upsert na chave
-- única). Os dois rankings — países e cidades — são AVG + COUNT sobre esta
-- tabela, agrupados por pais_norm e por cidade_norm.
CREATE TABLE avaliacoes_destino (
  id          SERIAL         PRIMARY KEY,
  usuario_id  INTEGER        NOT NULL REFERENCES usuarios (id) ON UPDATE CASCADE ON DELETE CASCADE,
  pais        VARCHAR(60)    NOT NULL,
  cidade      VARCHAR(80)    NOT NULL,
  pais_norm   TEXT GENERATED ALWAYS AS (public.norm(pais))   STORED,
  cidade_norm TEXT GENERATED ALWAYS AS (public.norm(cidade)) STORED,
  escopo      escopo_destino NOT NULL DEFAULT 'internacional',
  nota        NUMERIC(3,1)   NOT NULL,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ    NOT NULL DEFAULT now(),

  CONSTRAINT avaliacoes_cidade_check CHECK (btrim(cidade) <> ''),
  CONSTRAINT avaliacoes_pais_check   CHECK (btrim(pais) <> ''),
  CONSTRAINT avaliacoes_nota_check   CHECK (nota >= 0 AND nota <= 10),
  CONSTRAINT avaliacoes_um_por_destino_unique UNIQUE (usuario_id, pais_norm, cidade_norm)
);

CREATE INDEX avaliacoes_ranking_pais_idx   ON avaliacoes_destino (escopo, pais_norm);
CREATE INDEX avaliacoes_ranking_cidade_idx ON avaliacoes_destino (escopo, cidade_norm);

COMMENT ON COLUMN avaliacoes_destino.nota IS
  'Custo-benefício de 0 a 10 com uma casa decimal. As estrelas da tela de Dica gravam estrela * 2.';

-- =============================================================================
-- 5. Entidades novas · Grupos e Despesas
-- =============================================================================

-- -----------------------------------------------------------------------------
-- grupos
-- -----------------------------------------------------------------------------
CREATE TABLE grupos (
  id             SERIAL      PRIMARY KEY,
  roteiro_id     INTEGER     NOT NULL REFERENCES roteiros (id) ON UPDATE CASCADE ON DELETE CASCADE,
  criador_id     INTEGER     NOT NULL REFERENCES usuarios (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  nome           VARCHAR(60) NOT NULL,
  codigo_convite CHAR(6)     NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT grupos_nome_check   CHECK (btrim(nome) <> ''),
  CONSTRAINT grupos_codigo_check CHECK (codigo_convite ~ '^[A-Z0-9]{6}$'),

  -- "Um grupo está vinculado a exatamente uma viagem; uma viagem pode ter um grupo"
  CONSTRAINT grupos_roteiro_unique     UNIQUE (roteiro_id),
  CONSTRAINT grupos_codigo_unique      UNIQUE (codigo_convite)
);

CREATE INDEX grupos_criador_id_idx ON grupos (criador_id);

-- -----------------------------------------------------------------------------
-- grupo_membros
-- -----------------------------------------------------------------------------
CREATE TABLE grupo_membros (
  id         SERIAL       PRIMARY KEY,
  grupo_id   INTEGER      NOT NULL REFERENCES grupos (id)   ON UPDATE CASCADE ON DELETE CASCADE,
  usuario_id INTEGER      NOT NULL REFERENCES usuarios (id) ON UPDATE CASCADE ON DELETE CASCADE,
  papel      papel_membro NOT NULL DEFAULT 'integrante',
  entrou_em  TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT grupo_membros_unique UNIQUE (grupo_id, usuario_id)
);

CREATE INDEX grupo_membros_usuario_id_idx ON grupo_membros (usuario_id);

-- -----------------------------------------------------------------------------
-- despesas
-- -----------------------------------------------------------------------------
-- pagador_id aponta para `usuarios`, e não para `grupo_membros`: é isso que faz
-- valer a regra "sair do grupo não apaga as despesas já registradas pela pessoa".
CREATE TABLE despesas (
  id           SERIAL            PRIMARY KEY,
  grupo_id     INTEGER           NOT NULL REFERENCES grupos (id)   ON UPDATE CASCADE ON DELETE CASCADE,
  pagador_id   INTEGER           NOT NULL REFERENCES usuarios (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  descricao    VARCHAR(120)      NOT NULL,
  valor        NUMERIC(10,2)     NOT NULL,
  data         DATE              NOT NULL DEFAULT CURRENT_DATE,
  categoria    categoria_despesa NOT NULL DEFAULT 'outros',
  modo_divisao modo_divisao      NOT NULL DEFAULT 'igual',
  created_at   TIMESTAMPTZ       NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ       NOT NULL DEFAULT now(),

  CONSTRAINT despesas_descricao_check CHECK (btrim(descricao) <> ''),
  CONSTRAINT despesas_valor_check     CHECK (valor > 0)
);

CREATE INDEX despesas_grupo_id_idx   ON despesas (grupo_id);
CREATE INDEX despesas_pagador_id_idx ON despesas (pagador_id);

-- -----------------------------------------------------------------------------
-- despesa_rateios
-- -----------------------------------------------------------------------------
-- Só recebe linhas quando modo_divisao = 'personalizada'. No modo 'igual' o
-- rateio é calculado na hora (valor / nº de integrantes), como em rateioDe().
CREATE TABLE despesa_rateios (
  id           SERIAL        PRIMARY KEY,
  despesa_id   INTEGER       NOT NULL REFERENCES despesas (id)  ON UPDATE CASCADE ON DELETE CASCADE,
  usuario_id   INTEGER       NOT NULL REFERENCES usuarios (id)  ON UPDATE CASCADE ON DELETE RESTRICT,
  valor_devido NUMERIC(10,2) NOT NULL,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),

  CONSTRAINT despesa_rateios_valor_check CHECK (valor_devido >= 0),
  CONSTRAINT despesa_rateios_unique      UNIQUE (despesa_id, usuario_id)
);

CREATE INDEX despesa_rateios_usuario_id_idx ON despesa_rateios (usuario_id);

-- -----------------------------------------------------------------------------
-- Validação do rateio personalizado
-- -----------------------------------------------------------------------------
-- "Na divisão personalizada, a soma dos valores por pessoa deve fechar com o
-- valor total da despesa." Isso atravessa linhas, então não cabe em um CHECK.
-- Os triggers são DEFERRABLE INITIALLY DEFERRED: a soma só é conferida no
-- COMMIT, o que permite inserir os rateios um a um dentro da transação.
CREATE OR REPLACE FUNCTION public.valida_rateio(p_despesa_id INTEGER)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_modo  modo_divisao;
  v_valor NUMERIC(10,2);
  v_soma  NUMERIC(10,2);
BEGIN
  SELECT modo_divisao, valor INTO v_modo, v_valor
    FROM despesas WHERE id = p_despesa_id;

  -- Despesa já excluída (cascata) ou divisão igual: nada a validar
  IF NOT FOUND OR v_modo <> 'personalizada' THEN
    RETURN;
  END IF;

  SELECT coalesce(sum(valor_devido), 0) INTO v_soma
    FROM despesa_rateios WHERE despesa_id = p_despesa_id;

  IF abs(v_soma - v_valor) > 0.01 THEN
    RAISE EXCEPTION
      'A soma dos rateios (R$ %) deve fechar com o valor da despesa (R$ %)', v_soma, v_valor
      USING ERRCODE = 'check_violation';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_rateio_valida()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM public.valida_rateio(coalesce(NEW.despesa_id, OLD.despesa_id));
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_despesa_valida()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM public.valida_rateio(NEW.id);
  RETURN NULL;
END;
$$;

CREATE CONSTRAINT TRIGGER rateio_fecha_com_despesa
  AFTER INSERT OR UPDATE OR DELETE ON despesa_rateios
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION public.trg_rateio_valida();

-- Cobre o caso de mudar o valor ou o modo da despesa depois dos rateios gravados
CREATE CONSTRAINT TRIGGER despesa_fecha_com_rateio
  AFTER UPDATE OF valor, modo_divisao ON despesas
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION public.trg_despesa_valida();

-- =============================================================================
-- 6. Row Level Security
-- =============================================================================
-- A API conecta como dona das tabelas via Sequelize, e o dono passa por cima do
-- RLS — habilitar aqui não muda nada para o app, só silencia o aviso do painel
-- do Supabase sobre tabelas expostas sem política. Sem nenhuma policy criada,
-- qualquer acesso via PostgREST (anon/authenticated) fica bloqueado, que é o
-- comportamento desejado: todo acesso passa pela API.
ALTER TABLE usuarios           ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE roteiros           ENABLE ROW LEVEL SECURITY;
ALTER TABLE atividades         ENABLE ROW LEVEL SECURITY;
ALTER TABLE dicas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE dica_fotos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes_destino ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupo_membros      ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesa_rateios    ENABLE ROW LEVEL SECURITY;

COMMIT;
