import { EmptyState } from '../../../components/molecules/EmptyState';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';

// PROVISÓRIA: será substituída pela listagem de Roteiros (Fase 2).
export function RoteirosScreen() {
  return (
    <ScreenTemplate sobretitulo="Minhas viagens" titulo="Roteiros">
      <EmptyState titulo="Em construção" mensagem="Esta seção chega na Fase 2." />
    </ScreenTemplate>
  );
}
