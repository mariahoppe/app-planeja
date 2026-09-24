'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      -- Só recebe linhas quando modo_divisao = 'personalizada'. No modo 'igual' o
      -- rateio é calculado na hora (valor / nº de integrantes), como em rateioDe().
      CREATE TABLE despesa_rateios (
        id           SERIAL        PRIMARY KEY,
        despesa_id   INTEGER       NOT NULL REFERENCES despesas (id) ON UPDATE CASCADE ON DELETE CASCADE,
        usuario_id   INTEGER       NOT NULL REFERENCES usuarios (id) ON UPDATE CASCADE ON DELETE RESTRICT,
        valor_devido NUMERIC(10,2) NOT NULL,
        created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
        updated_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),

        CONSTRAINT despesa_rateios_valor_check CHECK (valor_devido >= 0),
        CONSTRAINT despesa_rateios_unique      UNIQUE (despesa_id, usuario_id)
      );

      CREATE INDEX despesa_rateios_usuario_id_idx ON despesa_rateios (usuario_id);

      -- "Na divisão personalizada, a soma dos valores por pessoa deve fechar com
      -- o valor total da despesa." Isso atravessa linhas, então não cabe em um
      -- CHECK. Os triggers são DEFERRABLE INITIALLY DEFERRED: a soma só é
      -- conferida no COMMIT, o que permite inserir os rateios um a um dentro da
      -- transação.
      CREATE OR REPLACE FUNCTION public.valida_rateio(p_despesa_id INTEGER)
      RETURNS void
      LANGUAGE plpgsql
      AS $fn$
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
      $fn$;

      CREATE OR REPLACE FUNCTION public.trg_rateio_valida()
      RETURNS trigger LANGUAGE plpgsql AS $fn$
      BEGIN
        PERFORM public.valida_rateio(coalesce(NEW.despesa_id, OLD.despesa_id));
        RETURN NULL;
      END;
      $fn$;

      CREATE OR REPLACE FUNCTION public.trg_despesa_valida()
      RETURNS trigger LANGUAGE plpgsql AS $fn$
      BEGIN
        PERFORM public.valida_rateio(NEW.id);
        RETURN NULL;
      END;
      $fn$;

      CREATE CONSTRAINT TRIGGER rateio_fecha_com_despesa
        AFTER INSERT OR UPDATE OR DELETE ON despesa_rateios
        DEFERRABLE INITIALLY DEFERRED
        FOR EACH ROW EXECUTE FUNCTION public.trg_rateio_valida();

      -- Cobre o caso de mudar o valor ou o modo da despesa depois dos rateios gravados
      CREATE CONSTRAINT TRIGGER despesa_fecha_com_rateio
        AFTER UPDATE OF valor, modo_divisao ON despesas
        DEFERRABLE INITIALLY DEFERRED
        FOR EACH ROW EXECUTE FUNCTION public.trg_despesa_valida();
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS despesa_fecha_com_rateio ON despesas;
      DROP TABLE IF EXISTS despesa_rateios CASCADE;
      DROP FUNCTION IF EXISTS public.trg_despesa_valida();
      DROP FUNCTION IF EXISTS public.trg_rateio_valida();
      DROP FUNCTION IF EXISTS public.valida_rateio(INTEGER);
    `);
  }
};
