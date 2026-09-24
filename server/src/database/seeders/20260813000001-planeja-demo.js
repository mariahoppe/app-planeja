'use strict';

const bcrypt = require('bcryptjs');

/**
 * Dados de exemplo do Planeja — os mesmos do protótipo mobile (SEED em
 * "Planeja · dados de exemplo e cálculos"), para que o app abra com conteúdo
 * reconhecível: Paris, Lisboa, Florianópolis, com dicas, avaliações, grupos e
 * despesas já lançadas.
 *
 * Senha de todas as contas: planeja123
 */

const agora = new Date();
const ts = { created_at: agora, updated_at: agora };

// Os ids são explícitos para manter os relacionamentos legíveis. Por isso o
// up() termina reposicionando as sequences — sem isso o primeiro INSERT feito
// pela API tentaria reusar o id 1 e estouraria a primary key.
const TABELAS = [
  'usuarios', 'destinos', 'roteiros', 'atividades', 'dicas', 'dica_fotos',
  'avaliacoes_destino', 'grupos', 'grupo_membros', 'despesas', 'despesa_rateios'
];

module.exports = {
  async up(queryInterface) {
    const senha = await bcrypt.hash('planeja123', 12);

    await queryInterface.bulkInsert('usuarios', [
      { id: 1, nome: 'Maria Hoppe', email: 'maria@planeja.app', senha_hash: senha, perfil: 'admin', ...ts },
      { id: 2, nome: 'Mario Neto', email: 'mario@planeja.app', senha_hash: senha, perfil: 'comum', ...ts },
      { id: 3, nome: 'Ana Vitória', email: 'ana@planeja.app', senha_hash: senha, perfil: 'comum', ...ts },
      { id: 4, nome: 'Bruno Alves', email: 'bruno@planeja.app', senha_hash: senha, perfil: 'comum', ...ts },
      { id: 5, nome: 'Clara Souza', email: 'clara@planeja.app', senha_hash: senha, perfil: 'comum', ...ts }
    ]);

    await queryInterface.bulkInsert('destinos', [
      { id: 1, usuario_id: 1, cidade: 'Paris', pais: 'França', escopo: 'internacional', periodo: 'Abril 2026', obs: 'Foco em museus e bairros a pé.', ...ts },
      { id: 2, usuario_id: 1, cidade: 'Lisboa', pais: 'Portugal', escopo: 'internacional', periodo: 'Setembro 2026', obs: 'Viagem em família, ritmo tranquilo.', ...ts },
      { id: 3, usuario_id: 1, cidade: 'Florianópolis', pais: 'Brasil', escopo: 'nacional', periodo: 'Janeiro 2027', obs: 'Praias do norte da ilha.', ...ts },
      { id: 4, usuario_id: 1, cidade: 'Buenos Aires', pais: 'Argentina', escopo: 'internacional', periodo: 'A definir', obs: null, ...ts }
    ]);

    await queryInterface.bulkInsert('roteiros', [
      { id: 1, destino_id: 1, titulo: 'Paris em 5 dias', inicio: '2026-04-12', fim: '2026-04-17', status: 'confirmado', obs: null, ...ts },
      { id: 2, destino_id: 2, titulo: 'Lisboa com a família', inicio: '2026-09-03', fim: '2026-09-10', status: 'planejando', obs: null, ...ts },
      { id: 3, destino_id: 3, titulo: 'Verão na ilha', inicio: '2027-01-08', fim: '2027-01-15', status: 'planejando', obs: null, ...ts }
    ]);

    await queryInterface.bulkInsert('atividades', [
      { id: 1, roteiro_id: 1, dia: 1, horario: '10:00', titulo: 'Museu do Louvre', local: 'Rue de Rivoli', custo: 22, link: null, obs: null, feita: true, ...ts },
      { id: 2, roteiro_id: 1, dia: 1, horario: '16:30', titulo: 'Jardim das Tulherias', local: 'Place de la Concorde', custo: 0, link: null, obs: null, feita: true, ...ts },
      { id: 3, roteiro_id: 1, dia: 2, horario: '09:00', titulo: 'Torre Eiffel', local: 'Champ de Mars', custo: 29, link: 'https://www.toureiffel.paris/fr/billets', obs: 'Comprar com antecedência, a fila no local é enorme.', feita: false, ...ts },
      { id: 4, roteiro_id: 1, dia: 2, horario: '13:00', titulo: 'Almoço no Marais', local: 'Rue des Rosiers', custo: 35, link: null, obs: null, feita: false, ...ts },
      { id: 5, roteiro_id: 1, dia: 3, horario: '11:00', titulo: 'Montmartre a pé', local: 'Sacré-Cœur', custo: 0, link: null, obs: 'Subir de funicular se estiver quente.', feita: false, ...ts },
      { id: 6, roteiro_id: 2, dia: 1, horario: '15:00', titulo: 'Bairro de Alfama', local: 'Miradouro de Santa Luzia', custo: 0, link: null, obs: null, feita: false, ...ts },
      { id: 7, roteiro_id: 2, dia: 2, horario: '10:30', titulo: 'Mosteiro dos Jerónimos', local: 'Belém', custo: 12, link: null, obs: null, feita: false, ...ts }
    ]);

    // A data de publicação exibida ("por Ana · mar 2026") vem de created_at
    const publicadaEm = (iso) => ({ created_at: new Date(iso), updated_at: new Date(iso) });

    await queryInterface.bulkInsert('dicas', [
      {
        id: 1, autor_id: 3, pais: 'França', cidade: 'Paris', escopo: 'internacional',
        onde_comer: 'Chez Janou, no Marais, para almoço sem fila antes do meio-dia. Padarias de bairro custam metade do preço das cafeterias turísticas.',
        o_que_fazer: 'Caminhar do Louvre até a Ilha de Saint-Louis pelo Sena. Feira de Bastille no domingo de manhã.',
        onde_visitar: 'Museu de Orsay perde para o Louvre em tamanho e ganha em conforto. Vá no fim da tarde.',
        onde_ficar: 'Ficamos no 11º arrondissement: mais barato que o centro e a dez minutos de metrô de tudo.',
        ...publicadaEm('2026-03-15T12:00:00Z')
      },
      {
        id: 2, autor_id: 2, pais: 'França', cidade: 'Paris', escopo: 'internacional',
        onde_comer: 'Mercados cobertos resolvem o jantar por 15 euros. Evite restaurante com menu traduzido em quatro idiomas.',
        o_que_fazer: 'Passe de metrô semanal compensa a partir do terceiro dia.',
        onde_visitar: 'Sainte-Chapelle no início da manhã, com sol batendo nos vitrais.',
        onde_ficar: null,
        ...publicadaEm('2026-01-20T12:00:00Z')
      },
      {
        id: 3, autor_id: 5, pais: 'Portugal', cidade: 'Lisboa', escopo: 'internacional',
        onde_comer: 'Tasca do Chico para petiscos e fado. Pastelaria de bairro em vez das filas de Belém.',
        o_que_fazer: 'Elétrico 28 no primeiro horário, antes das nove, sem multidão.',
        onde_visitar: 'Castelo de São Jorge pelo fim do dia, com a cidade laranja.',
        onde_ficar: 'Graça é mais barato que o Chiado e tem a mesma vista.',
        ...publicadaEm('2025-11-10T12:00:00Z')
      },
      {
        id: 4, autor_id: 4, pais: 'Brasil', cidade: 'Florianópolis', escopo: 'nacional',
        onde_comer: 'Peixe frito no Ribeirão da Ilha, longe do circuito do centro.',
        o_que_fazer: 'Trilha da Lagoinha do Leste sai cedo e leva o dia inteiro.',
        onde_visitar: 'Praia do Santinho no meio da semana.',
        onde_ficar: 'Norte da ilha na alta temporada dobra de preço; Campeche fica mais em conta.',
        ...publicadaEm('2026-02-18T12:00:00Z')
      }
    ]);

    // Mesma contagem de fotos por bloco do protótipo. As URLs são placeholders
    // até o upload real ficar pronto.
    const foto = (id, dica_id, bloco, ordem) => ({
      id, dica_id, bloco, ordem,
      url: `https://placehold.co/600x400?text=${bloco}+${dica_id}-${ordem}`,
      legenda: null,
      created_at: agora
    });

    await queryInterface.bulkInsert('dica_fotos', [
      foto(1, 1, 'onde_comer', 1),
      foto(2, 1, 'o_que_fazer', 1),
      foto(3, 1, 'onde_visitar', 1),
      foto(4, 2, 'onde_comer', 1),
      foto(5, 2, 'onde_visitar', 1),
      foto(6, 3, 'onde_comer', 1),
      foto(7, 3, 'o_que_fazer', 1),
      foto(8, 3, 'onde_visitar', 1),
      foto(9, 3, 'onde_ficar', 1),
      foto(10, 4, 'o_que_fazer', 1),
      foto(11, 4, 'onde_visitar', 1)
    ]);

    await queryInterface.bulkInsert('avaliacoes_destino', [
      { id: 1, usuario_id: 2, pais: 'Portugal', cidade: 'Lisboa', escopo: 'internacional', nota: 9.2, ...ts },
      { id: 2, usuario_id: 3, pais: 'Portugal', cidade: 'Lisboa', escopo: 'internacional', nota: 8.8, ...ts },
      { id: 3, usuario_id: 4, pais: 'Portugal', cidade: 'Porto', escopo: 'internacional', nota: 9.0, ...ts },
      { id: 4, usuario_id: 5, pais: 'Argentina', cidade: 'Buenos Aires', escopo: 'internacional', nota: 8.6, ...ts },
      { id: 5, usuario_id: 2, pais: 'Argentina', cidade: 'Bariloche', escopo: 'internacional', nota: 8.1, ...ts },
      { id: 6, usuario_id: 3, pais: 'México', cidade: 'Cidade do México', escopo: 'internacional', nota: 8.2, ...ts },
      { id: 7, usuario_id: 4, pais: 'França', cidade: 'Paris', escopo: 'internacional', nota: 6.9, ...ts },
      { id: 8, usuario_id: 5, pais: 'França', cidade: 'Paris', escopo: 'internacional', nota: 7.1, ...ts },
      { id: 9, usuario_id: 2, pais: 'Chile', cidade: 'Santiago', escopo: 'internacional', nota: 7.9, ...ts },
      { id: 10, usuario_id: 3, pais: 'Brasil', cidade: 'Florianópolis', escopo: 'nacional', nota: 8.9, ...ts },
      { id: 11, usuario_id: 4, pais: 'Brasil', cidade: 'Florianópolis', escopo: 'nacional', nota: 8.5, ...ts },
      { id: 12, usuario_id: 5, pais: 'Brasil', cidade: 'Salvador', escopo: 'nacional', nota: 8.7, ...ts },
      { id: 13, usuario_id: 2, pais: 'Brasil', cidade: 'Salvador', escopo: 'nacional', nota: 8.3, ...ts },
      { id: 14, usuario_id: 3, pais: 'Brasil', cidade: 'Curitiba', escopo: 'nacional', nota: 8.0, ...ts },
      { id: 15, usuario_id: 4, pais: 'Brasil', cidade: 'Rio de Janeiro', escopo: 'nacional', nota: 7.4, ...ts },
      { id: 16, usuario_id: 5, pais: 'Brasil', cidade: 'São Paulo', escopo: 'nacional', nota: 7.0, ...ts }
    ]);

    await queryInterface.bulkInsert('grupos', [
      { id: 1, roteiro_id: 1, criador_id: 1, nome: 'Grupo 1', codigo_convite: 'PRS482', ...ts },
      { id: 2, roteiro_id: 2, criador_id: 1, nome: 'Família Lisboa', codigo_convite: 'LIS730', ...ts }
    ]);

    const membro = (id, grupo_id, usuario_id, papel) => ({ id, grupo_id, usuario_id, papel, entrou_em: agora });

    await queryInterface.bulkInsert('grupo_membros', [
      membro(1, 1, 1, 'admin'),
      membro(2, 1, 2, 'integrante'),
      membro(3, 1, 3, 'integrante'),
      membro(4, 1, 4, 'integrante'),
      membro(5, 1, 5, 'integrante'),
      membro(6, 2, 1, 'admin'),
      membro(7, 2, 3, 'integrante'),
      membro(8, 2, 4, 'integrante')
    ]);

    await queryInterface.bulkInsert('despesas', [
      { id: 1, grupo_id: 1, pagador_id: 1, descricao: 'Hotel · 5 noites', valor: 2400, data: '2026-04-12', categoria: 'hospedagem', modo_divisao: 'igual', ...ts },
      { id: 2, grupo_id: 1, pagador_id: 2, descricao: 'Jantar no bistrô', valor: 380, data: '2026-04-12', categoria: 'alimentacao', modo_divisao: 'igual', ...ts },
      { id: 3, grupo_id: 1, pagador_id: 3, descricao: 'Ingressos do Louvre', valor: 210, data: '2026-04-13', categoria: 'atividade', modo_divisao: 'personalizada', ...ts },
      { id: 4, grupo_id: 1, pagador_id: 1, descricao: 'Passes de metrô', valor: 150, data: '2026-04-13', categoria: 'transporte', modo_divisao: 'igual', ...ts },
      { id: 5, grupo_id: 2, pagador_id: 1, descricao: 'Aluguel de carro', valor: 900, data: '2026-09-03', categoria: 'transporte', modo_divisao: 'igual', ...ts }
    ]);

    // Só a despesa 3 é personalizada; as demais são divisão igual, calculada em
    // tempo de execução. A soma abaixo fecha com os R$ 210,00 da despesa — o
    // constraint trigger rejeitaria o contrário.
    await queryInterface.bulkInsert('despesa_rateios', [
      { id: 1, despesa_id: 3, usuario_id: 1, valor_devido: 70, ...ts },
      { id: 2, despesa_id: 3, usuario_id: 2, valor_devido: 70, ...ts },
      { id: 3, despesa_id: 3, usuario_id: 3, valor_devido: 70, ...ts },
      { id: 4, despesa_id: 3, usuario_id: 4, valor_devido: 0, ...ts },
      { id: 5, despesa_id: 3, usuario_id: 5, valor_devido: 0, ...ts }
    ]);

    // Reposiciona as sequences para depois do maior id inserido
    await queryInterface.sequelize.query(
      TABELAS
        .map((t) => `SELECT setval(pg_get_serial_sequence('${t}', 'id'), coalesce((SELECT max(id) FROM ${t}), 1));`)
        .join('\n')
    );
  },

  async down(queryInterface) {
    // Ordem inversa das dependências
    for (const tabela of [...TABELAS].reverse()) {
      await queryInterface.bulkDelete(tabela, null, {});
    }
  }
};
