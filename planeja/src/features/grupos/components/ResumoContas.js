import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../../../components/atoms/Avatar';
import { CaixaResumo } from '../../../components/molecules/CaixaResumo';
import { colors, fonts } from '../../../config/theme';
import { moeda, rotuloIntegrantes } from '../formatos';

const CENTAVO = 0.01;

const primeiroNome = (usuario) => (usuario?.nome ? usuario.nome.split(' ')[0] : 'Integrante');

/**
 * A aba Despesas na ordem do protótipo: totais (RF-24), a situação de quem está
 * logado, os lançamentos, os saldos e o acerto de contas (RF-23), como a API
 * calcula em GET /grupos/:id/contas. Nada disso é guardado: muda sozinho ao
 * editar despesas.
 * contas: { total, total_por_pessoa, total_despesas, saldos, acertos }.
 * lancamentos: a lista de despesas, que a aba monta e pagina (RNF-04).
 *
 * O que é da pessoa logada aparece destacado: um cartão com a situação dela
 * (verde = tem a receber, terracota = tem a pagar) e as linhas em que ela entra.
 */
export function ResumoContas({ contas, usuarioId, lancamentos }) {
  const { total, total_por_pessoa: porPessoa, total_despesas: totalDespesas = 0, saldos = [], acertos = [] } = contas;

  const meu = saldos.find((s) => s.usuario_id === usuarioId);
  const pagar = acertos.filter((a) => a.de === usuarioId);
  const receber = acertos.filter((a) => a.para === usuarioId);

  // Quem saiu do grupo continua nas contas das despesas de que participou (saiu: true na API)
  const sairam = new Set(saldos.filter((s) => s.saiu).map((s) => s.usuario_id));
  const nomeNaConta = (id, usuario) => `${primeiroNome(usuario)}${sairam.has(id) ? ' (saiu)' : ''}`;
  const integrantes = saldos.length - sairam.size;

  return (
    <View style={styles.container}>
      <View style={styles.caixas}>
        <CaixaResumo
          rotulo="Total da viagem"
          valor={moeda(total)}
          sub={`${totalDespesas} ${totalDespesas === 1 ? 'despesa' : 'despesas'}`}
        />
        <CaixaResumo rotulo="Por pessoa" valor={moeda(porPessoa)} sub={rotuloIntegrantes(integrantes)} />
      </View>

      {meu ? <MinhaSituacao saldo={meu} pagar={pagar} receber={receber} nomeNaConta={nomeNaConta} /> : null}

      {lancamentos}

      <View>
        <Text style={styles.rotulo}>Saldos</Text>
        {saldos.map((s) => {
          const credor = s.saldo > CENTAVO;
          const devedor = s.saldo < -CENTAVO;
          const eu = s.usuario_id === usuarioId;
          const sinal = credor ? '+' : devedor ? '−' : '';
          return (
            <View key={s.usuario_id} style={[styles.pessoa, eu && styles.pessoaEu]}>
              <Avatar nome={s.usuario?.nome} fotoUri={s.usuario?.foto_url} tamanho={28} />
              <View style={styles.textos}>
                <Text style={[styles.nome, eu && styles.nomeEu]} numberOfLines={1}>
                  {eu ? 'Você' : nomeNaConta(s.usuario_id, s.usuario)}
                </Text>
                <Text style={styles.sub}>
                  pagou {moeda(s.pago)} · deve {moeda(s.devido)}
                </Text>
              </View>
              <Text
                style={[styles.saldoValor, credor && styles.receber, devedor && styles.pagar, eu && styles.saldoEu]}
                accessibilityLabel={`${credor ? 'a receber' : devedor ? 'a pagar' : 'quite'} ${moeda(Math.abs(s.saldo))}`}
              >
                {sinal}
                {moeda(Math.abs(s.saldo))}
              </Text>
            </View>
          );
        })}
      </View>

      <View>
        <Text style={styles.rotulo}>Acerto de contas</Text>
        {acertos.length === 0 ? (
          <Text style={styles.quite}>Todo mundo está quite.</Text>
        ) : (
          acertos.map((a) => {
            const euPago = a.de === usuarioId;
            const euRecebo = a.para === usuarioId;
            const de = euPago ? 'Você' : nomeNaConta(a.de, a.de_usuario);
            const para = euRecebo ? 'você' : nomeNaConta(a.para, a.para_usuario);
            return (
              <View
                key={`${a.de}-${a.para}`}
                style={[styles.acerto, euPago && styles.linhaPagar, euRecebo && styles.linhaReceber]}
                accessible
                accessibilityLabel={`${de} paga ${moeda(a.valor)} para ${para}`}
              >
                <Avatar nome={a.de_usuario?.nome} fotoUri={a.de_usuario?.foto_url} tamanho={28} />
                <Text style={styles.seta}>→</Text>
                <Avatar nome={a.para_usuario?.nome} fotoUri={a.para_usuario?.foto_url} tamanho={28} />
                <Text style={[styles.acertoTexto, (euPago || euRecebo) && styles.textoMeu]} numberOfLines={1}>
                  <Text style={styles.forte}>{de}</Text>
                  {' paga '}
                  <Text style={styles.forte}>{para}</Text>
                </Text>
                <Text style={[styles.acertoValor, euPago && styles.pagar, euRecebo && styles.receber]}>
                  {moeda(a.valor)}
                </Text>
              </View>
            );
          })
        )}
        <Text style={styles.nota}>O acerto é recalculado a cada despesa lançada, editada ou excluída.</Text>
      </View>
    </View>
  );
}

