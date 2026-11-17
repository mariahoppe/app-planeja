import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../../../components/atoms/Avatar';
import { Button } from '../../../components/atoms/Button';
import { Input } from '../../../components/atoms/Input';
import { DatePicker } from '../../../components/molecules/DatePicker';
import { FormField } from '../../../components/molecules/FormField';
import { SeletorSegmentado } from '../../../components/molecules/SeletorSegmentado';
import { colors, fonts } from '../../../config/theme';
import {
  CATEGORIAS,
  dividirIgual,
  hojeISO,
  lerValor,
  MAX_DESCRICAO,
  MODOS_DIVISAO,
  somaRateio,
  textoValor,
  validarDespesa,
} from '../despesas';
import { moeda } from '../formatos';

/**
 * Campos e validação da despesa (RF-21 e RF-22). Quem fala com a API é a tela:
 * aqui o formulário só chama onSubmit com os dados prontos para enviar.
 * membros: integrantes atuais do grupo ({ usuario_id, usuario }).
 * despesa: a despesa a editar; sem ela, o formulário começa com "paguei eu, hoje".
 */
export function DespesaForm({ membros, usuarioId, despesa, onSubmit, carregando = false, desabilitado = false }) {
  const editando = Boolean(despesa);
  const ids = membros.map((m) => m.usuario_id);

  const [descricao, setDescricao] = useState(despesa?.descricao ?? '');
  const [valor, setValor] = useState(editando ? textoValor(despesa.valor) : '');
  const [data, setData] = useState(despesa?.data ?? hojeISO());
  const [pagadorId, setPagadorId] = useState(despesa?.pagador_id ?? usuarioId);
  const [categoria, setCategoria] = useState(despesa?.categoria ?? 'outros');
  const [modo, setModo] = useState(despesa?.modo_divisao ?? 'igual');
  const [valores, setValores] = useState(() => {
    const inicial = {};
    ids.forEach((id) => {
      const r = despesa?.rateios?.find((x) => x.usuario_id === id);
      inicial[id] = r ? textoValor(r.valor_devido) : '';
    });
    return inicial;
  });
  const [erros, setErros] = useState({});

  const total = lerValor(valor);
  const porPessoa = dividirIgual(total, ids);

  function limparErro(campo) {
    if (erros[campo]) setErros((atual) => ({ ...atual, [campo]: undefined }));
  }

  // Ao mudar para personalizada sem nada digitado, parte da divisão igual: é só ajustar.
  function mudarModo(novo) {
    setModo(novo);
    limparErro('rateio');
    const vazio = Object.values(valores).every((t) => !String(t).trim());
    if (novo === 'personalizada' && vazio && !Number.isNaN(total)) {
      const preenchido = {};
      ids.forEach((id) => { preenchido[id] = textoValor(porPessoa[id] ?? 0); });
      setValores(preenchido);
    }
  }

  function salvar() {
    const e = validarDespesa({ descricao, valor, data, pagadorId, modo, valores });
    setErros(e);
    if (Object.keys(e).length > 0) return;

    const dados = {
      descricao: descricao.trim(),
      valor: total,
      data,
      pagador_id: pagadorId,
      categoria,
      modo_divisao: modo,
    };
    if (modo === 'personalizada') {
      dados.rateio = ids.map((id) => {
        const v = lerValor(valores[id]);
        return { usuario_id: id, valor_devido: Number.isNaN(v) ? 0 : v };
      });
    }
    onSubmit(dados);
  }

  const soma = somaRateio(valores);

  return (
    <>
      <FormField
        label="Descrição"
        placeholder="Jantar no Bairro Alto"
        value={descricao}
        onChangeText={(t) => { setDescricao(t); limparErro('descricao'); }}
        maxLength={MAX_DESCRICAO}
        erro={erros.descricao}
      />

      <View style={styles.grid2}>
        <FormField
          label="Valor (R$)"
          placeholder="0,00"
          value={valor}
          onChangeText={(t) => { setValor(t); limparErro('valor'); }}
          keyboardType="decimal-pad"
          erro={erros.valor}
          style={styles.coluna}
        />
        <FormField label="Data" erro={erros.data} style={styles.coluna}>
          <DatePicker value={data} onChange={setData} invalid={Boolean(erros.data)} accessibilityLabel="Data da despesa" />
        </FormField>
      </View>

      <FormField label="Quem pagou" erro={erros.pagador}>
        <View style={styles.opcoes}>
          {membros.map((m) => (
            <Button
              key={m.usuario_id}
              titulo={m.usuario_id === usuarioId ? 'Eu' : m.usuario?.nome ?? 'Integrante'}
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
            ? `Entre os ${ids.length} integrantes do grupo`
            : 'Informe quanto cada pessoa deve; a soma precisa fechar com o valor'
        }
      >
        <SeletorSegmentado opcoes={MODOS_DIVISAO} valor={modo} onChange={mudarModo} />
      </FormField>

      <View style={styles.rateio}>
        {membros.map((m) => (
          <View key={m.usuario_id} style={styles.pessoa}>
            <Avatar nome={m.usuario?.nome} fotoUri={m.usuario?.foto_url} tamanho={32} />
            <Text style={styles.nome} numberOfLines={1}>
              {m.usuario_id === usuarioId ? 'Você' : m.usuario?.nome}
            </Text>
            {modo === 'igual' ? (
              <Text style={styles.parte}>{Number.isNaN(total) ? '—' : moeda(porPessoa[m.usuario_id])}</Text>
            ) : (
              <Input
                value={valores[m.usuario_id]}
                onChangeText={(t) => {
                  setValores((atual) => ({ ...atual, [m.usuario_id]: t }));
                  limparErro('rateio');
                }}
                placeholder="0,00"
                keyboardType="decimal-pad"
                accessibilityLabel={`Valor de ${m.usuario?.nome}`}
                erro={Boolean(erros.rateio)}
                style={styles.campoParte}
              />
            )}
          </View>
        ))}
        {modo === 'personalizada' ? (
          <Text style={styles.soma}>
            Soma {moeda(soma)} de {Number.isNaN(total) ? '—' : moeda(total)}
          </Text>
        ) : null}
      </View>

      <Button
        titulo={editando ? 'Salvar alterações' : 'Adicionar despesa'}
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
