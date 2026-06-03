export const SICONFI_BASE_URL = 'https://apidatalake.tesouro.gov.br/ords/siconfi/tt';

export const VARGINHA_IBGE_CODE = '3170701';

const currentYear = new Date().getFullYear();
export const ANOS_EXERCICIO: number[] = Array.from({ length: 5 }, (_, i) => currentYear - 1 - i);

// Códigos de Anexo do RREO usados para arrecadação
export const RREO_ANEXO_RECEITAS = '1'; // Anexo 1 — Balanço Orçamentário (Receitas)

// Códigos de Anexo do DCA usados para despesas
export const DCA_ANEXO_DESPESAS = 'DCA-Anexo XI'; // Despesas por Função

// Rubricas de receita própria (tributária)
export const RUBRICAS_RECEITA_PROPRIA = {
  IPTU: '1.1.1.8.01.1.1', // IPTU — contribuição imobiliária urbana
  ISS: '1.1.1.8.05.1.1',  // ISS — serviços de qualquer natureza
};

// Rubricas de transferências
export const RUBRICAS_TRANSFERENCIAS = {
  FPM: '1.7.2.8.01.1.1',    // Fundo de Participação dos Municípios
  ICMS: '1.7.2.8.02.1.1',   // ICMS — cota-parte
  FUNDEB: '1.7.2.8.05.1.1', // Fundeb — transferências do estado
};

// Funções orçamentárias de interesse (código → nome)
export const FUNCOES_ORCAMENTARIAS: Record<string, string> = {
  '04': 'Administração',
  '08': 'Assistência Social',
  '10': 'Saúde',
  '12': 'Educação',
  '15': 'Urbanismo',
  '17': 'Saneamento',
  '26': 'Transporte',
  '28': 'Encargos Especiais',
};
