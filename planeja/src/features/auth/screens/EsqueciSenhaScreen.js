import { EmptyState } from '../../../components/molecules/EmptyState';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';

// PROVISÓRIA: só testa a navegação. O formulário de verdade vem na próxima etapa.
export function EsqueciSenhaScreen({ navigation }) {
  return (
    <ScreenTemplate titulo="Esqueci a senha" aoVoltar={() => navigation.goBack()}>
      <EmptyState titulo="Em construção" mensagem="Aqui vai o campo de email para recuperar a senha." />
    </ScreenTemplate>
  );
}
