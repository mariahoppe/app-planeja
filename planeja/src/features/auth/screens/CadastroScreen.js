import { EmptyState } from '../../../components/molecules/EmptyState';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';

// PROVISÓRIA: só testa a navegação. O formulário de verdade vem na próxima etapa.
export function CadastroScreen({ navigation }) {
  return (
    <ScreenTemplate titulo="Criar conta" aoVoltar={() => navigation.goBack()}>
      <EmptyState titulo="Em construção" mensagem="Aqui vai o formulário de cadastro." />
    </ScreenTemplate>
  );
}
