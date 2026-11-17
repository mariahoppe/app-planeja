import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { PainelInferior } from '../../../components/molecules/PainelInferior';
import { colors, fonts } from '../../../config/theme';
import { NotaSlider } from '../../ranking/components/NotaSlider';
import { validarAvaliacao } from '../../ranking/notas';
import * as avaliacaoService from '../../ranking/services/avaliacaoService';

/**
 * Painel "Avaliar <cidade>" do detalhe da dica: dá a nota de custo-benefício do destino
 * da dica, na mesma escala de 0 a 10 do Ranking (o protótipo usava estrelas aqui).
 * onRegistrada: chamada depois que a API grava a nota.
 */
export function PainelAvaliar({ dica, onFechar, onRegistrada }) {
  const [nota, setNota] = useState(null);
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);

  function escolher(valor) {
    setNota(valor);
    setErro(null);
  }

  async function registrar() {
    // O aviso fica no próprio slider: um toast apareceria atrás do painel.
    const e = validarAvaliacao({ cidade: dica.cidade, pais: dica.pais, nota });
    if (e.nota) {
      setErro(e.nota);
      return;
    }

    try {
      setSalvando(true);
      // Se a pessoa já avaliou esse destino, a API só troca a nota.
      await avaliacaoService.registrar({ cidade: dica.cidade, pais: dica.pais, escopo: dica.escopo, nota });
      onRegistrada();
    } catch (err) {
      Alert.alert('Não foi possível registrar', err.message);
      setSalvando(false);
    }
  }

  return (
    <PainelInferior
      titulo={`Avaliar ${dica.cidade}`}
      onFechar={onFechar}
      rodape={
        <Button titulo="Registrar avaliação" variante="primario" bloco carregando={salvando} onPress={registrar} />
      }
    >
      <Text style={styles.nota}>
        Custo-benefício de {dica.cidade}, {dica.pais}
      </Text>
      <NotaSlider valor={nota} onChange={escolher} erro={erro} />
    </PainelInferior>
  );
}

const styles = StyleSheet.create({
  nota: {
    fontFamily: fonts.corpo,
    fontSize: 11.5,
    fontStyle: 'italic',
    color: colors.suave,
    textAlign: 'center',
    marginTop: 2,
  },
});
