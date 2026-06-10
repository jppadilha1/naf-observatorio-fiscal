# Observatório Fiscal e Econômico de Varginha

Plataforma web analítica de transparência e inteligência de dados sobre as finanças públicas e a economia do município de Varginha (MG). Desenvolvida no contexto do NAF — Núcleo de Apoio Contábil e Fiscal.

## Rodando localmente

```bash
npm install
npm start        # ng serve em http://localhost:4200
```

## Estrutura do projeto

```
src/
├── app/                  ← App shell: roteamento, topbar, home
│   ├── app.ts            ← componente raiz com topbar + router-outlet
│   ├── app.routes.ts     ← definição explícita de rotas (não é file-based)
│   ├── app.config.ts     ← providers: HttpClient, Router, ECharts
│   └── home/             ← landing page com cards de acesso rápido
│
├── components/
│   └── chart/            ← ChartComponent: wrapper ngx-echarts reutilizável
│                            recebe EChartsOption como @Input, gerencia loading/error
│
├── features/
│   ├── constants.ts      ← URLs das APIs, código IBGE 3170701, anos de exercício
│   ├── arrecadacao/      ← Dashboard 1: SICONFI RREO (IPTU, ISS, FPM, ICMS, Fundeb)
│   ├── despesas/         ← Dashboard 2: SICONFI DCA (despesas por função orçamentária)
│   └── socioeconomico/   ← Dashboard 3: JSON local (renda, emprego, empresas)
│
└── assets/data/
    └── socioeconomico.mock.json   ← dados mockados do Dashboard 3

data/                     ← dados brutos e futuros scripts Python de extração
└── README.md
```

## Dashboards

| Dashboard | Rota | Fonte |
|---|---|---|
| Arrecadação e Repasses | `/arrecadacao` | SICONFI — RREO Anexo 01 |
| Despesas por Função | `/despesas` | SICONFI — DCA Anexo XI |
| Indicadores Socioeconômicos | `/socioeconomico` | JSON local (mockado) |

## Substituindo os dados do Dashboard 3

O Dashboard 3 lê `src/assets/data/socioeconomico.mock.json` via HTTP. Para substituir por dados reais:

1. Execute o script de extração em `data/` (a criar)
2. Copie o JSON gerado para `src/assets/data/socioeconomico.mock.json`
3. O dashboard carrega automaticamente — nenhuma alteração de código necessária

## Fontes de dados

- **SICONFI / Tesouro Nacional** — `https://apidatalake.tesouro.gov.br/ords/siconfi/tt/`
- **IBGE** — `https://servicodados.ibge.gov.br/api/v1/`
- **Receita Federal** — dados abertos de CNPJ em `dados.gov.br`
- **MTE / CAGED** — `pdet.mte.gov.br`

Código IBGE de Varginha: **3170701**
