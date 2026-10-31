import { Linking, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { CaixaResumo } from '../../../components/molecules/CaixaResumo';
import { FormField } from '../../../components/molecules/FormField';
import { PainelInferior } from '../../../components/molecules/PainelInferior';
import { colors, fonts } from '../../../config/theme';
import { horaCurta, moeda } from '../../inicio/formatos';
import { dataBR, dataDoDia } from '../datas';

// Painel que abre ao tocar numa atividade: data, custo, local, link e observações.
export function AtividadeDetalhe({ atividade, roteiro, onFechar, onEditar }) {
  const { titulo, dia, horario, custo, feita, local, link, obs } = atividade;

  return (
    <PainelInferior
      titulo={titulo}
      onFechar={onFechar}
      rodape={<Button titulo="Editar atividade" variante="primario" bloco onPress={onEditar} />}
    >
      <View style={styles.stats}>
        <CaixaResumo rotulo="Data" valor={dataBR(dataDoDia(roteiro.inicio, dia))} sub={horaCurta(horario)} />
        <CaixaResumo
          rotulo="Custo"
          valor={Number(custo) ? moeda(custo) : 'Grátis'}
          sub={feita ? 'Concluída' : 'Pendente'}
        />
      </View>

      <FormField label="Local">
        <Text style={styles.nota}>{local || 'Local a definir'}</Text>
      </FormField>

      <FormField label="Link de compra">
        {link ? (
          <Text style={styles.link} accessibilityRole="link" onPress={() => Linking.openURL(link)}>
            {link}
          </Text>
        ) : (
          <Text style={styles.nota}>Nenhum</Text>
        )}
      </FormField>

      <FormField label="Observações">
        <Text style={styles.nota}>{obs || 'Nenhuma'}</Text>
      </FormField>
    </PainelInferior>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 10 },
  nota: { fontFamily: fonts.corpo, fontSize: 11.5, fontStyle: 'italic', color: colors.suave },
  link: { fontFamily: fonts.corpo, fontSize: 11.5, fontStyle: 'italic', color: colors.acento, textDecorationLine: 'underline' },
});
