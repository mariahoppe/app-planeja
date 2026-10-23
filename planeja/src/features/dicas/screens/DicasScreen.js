import { EmptyState } from '../../../components/molecules/EmptyState';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';

// PROVISÓRIA: será substituída pela listagem de Dicas (Fase 3).
export function DicasScreen() {
  return (
    <ScreenTemplate sobretitulo="Comunidade" titulo="Dicas">
      <EmptyState titulo="Em construção" mensagem="Esta seção chega na Fase 3." />
    </ScreenTemplate>
  );
}
