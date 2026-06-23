export const empregos = [
  { ano: 2020, admissoes: 16320, desligamentos: 16432, saldo: -112 },
  { ano: 2021, admissoes: 22278, desligamentos: 19589, saldo: 2689 },
  { ano: 2022, admissoes: 24741, desligamentos: 22501, saldo: 2240 },
  { ano: 2023, admissoes: 26346, desligamentos: 24764, saldo: 1582 },
  { ano: 2024, admissoes: 30173, desligamentos: 28203, saldo: 1970 },
];

// Fonte: CAGED (Cadastro Geral de Empregados e Desempregados) — Novo CAGED, via Base
// dos Dados no BigQuery (Google Cloud). Tabela basedosdados.br_me_caged.microdados_movimentacao.
// Série 2020–2024 (2025 omitido por estar incompleto — só 10 meses na base).
// Query:
//   SELECT ano,
//          COUNTIF(saldo_movimentacao > 0) AS admissoes,
//          COUNTIF(saldo_movimentacao < 0) AS desligamentos,
//          SUM(saldo_movimentacao)         AS saldo
//   FROM `basedosdados.br_me_caged.microdados_movimentacao`
//   WHERE ano BETWEEN 2020 AND 2024 AND sigla_uf = 'MG' AND id_municipio = '3170701'
//   GROUP BY ano ORDER BY ano