/** Cartão "Sua situação": quanto a pessoa recebe ou paga, e de/para quem. */
function MinhaSituacao({ saldo, pagar, receber, nomeNaConta }) {
  const credor = saldo.saldo > CENTAVO;
  const devedor = saldo.saldo < -CENTAVO;

  let titulo = 'Você está quite';
  let detalhe = 'Não deve nada e ninguém te deve.';
  if (credor) {
    titulo = `Você tem ${moeda(saldo.saldo)} a receber`;
    detalhe = receber.map((a) => `${nomeNaConta(a.de, a.de_usuario)} te paga ${moeda(a.valor)}`).join('\n');
  } else if (devedor) {
    titulo = `Você tem ${moeda(-saldo.saldo)} a pagar`;
    detalhe = pagar.map((a) => `Pague ${moeda(a.valor)} para ${nomeNaConta(a.para, a.para_usuario)}`).join('\n');
  }

  return (
    <View
      style={[styles.minha, credor && styles.minhaReceber, devedor && styles.minhaPagar]}
      accessibilityRole="summary"
    >
      <Text style={[styles.rotulo, styles.minhaRotulo]}>Sua situação</Text>
      <Text style={[styles.minhaTitulo, credor && styles.receber, devedor && styles.pagar]}>{titulo}</Text>
      {detalhe ? <Text style={styles.minhaDetalhe}>{detalhe}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  caixas: { flexDirection: 'row', gap: 10 },
  rotulo: {
    fontFamily: fonts.corpoForte,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.tenue,
    marginBottom: 4,
  },
  quite: { fontFamily: fonts.corpo, fontSize: 13.5, color: colors.ok, paddingVertical: 6 },

  // Sua situação
  minha: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.linha,
    backgroundColor: colors.branco,
    paddingVertical: 13,
    paddingHorizontal: 14,
    gap: 4,
  },
  minhaReceber: { backgroundColor: colors.okSuave, borderColor: colors.ok },
  minhaPagar: { backgroundColor: colors.acentoSuave, borderColor: colors.acento },
  minhaRotulo: { marginBottom: 0, color: colors.suave },
  minhaTitulo: { fontFamily: fonts.titulo, fontSize: 20, color: colors.tinta },
  minhaDetalhe: { fontFamily: fonts.corpoSemi, fontSize: 13.5, lineHeight: 20, color: colors.tintaSuave },

  // Acerto de contas
  acerto: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.linhaSuave,
  },
  linhaPagar: { backgroundColor: colors.acentoSuave, borderRadius: 8, borderBottomColor: 'transparent' },
  linhaReceber: { backgroundColor: colors.okSuave, borderRadius: 8, borderBottomColor: 'transparent' },
  seta: { fontFamily: fonts.corpo, fontSize: 14, color: colors.tenue, marginHorizontal: -4 },
  acertoTexto: { flex: 1, fontFamily: fonts.corpo, fontSize: 14, color: colors.suave },
  nota: { fontFamily: fonts.corpo, fontSize: 12, lineHeight: 17, color: colors.suave, marginTop: 8 },
  textoMeu: { color: colors.tinta },
  forte: { fontFamily: fonts.corpoSemi, color: colors.tinta },
  acertoValor: { fontFamily: fonts.monoMedio, fontSize: 14, color: colors.tinta },

  // Saldos
  pessoa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.linhaSuave,
  },
  pessoaEu: { backgroundColor: colors.linhaTocada, borderRadius: 8, borderBottomColor: 'transparent' },
  textos: { flex: 1, gap: 1 },
  nome: { fontFamily: fonts.corpoSemi, fontSize: 14, color: colors.tinta },
  nomeEu: { fontFamily: fonts.corpoForte },
  sub: { fontFamily: fonts.corpo, fontSize: 12, color: colors.suave },
  saldoValor: { fontFamily: fonts.monoMedio, fontSize: 14, color: colors.suave },
  saldoEu: { fontFamily: fonts.monoForte, fontSize: 15 },

  receber: { color: colors.ok },
  pagar: { color: colors.acento },
});
