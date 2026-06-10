// Anos de exercício consultados na DCA: 5 anos, do mais recente para trás.
// DCA é anual e publicada no ano seguinte, então começamos em (ano atual - 1).
const currentYear = new Date().getFullYear();
export const ANOS_EXERCICIO: number[] = Array.from({ length: 5 }, (_, i) => currentYear - 1 - i);

// Colunas (campo `coluna` do item) com os valores que interessam em cada anexo.
export const COLUNA_RECEITA_REALIZADA = 'Receitas Brutas Realizadas';
export const COLUNA_DESPESA_LIQUIDADA = 'Despesas Liquidadas';

// Receita: campo da série → cod_conta correspondente na DCA-Anexo I-C
export const RECEITAS_COD_CONTA = {
  iptu: 'RO1.1.1.2.50.0.0',   // Imposto sobre a Propriedade Predial e Territorial Urbana
  iss: 'RO1.1.1.4.51.0.0',    // Imposto sobre Serviços de Qualquer Natureza
  fpm: 'RO1.7.1.1.51.0.0',    // Cota-Parte do Fundo de Participação dos Municípios
  icms: 'RO1.7.2.1.50.0.0',   // Cota-Parte do ICMS
  fundeb: 'RO1.7.5.1.00.0.0', // Transferências de Recursos do Fundeb
} as const;

// Funções orçamentárias de interesse (código → nome) na DCA-Anexo I-E
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
