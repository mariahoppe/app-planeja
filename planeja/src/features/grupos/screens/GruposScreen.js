import { EmptyState } from '../../../components/molecules/EmptyState';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';

// PROVISÓRIA: será substituída pela listagem de Grupos (Fase 3).
export function GruposScreen() {
  return (
    <ScreenTemplate sobretitulo="Viagens em grupo" titulo="Grupos">
      <EmptyState titulo="Em construção" mensagem="Esta seção chega na Fase 3." />
    </ScreenTemplate>
  );
}
