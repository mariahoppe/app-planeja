'use strict';

/**
 * A divisão igual passa a ser gravada em despesa_rateios, como a personalizada.
 *
 * Antes, o rateio igual era recalculado a cada leitura com os integrantes
 * atuais: quem saía do grupo sumia das contas e quem entrava herdava despesas
 * antigas. Agora a divisão fica congelada no momento do lançamento.
 *
 * 1. Grava o rateio das despesas "igual" que ainda não têm, dividindo entre os
 *    integrantes atuais em centavos inteiros (a sobra vai para quem entrou
 *    primeiro), como rateioDe() faz.
 * 2. valida_rateio() passa a conferir a soma nos dois modos de divisão.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      INSERT INTO despesa_rateios (despesa_id, usuario_id, valor_devido)
      SELECT d.id,
             m.usuario_id,
             ((round(d.valor * 100)::int / n.qtd)
               + CASE WHEN m.ordem <= round(d.valor * 100)::int % n.qtd THEN 1 ELSE 0 END
             )::numeric / 100
        FROM despesas d
        JOIN (
          SELECT grupo_id, usuario_id,
                 row_number() OVER (PARTITION BY grupo_id ORDER BY entrou_em, id)::int AS ordem
            FROM grupo_membros
        ) m ON m.grupo_id = d.grupo_id
        JOIN (
          SELECT grupo_id, count(*)::int AS qtd FROM grupo_membros GROUP BY grupo_id
        ) n ON n.grupo_id = d.grupo_id
       WHERE d.modo_divisao = 'igual'
         AND NOT EXISTS (SELECT 1 FROM despesa_rateios r WHERE r.despesa_id = d.id);

      CREATE OR REPLACE FUNCTION public.valida_rateio(p_despesa_id INTEGER)
      RETURNS void
      LANGUAGE plpgsql
      AS $fn$
      DECLARE
        v_valor NUMERIC(10,2);
        v_soma  NUMERIC(10,2);
      BEGIN
        SELECT valor INTO v_valor FROM despesas WHERE id = p_despesa_id;

        -- Despesa já excluída (cascata): nada a validar
        IF NOT FOUND THEN
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
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
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

      DELETE FROM despesa_rateios r
       USING despesas d
       WHERE r.despesa_id = d.id AND d.modo_divisao = 'igual';
    `);
  }
};
