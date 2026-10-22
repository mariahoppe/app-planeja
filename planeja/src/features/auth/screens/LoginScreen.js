import { useState } from 'react';

import { Button } from '../../../components/atoms/Button';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { useAuth } from '../../../contexts/AuthContext';

// PROVISÓRIA: só testa a navegação. O formulário de verdade vem na próxima etapa.
export function LoginScreen({ navigation }) {
  const { entrar } = useAuth();
  const [carregando, setCarregando] = useState(false);

  async function entrarComoTeste() {
    setCarregando(true);
    try {
      await entrar('maria@planeja.app', 'planeja123');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScreenTemplate sobretitulo="Bem-vinda" titulo="Entrar">
      <Button titulo="Entrar (teste)" variante="primario" bloco carregando={carregando} onPress={entrarComoTeste} />
      <Button titulo="Criar conta" bloco onPress={() => navigation.navigate('Cadastro')} />
      <Button titulo="Esqueci a senha" bloco onPress={() => navigation.navigate('EsqueciSenha')} />
    </ScreenTemplate>
  );
}
