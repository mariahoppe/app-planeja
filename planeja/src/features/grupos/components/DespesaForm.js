import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../../../components/atoms/Avatar';
import { Button } from '../../../components/atoms/Button';
import { InputMoeda } from '../../../components/atoms/InputMoeda';
import { DatePicker } from '../../../components/molecules/DatePicker';
import { FormField } from '../../../components/molecules/FormField';
import { SeletorSegmentado } from '../../../components/molecules/SeletorSegmentado';
import { colors, fonts } from '../../../config/theme';
import { paraCentavos } from '../../../utils/moeda';
import {
  CATEGORIAS,
  dividirIgual,
  hojeISO,
  MAX_DESCRICAO,
  MODOS_DIVISAO,
  somaRateio,
  validarDespesa,
} from '../despesas';
import { moeda } from '../formatos';

const reais = (centavos) => moeda(centavos / 100);

/**
 * Campos e validação da despesa (RF-21 e RF-22). Quem fala com a API é a tela:
 * aqui o formulário só chama onSubmit com os dados prontos para enviar.
 * membros: integrantes atuais do grupo ({ usuario_id, usuario }).
 * despesa: a despesa a editar; sem ela, o formulário começa com "paguei eu, hoje".
 *
 * Ao editar, quem já saiu do grupo mas está no rateio (ou foi quem pagou)
 * continua no formulário: sair do grupo não apaga as despesas da pessoa.
 */
