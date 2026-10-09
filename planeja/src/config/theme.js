/**
 * Identidade visual do Planeja — reaproveitada do projeto web.
 * Fonte única de verdade para cores, tipografia e espaçamentos do app.
 */

export const colors = {
  acento: '#8A3A1F', // ações principais, posição no ranking, destaques
  tinta: '#1A1A1A', // texto principal
  suave: '#6B6B6B', // texto secundário
  papel: '#FAF8F3', // fundo das telas
  linha: '#D8D4CC', // bordas e divisórias
  branco: '#FFFFFF',
  erroFundo: '#FDF7F4', // fundo de campo com erro de validação
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

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
};

export default { colors, fonts, spacing, radius };
