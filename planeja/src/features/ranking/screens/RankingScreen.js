import { EmptyState } from '../../../components/molecules/EmptyState';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';

// PROVISÓRIA: será substituída pela listagem de Ranking (Fase 3).
export function RankingScreen() {
  return (
    <ScreenTemplate sobretitulo="Comunidade" titulo="Ranking">
      <EmptyState titulo="Em construção" mensagem="Esta seção chega na Fase 3." />
    </ScreenTemplate>
  );
}
