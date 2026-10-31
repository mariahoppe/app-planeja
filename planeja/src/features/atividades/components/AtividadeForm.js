import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { Input } from '../../../components/atoms/Input';
import { DatePicker } from '../../../components/molecules/DatePicker';
import { FormField } from '../../../components/molecules/FormField';
import { horaCurta } from '../../inicio/formatos';
import { dataBR, dataDoDia, diaDaData, mascaraHorario } from '../datas';
import { lerCusto, validarAtividade } from '../validacao';

/**
 * Campos e validação da atividade. Quem fala com a API é a tela:
 * aqui o formulário só chama onSubmit com os dados prontos para enviar.
 * atividade: a atividade a editar; sem ela, o formulário começa vazio.
 */
export function AtividadeForm({ roteiro, atividade, onSubmit, carregando = false, desabilitado = false }) {
  const editando = Boolean(atividade);

  const [titulo, setTitulo] = useState(atividade?.titulo ?? '');
  const [data, setData] = useState(editando ? dataDoDia(roteiro.inicio, atividade.dia) : roteiro.inicio);
  const [horario, setHorario] = useState(horaCurta(atividade?.horario) ?? '');
  const [local, setLocal] = useState(atividade?.local ?? '');
  const [custo, setCusto] = useState(editando ? String(Number(atividade.custo)).replace('.', ',') : '');
  const [link, setLink] = useState(atividade?.link ?? '');
  const [obs, setObs] = useState(atividade?.obs ?? '');
  const [erros, setErros] = useState({});

  function salvar() {
    const e = validarAtividade({ titulo, data, horario, custo, link }, roteiro);
    setErros(e);
    if (Object.keys(e).length > 0) return;

    // Opcionais vazios vão como null: o banco só aceita link nulo ou começando com http.
    onSubmit({
      titulo: titulo.trim(),
      dia: diaDaData(roteiro.inicio, data),
      horario: horario.trim(),
      local: local.trim() || null,
      custo: lerCusto(custo),
      link: link.trim() || null,
      obs: obs.trim() || null,
    });
  }

  return (
    <>
      <FormField
        label="O que fazer"
        placeholder="Museu do Louvre"
        value={titulo}
        onChangeText={setTitulo}
        maxLength={120}
        erro={erros.titulo}
      />

      <View style={styles.grid2}>
        <FormField
          label="Data"
          erro={erros.data}
          dica={`${dataBR(roteiro.inicio)} a ${dataBR(roteiro.fim)}`}
          style={styles.coluna}
        >
          <DatePicker
            value={data}
            onChange={setData}
            min={roteiro.inicio}
            max={roteiro.fim}
            invalid={Boolean(erros.data)}
          />
        </FormField>

        <FormField
          label="Horário"
          placeholder="10:00"
          value={horario}
          onChangeText={(texto) => setHorario(mascaraHorario(texto))}
          keyboardType="number-pad"
          maxLength={5}
          erro={erros.horario}
          style={styles.coluna}
        />
      </View>

      <FormField
        label="Local"
        placeholder="Rue de Rivoli"
        value={local}
        onChangeText={setLocal}
        maxLength={150}
      />

      <FormField
        label="Custo previsto"
        dica="Deixe zero para atividades gratuitas"
        placeholder="0"
        value={custo}
        onChangeText={setCusto}
        keyboardType="decimal-pad"
        erro={erros.custo}
      />

      <FormField
        label="Link (opcional)"
        dica="Onde a atividade foi comprada, ex: ingresso ou passagem"
        placeholder="https://..."
        value={link}
        onChangeText={setLink}
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
        erro={erros.link}
      />

      <FormField label="Observações">
        <Input
          placeholder="Detalhes extras sobre a atividade"
          value={obs}
          onChangeText={setObs}
          multiline
          accessibilityLabel="Observações"
          style={styles.area}
        />
      </FormField>

      <Button
        titulo={editando ? 'Salvar alterações' : 'Adicionar atividade'}
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
  area: { minHeight: 84, textAlignVertical: 'top' },
});
