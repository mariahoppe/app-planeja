import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../../../components/atoms/Avatar';
import { CaixaResumo } from '../../../components/molecules/CaixaResumo';
import { colors, fonts } from '../../../config/theme';
import { moeda } from '../formatos';

const CENTAVO = 0.01;

const nomeDe = (usuario) => usuario?.nome ?? 'Integrante';

/**
 * Totais da viagem (RF-24) e o acerto de contas (RF-23), como a API calcula em
 * GET /grupos/:id/contas. Nada disso é guardado: muda sozinho ao editar despesas.
 * contas: { total, total_por_pessoa, saldos, acertos }.
 *
 * O que é da pessoa logada aparece destacado: um cartão com a situação dela
 * (verde = tem a receber, terracota = tem a pagar) e as linhas em que ela entra.
 */
export function ResumoContas({ contas, totalDespesas, usuarioId }) {
  const { total, total_por_pessoa: porPessoa, saldos = [], acertos = [] } = contas;

  const meu = saldos.find((s) => s.usuario_id === usuarioId);
  const pagar = acertos.filter((a) => a.de === usuarioId);
  const receber = acertos.filter((a) => a.para === usuarioId);

  // Quem saiu do grupo continua nas contas das despesas de que participou (saiu: true na API)
  const sairam = new Set(saldos.filter((s) => s.saiu).map((s) => s.usuario_id));
  const nomeNaConta = (id, usuario) => `${nomeDe(usuario)}${sairam.has(id) ? ' (saiu)' : ''}`;

  return (
    <View style={styles.container}>
      <View style={styles.caixas}>
        <CaixaResumo
          rotulo="Total da viagem"
          valor={moeda(total)}
          sub={`${totalDespesas} ${totalDespesas === 1 ? 'despesa' : 'despesas'}`}
        />
        <CaixaResumo
          rotulo="Por integrante"
          valor={moeda(porPessoa)}
          sub={`média entre ${saldos.length - sairam.size}`}
        />
      </View>

      {meu ? <MinhaSituacao saldo={meu} pagar={pagar} receber={receber} nomeNaConta={nomeNaConta} /> : null}

      <View>
        <Text style={styles.rotulo}>Acerto de contas</Text>
        {acertos.length === 0 ? (
          <Text style={styles.quite}>Ninguém deve nada a ninguém. As contas estão zeradas.</Text>
        ) : (
          acertos.map((a) => {
            const euPago = a.de === usuarioId;
            const euRecebo = a.para === usuarioId;
            return (
              <View
                key={`${a.de}-${a.para}`}
                style={[styles.acerto, euPago && styles.linhaPagar, euRecebo && styles.linhaReceber]}
              >
                <Text style={[styles.acertoTexto, (euPago || euRecebo) && styles.textoMeu]}>
                  <Text style={styles.forte}>{euPago ? 'Você' : nomeNaConta(a.de, a.de_usuario)}</Text>
                  {' paga para '}
                  <Text style={styles.forte}>{euRecebo ? 'você' : nomeNaConta(a.para, a.para_usuario)}</Text>
                </Text>
                <Text style={[styles.acertoValor, euPago && styles.pagar, euRecebo && styles.receber]}>
                  {moeda(a.valor)}
                </Text>
              </View>
            );
          })
        )}
      </View>

      <View>
        <Text style={styles.rotulo}>Saldo de cada um</Text>
        {saldos.map((s) => {
          const credor = s.saldo > CENTAVO;
          const devedor = s.saldo < -CENTAVO;
          const eu = s.usuario_id === usuarioId;
          return (
            <View key={s.usuario_id} style={[styles.pessoa, eu && styles.pessoaEu]}>
              <Avatar nome={s.usuario?.nome} fotoUri={s.usuario?.foto_url} tamanho={32} />
              <View style={styles.textos}>
                <Text style={[styles.nome, eu && styles.nomeEu]} numberOfLines={1}>
                  {eu ? 'Você' : nomeNaConta(s.usuario_id, s.usuario)}
                </Text>
                <Text style={styles.sub}>
                  pagou {moeda(s.pago)} · parte {moeda(s.devido)}
                </Text>
              </View>
              <View style={styles.saldo}>
                <Text style={[styles.saldoValor, credor && styles.receber, devedor && styles.pagar, eu && styles.saldoEu]}>
                  {moeda(Math.abs(s.saldo))}
                </Text>
                <Text style={styles.saldoRotulo}>{credor ? 'a receber' : devedor ? 'a pagar' : 'quite'}</Text>
              </View>
            </View>
          );
        })}
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
  acertoTexto: { flex: 1, fontFamily: fonts.corpo, fontSize: 14, color: colors.suave },
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
  saldo: { alignItems: 'flex-end' },
  saldoValor: { fontFamily: fonts.monoMedio, fontSize: 14, color: colors.suave },
  saldoEu: { fontFamily: fonts.monoForte, fontSize: 15 },
  saldoRotulo: { fontFamily: fonts.corpo, fontSize: 11, color: colors.tenue },

  receber: { color: colors.ok },
  pagar: { color: colors.acento },
});