export function DespesaForm({ membros, usuarioId, despesa, onSubmit, carregando = false, desabilitado = false }) {
  const editando = Boolean(despesa);
  const ids = membros.map((m) => m.usuario_id);
  const rateioGravado = despesa?.rateios ?? [];

  // Integrantes atuais + quem saiu mas ainda está no rateio desta despesa
  const pessoas = [
    ...membros,
    ...rateioGravado
      .filter((r) => !ids.includes(r.usuario_id))
      .map((r) => ({ usuario_id: r.usuario_id, usuario: r.usuario, saiu: true })),
  ];
  const pagadorSaiu = editando && !ids.includes(despesa.pagador_id);
  const pagadores = pagadorSaiu
    ? [...membros, { usuario_id: despesa.pagador_id, usuario: despesa.pagador, saiu: true }]
    : membros;

  const [descricao, setDescricao] = useState(despesa?.descricao ?? '');
  const [totalCentavos, setTotalCentavos] = useState(editando ? paraCentavos(despesa.valor) : null);
  const [data, setData] = useState(despesa?.data ?? hojeISO());
  const [pagadorId, setPagadorId] = useState(despesa?.pagador_id ?? usuarioId);
  const [categoria, setCategoria] = useState(despesa?.categoria ?? 'alimentacao');
  const [modo, setModo] = useState(despesa?.modo_divisao ?? 'igual');
  const [valores, setValores] = useState(() => {
    const inicial = {};
    pessoas.forEach(({ usuario_id: id }) => {
      const r = rateioGravado.find((x) => x.usuario_id === id);
      inicial[id] = r ? paraCentavos(r.valor_devido) : null;
    });
    return inicial;
  });
  const [erros, setErros] = useState({});

  // Na divisão igual, a API só redivide se o valor ou o modo mudarem; senão a divisão
  // gravada continua valendo, e é ela que o formulário mostra.
  const mantemDivisao =
    editando &&
    despesa.modo_divisao === 'igual' &&
    modo === 'igual' &&
    totalCentavos === paraCentavos(despesa.valor);
  const porPessoa = mantemDivisao
    ? Object.fromEntries(rateioGravado.map((r) => [r.usuario_id, paraCentavos(r.valor_devido)]))
    : dividirIgual(totalCentavos, ids);
  const naDivisaoIgual = mantemDivisao ? pessoas.filter((p) => p.usuario_id in porPessoa) : membros;
  const naLista = modo === 'igual' ? naDivisaoIgual : pessoas;

  const nomeDe = (p) => (p.usuario_id === usuarioId ? 'Você' : `${p.usuario?.nome ?? 'Integrante'}${p.saiu ? ' (saiu)' : ''}`);

  function limparErro(campo) {
    if (erros[campo]) setErros((atual) => ({ ...atual, [campo]: undefined }));
  }

  // Ao mudar para personalizada sem nada digitado, parte da divisão igual: é só ajustar.
  function mudarModo(novo) {
    setModo(novo);
    limparErro('rateio');
    const vazio = Object.values(valores).every((c) => c == null);
    if (novo === 'personalizada' && vazio && totalCentavos != null) {
      const preenchido = {};
      pessoas.forEach(({ usuario_id: id }) => { preenchido[id] = porPessoa[id] ?? 0; });
      setValores(preenchido);
    }
  }

  function salvar() {
    const e = validarDespesa({ descricao, totalCentavos, data, pagadorId, modo, valores });
    setErros(e);
    if (Object.keys(e).length > 0) return;

    const dados = {
      descricao: descricao.trim(),
      valor: totalCentavos / 100,
      data,
      pagador_id: pagadorId,
      categoria,
      modo_divisao: modo,
    };
    if (modo === 'personalizada') {
      dados.rateio = pessoas.map(({ usuario_id: id }) => ({
        usuario_id: id,
        valor_devido: (valores[id] ?? 0) / 100,
      }));
    }
    onSubmit(dados);
  }

  const soma = somaRateio(valores);

  return (
    <>
      <FormField
        label="Descrição"
        placeholder="Jantar no bistrô"
        value={descricao}
        onChangeText={(t) => { setDescricao(t); limparErro('descricao'); }}
        maxLength={MAX_DESCRICAO}
        erro={erros.descricao}
      />

      <View style={styles.grid2}>
        <FormField label="Valor total" erro={erros.valor} style={styles.coluna}>
          <InputMoeda
            centavos={totalCentavos}
            onChange={(c) => { setTotalCentavos(c); limparErro('valor'); }}
            erro={Boolean(erros.valor)}
            accessibilityLabel="Valor total"
          />
        </FormField>
        <FormField label="Data" erro={erros.data} style={styles.coluna}>
          <DatePicker value={data} onChange={setData} invalid={Boolean(erros.data)} accessibilityLabel="Data da despesa" />
        </FormField>
      </View>

      <FormField label="Quem pagou" erro={erros.pagador}>
        <View style={styles.opcoes}>
          {pagadores.map((m) => (
            <Button
              key={m.usuario_id}
              titulo={m.usuario_id === usuarioId ? 'Eu' : nomeDe(m)}
              pequeno
              variante={pagadorId === m.usuario_id ? 'primario' : 'secundario'}
              onPress={() => { setPagadorId(m.usuario_id); limparErro('pagador'); }}
            />
          ))}
        </View>
      </FormField>

      <FormField label="Categoria">
        <View style={styles.opcoes}>
          {CATEGORIAS.map((c) => (
            <Button
              key={c.valor}
              titulo={c.rotulo}
              pequeno
              variante={categoria === c.valor ? 'primario' : 'secundario'}
              onPress={() => setCategoria(c.valor)}
            />
          ))}
        </View>
      </FormField>

      <FormField
        label="Divisão"
        erro={erros.rateio}
        dica={
          modo === 'igual'
            ? mantemDivisao
              ? 'Mantém a divisão de quando a despesa foi lançada; mude o valor para redividir'
              : `Entre os ${ids.length} integrantes do grupo`
            : 'Informe quanto cada pessoa deve; a soma precisa fechar com o valor'
        }
      >
        <SeletorSegmentado opcoes={MODOS_DIVISAO} valor={modo} onChange={mudarModo} />
      </FormField>

      <View style={styles.rateio}>
        {naLista.map((m) => (
          <View key={m.usuario_id} style={styles.pessoa}>
            <Avatar nome={m.usuario?.nome} fotoUri={m.usuario?.foto_url} tamanho={32} />
            <Text style={styles.nome} numberOfLines={1}>
              {nomeDe(m)}
            </Text>
            {modo === 'igual' ? (
              <Text style={styles.parte}>{totalCentavos == null ? '—' : reais(porPessoa[m.usuario_id] ?? 0)}</Text>
            ) : (
              <InputMoeda
                centavos={valores[m.usuario_id]}
                onChange={(c) => {
                  setValores((atual) => ({ ...atual, [m.usuario_id]: c }));
                  limparErro('rateio');
                }}
                accessibilityLabel={`Valor de ${m.usuario?.nome}`}
                erro={Boolean(erros.rateio)}
                style={styles.campoParte}
              />
            )}
          </View>
        ))}
        {modo === 'personalizada' ? (
          <Text style={styles.soma}>
            Soma {reais(soma)} de {totalCentavos == null ? '—' : reais(totalCentavos)}
          </Text>
        ) : null}
      </View>

      <Button
        titulo={editando ? 'Salvar alterações' : 'Registrar despesa'}
        variante="primario"
        bloco
        carregando={carregando}
        desabilitado={desabilitado}
        onPress={salvar}
      />
    </>
  );
}

const styles = StyleSheet.create({
  grid2: { flexDirection: 'row', gap: 10 },
  coluna: { flex: 1 },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rateio: { gap: 2, marginTop: -6 },
  pessoa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.linhaSuave,
  },
  nome: { flex: 1, fontFamily: fonts.corpoSemi, fontSize: 14, color: colors.tinta },
  parte: { fontFamily: fonts.mono, fontSize: 13.5, color: colors.tinta },
  campoParte: { width: 110, minHeight: 44, paddingVertical: 10, textAlign: 'right', fontFamily: fonts.mono },
  soma: { fontFamily: fonts.mono, fontSize: 12, color: colors.suave, textAlign: 'right', marginTop: 6 },
});
