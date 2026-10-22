import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { Card } from '../../../components/atoms/Card';
import { EmptyState } from '../../../components/molecules/EmptyState';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import * as grupoService from '../services/grupoService';

export function GruposScreen() {
  const [grupos, setGrupos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await grupoService.listar();
        setGrupos(dados || []);
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  return (
    <ScreenTemplate sobretitulo="Viagens em grupo" titulo="Grupos">
      {carregando ? (
        <ActivityIndicator color={colors.acento} />
      ) : erro ? (
        <Text style={styles.erro}>{erro}</Text>
      ) : grupos.length === 0 ? (
        <EmptyState
          titulo="Nenhum grupo ainda"
          mensagem="Crie um grupo para uma viagem ou entre com um código de convite."
        />
      ) : (
        grupos.map((item) => (
          <Card key={item.id}>
            <Text style={styles.titulo}>{item.nome}</Text>
            <Text style={styles.sub}>
              {item.total_integrantes} integrante(s) · R$ {Number(item.total_gasto).toFixed(2)}
            </Text>
          </Card>
        ))
      )}
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  titulo: { fontFamily: fonts.tituloMedio, fontSize: 16, color: colors.tinta },
  sub: { fontFamily: fonts.corpo, fontSize: 13, color: colors.suave },
  erro: { fontFamily: fonts.corpo, fontSize: 14, color: colors.acento },
});
