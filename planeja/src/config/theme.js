/**
 * Identidade visual do Planeja — reaproveitada do projeto web.
 * Fonte única de verdade para cores, tipografia e espaçamentos do app.
 */

export const colors = {
  acento: '#8A3A1F', // ações principais, posição no ranking, destaques
  acentoSuave: '#F3EBE4', // fundo da aba ativa e de botões discretos (ex.: setas do calendário)
  tinta: '#1A1A1A', // texto principal
  suave: '#6B6B6B', // texto secundário
  tenue: '#9A9A9A', // dicas de campo e títulos de seção
  papel: '#FAF8F3', // fundo das telas
  linha: '#D8D4CC', // bordas e divisórias
  linhaSuave: '#EBE8E1', // divisória do cabeçalho das telas
  branco: '#FFFFFF',
  erroFundo: '#FDF7F4', // fundo de campo com erro de validação
  linhaTocada: '#F4F1EA', // fundo da linha de lista enquanto está sendo tocada
  cardTocado: '#FDFCF9', // fundo do card enquanto está sendo tocado
  sombraFundo: 'rgba(26,26,26,0.4)', // véu escuro atrás de painéis e da foto ampliada
  ok: '#3C5A20', // item concluído (ex.: check da atividade feita)
  okSuave: '#DFE8D6', // fundo do que a pessoa tem a receber (acerto de contas)
  aviso: '#8A6B1F', // texto de alerta brando (ex.: etiqueta "poucas avaliações")
  avisoFundo: '#F1E9D2', // fundo da etiqueta de alerta
  neutroFundo: '#E6E3DC', // fundo da etiqueta neutra (ex.: "integrante")
  tintaSuave: '#3A3A3A', // texto corrido (ex.: blocos de uma dica)
  fundoSeletor: '#EFECE4', // trilho do seletor segmentado (ex.: Nacional | Internacional)
  bordaFoto: '#B5AEA1', // contorno tracejado do espaço de foto ainda vazio
};

// Cada peso é uma família separada: com fontes carregadas em tempo de execução,
// o fontWeight não troca de arquivo. Os nomes são os carregados em hooks/useFontesPlaneja.
export const fonts = {
  titulo: 'Fraunces_400Regular', // títulos de tela, nomes de destino, a marca
  tituloMedio: 'Fraunces_500Medium',
  corpo: 'SourceSans3_400Regular', // textos, rótulos, formulários e navegação
  corpoMedio: 'SourceSans3_500Medium',
  corpoSemi: 'SourceSans3_600SemiBold',
  corpoForte: 'SourceSans3_700Bold',
  mono: 'JetBrainsMono_400Regular', // números: valores, posição no ranking, códigos de convite
  monoMedio: 'JetBrainsMono_500Medium',
  monoForte: 'JetBrainsMono_700Bold',
};

// Medidas do protótipo (template.html): margem lateral das telas e espaço entre blocos.
export const spacing = {
  xs: 4,
  sm: 8,
  intervalo: 11, // entre os blocos do corpo da tela
  md: 16,
  margem: 18, // margem lateral das telas
  lg: 24,
  xl: 32,
};

// Raios do protótipo: botão pequeno e seletor (8), botão e campo (10), cartão (12),
// destaque (14), painel inferior (18), etiqueta (20) e pílula (barra de abas).
export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  painel: 18,
  etiqueta: 20,
  pilula: 999,
};

export default { colors, fonts, spacing, radius };
