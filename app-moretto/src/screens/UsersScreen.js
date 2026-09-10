/**
 * SCREEN — UsersScreen (seguir pessoas)
 */
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Label } from '../components/atoms/Label';
import { UserList } from '../components/organisms/UserList';
import {
  deixarDeSeguir,
  listarUsuarios,
  seguirUsuario,
} from '../services/usuario';
import { cores, espacamentos } from '../theme';

export function UsersScreen({ navigation }) {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [idCarregando, setIdCarregando] = useState(null);

  const carregar = useCallback(async () => {
    try {
      const rows = await listarUsuarios();
      setUsuarios(rows || []);
    } catch (e) {
      Alert.alert('Erro', e.message);
      if (e.status === 401) navigation.replace('Login');
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      setCarregando(true);
      carregar();
    }, [carregar]),
  );

  const handleToggle = useCallback(async usuario => {
    setIdCarregando(usuario.id);
    try {
      if (usuario.seguindo) {
        await deixarDeSeguir(usuario.id);
      } else {
        await seguirUsuario(usuario.id);
      }
      setUsuarios(atual =>
        atual.map(u =>
          u.id === usuario.id ? { ...u, seguindo: !u.seguindo } : u,
        ),
      );
    } catch (e) {
      Alert.alert('Erro', e.message);
    } finally {
      setIdCarregando(null);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    carregar();
  }, [carregar]);

  return (
    <View style={styles.flex}>
      <Label variante="legenda" style={styles.dica}>
        Siga pessoas para ver as postagens delas no feed e poder responder.
      </Label>
      <UserList
        usuarios={usuarios}
        carregando={carregando}
        refreshing={refreshing}
        idCarregando={idCarregando}
        onToggleSeguir={handleToggle}
        onRefresh={handleRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: cores.fundo },
  dica: {
    paddingHorizontal: espacamentos.lg,
    paddingTop: espacamentos.md,
  },
});
