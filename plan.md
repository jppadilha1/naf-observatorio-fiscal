**Objetivo:** Projetar e desenvolver uma plataforma web analítica de transparência e inteligência de dados.

**Público-Alvo:** Formadores de políticas públicas, gestores municipais (Prefeitura), vereadores e a imprensa local de Varginha.

**Origem dos Dados:** Vocês deverão extrair dados do município de Varginha de fontes oficiais, tais como:

- Portal da Transparência do Governo Federal e Municipal.
- Siconfi (Sistema de Informações Contábeis e Fiscais do Setor Público Brasileiro - Tesouro Nacional).
- IBGE Cidades.
- Dados Abertos da Receita Federal.

Tipos de Dashboards Exigidos: A plataforma deve conter painéis interativos focados em:

- Arrecadação e Repasses: Evolução da arrecadação própria (ex: IPTU, ISS) versus repasses externos (FPM, ICMS, Fundeb).
- Despesas por Função: Como o município de Varginha gasta seu orçamento (Saúde, Educação, Urbanismo).
- Indicadores Socioeconômicos: Dados de emprego, renda média, empresas ativas vs. inativas na região.

**Inspiração/Exemplos:** Acessem plataformas como o site "Meu Município" (Fundação Brava), os painéis do "Tesouro Transparente" ou os portais do Observatório Social do Brasil (OSB) para referências de layout e utilidade pública.

# Observatório Fiscal e Econômico de Varginha

> Documentação de Arquitetura Inicial

Plataforma web analítica de transparência e inteligência de dados sobre as finanças e a economia do município de Varginha (MG). Voltada para formadores de políticas públicas, gestores municipais, vereadores, imprensa local e cidadãos interessados em justiça fiscal.

Projeto desenvolvido no contexto da disciplina de consolidação prática, em parceria com o NAF (Núcleo de Apoio Contábil e Fiscal), seguindo a metodologia de Aprendizagem em Serviço e Ensino Baseado em Projetos.

---

## Visão Geral

O Observatório é uma **aplicação web estática (SPA)** que consome dados pré-processados de fontes oficiais brasileiras (Tesouro Nacional, IBGE, Portal da Transparência) e os apresenta em painéis interativos focados em três eixos: arrecadação e repasses, despesas por função, e indicadores socioeconômicos.

A arquitetura escolhida é **JAMstack** (JavaScript + APIs + Markup): o frontend é estático e servido por CDN, enquanto os dados são preparados por scripts Python em uma etapa offline. Essa escolha se justifica pelo perfil dos dados fiscais municipais, que atualizam em ciclos mensais ou anuais — não em tempo real — e dispensa, portanto, infraestrutura de backend ou banco de dados dedicado. O resultado é zero custo de hospedagem, máxima performance ao usuário final, e um pipeline auditável e reprodutível por qualquer cidadão.

---

## Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Framework Frontend | **Angular 18+** (standalone components, signals) | Framework empresarial robusto, comum em órgãos públicos; aprendizado relevante para o contexto do projeto. |
| Estilização | **Tailwind CSS** | Utility-first; integração nativa com Spartan UI. |
| Componentes UI | **Spartan UI** (`spartan.ng`) | Porta da filosofia shadcn/ui para Angular: componentes copy-paste, acessíveis (baseados em Angular CDK), totalmente customizáveis. |
| Visualização de Dados | **ngx-echarts** (wrapper Angular do Apache ECharts) | Performance superior para conjuntos médios e grandes; rica biblioteca de tipos de gráfico (linhas, barras, mapas, tree maps, sunburst); excelente suporte a interatividade. |
| Pipeline de Dados | **Python 3.11+** com `pandas` e `requests` | Padrão de mercado para ETL; familiar à turma. |
| Versionamento | **Git + GitHub** | Repositório público para transparência do código. |
| CI/CD | **GitHub Actions** | Execução agendada do script Python para atualização periódica dos dados (opcional). |
| Hospedagem | **Cloudflare Pages** | Free tier com banda ilimitada, deploy automático por push, preview URLs em PRs, CDN global. |

---

## Estratégia de Dados

### Abordagem em Duas Fases

A estratégia adotada é **API-first com fallback para extração manual**. A motivação é maximizar a automação e a reprodutibilidade, mas sem ficar refém da disponibilidade ou da granularidade das APIs públicas.

#### Fase 1 — Tentativa via API

Para cada indicador previsto nos dashboards, tentamos primeiro consumir o dado diretamente das APIs oficiais (SICONFI e IBGE Servicodados, principalmente). O script Python faz requisições, filtra pelo código IBGE de Varginha (`3170701`), agrega e gera os JSONs consumidos pelo frontend.

Critérios para considerar a API suficiente:
- O endpoint retorna dados específicos do município
- A granularidade temporal atende ao dashboard (ex: anual, mensal)
- A série histórica disponível cobre pelo menos os últimos 5 anos
- O rate limit é compatível com a execução do script

#### Fase 2 — Fallback para Extração Manual

Caso a API não atenda (dado indisponível, granularidade insuficiente, série curta, ou indicador inexistente no endpoint), partimos para download manual de CSVs/Excel diretamente dos portais. Os arquivos brutos são versionados em `data/raw/` e processados pelo mesmo script Python, que gera os JSONs finais.

### Justificativa Arquitetural

Embora as bases brutas do governo sejam volumosas (a base do CNPJ tem milhões de linhas, o SICONFI cobre 5.570 municípios), após filtrar por Varginha e agregar por ano/categoria/função, o resultado é pequeno — provavelmente menos de 1 MB no total. Isso torna viável servir os dados como arquivos JSON estáticos diretamente via CDN, eliminando a necessidade de banco de dados ou backend dedicado.

---

## Fontes de Dados

### APIs Oficiais (Primeira Tentativa)

#### SICONFI — Sistema de Informações Contábeis e Fiscais (Tesouro Nacional)

- **Base URL:** `https://apidatalake.tesouro.gov.br/ords/siconfi/tt/`
- **Endpoints relevantes:**
  - `rreo` — Relatório Resumido da Execução Orçamentária
  - `rgf` — Relatório de Gestão Fiscal
  - `dca` — Declaração de Contas Anuais
- **Uso previsto:** Receitas (IPTU, ISS), repasses (FPM, ICMS, Fundeb), despesas por função (Saúde, Educação, Urbanismo).
- **Documentação:** https://apidatalake.tesouro.gov.br/docs/siconfi/

#### IBGE — Servicodados

- **Base URL:** `https://servicodados.ibge.gov.br/api/v1/`
- **Endpoints relevantes:**
  - `/localidades/municipios/3170701` — Metadados de Varginha
  - `/pesquisas/` — PIB, PNAD, Censo, Cadastro Central de Empresas
- **Uso previsto:** Indicadores socioeconômicos, população, empresas ativas, renda média.
- **Documentação:** https://servicodados.ibge.gov.br/api/docs

### Fontes Secundárias (Fallback)

- **Portal da Transparência (Federal e Municipal)** — https://portaldatransparencia.gov.br/
- **Dados Abertos da Receita Federal** — https://dados.gov.br/dados/conjuntos-dados
- **Site da Prefeitura de Varginha** (eventuais dados não centralizados)

---

## Estrutura de Pastas

```
observatorio-varginha/
├── README.md
├── plan.md                    # Este documento
├── .github/
│   └── workflows/
│       └── update-data.yml           # Action: executa o pipeline de dados (opcional)
│
├── data-pipeline/                    # Camada Python
│   ├── requirements.txt
│   ├── config.py                     # Códigos IBGE, constantes, paths
│   ├── extractors/
│   │   ├── __init__.py
│   │   ├── siconfi.py                # Cliente da API SICONFI
│   │   ├── ibge.py                   # Cliente da API IBGE
│   │   └── manual.py                 # Leitor de CSVs/Excel baixados manualmente
│   ├── transformers/
│   │   ├── __init__.py
│   │   ├── arrecadacao.py
│   │   ├── despesas.py
│   │   └── socioeconomicos.py
│   ├── outputs/
│   │   └── (gera JSONs aqui e copia para frontend/src/assets/data)
│   └── main.py                       # Ponto de entrada do pipeline
│
├── data/
│   ├── raw/                          # Arquivos brutos (CSV/Excel baixados)
│   │   └── .gitkeep
│   └── processed/                    # Backup dos JSONs gerados
│       └── .gitkeep
│
└── frontend/                         # Aplicação Angular
    ├── angular.json
    ├── package.json
    ├── tailwind.config.js
    ├── tsconfig.json
    └── src/
        ├── index.html
        ├── main.ts
        ├── styles.css                # Diretivas Tailwind + tema Spartan
        ├── app/
        │   ├── app.config.ts
        │   ├── app.routes.ts
        │   ├── app.component.ts
        │   ├── core/                 # Serviços compartilhados
        │   │   ├── data.service.ts   # HttpClient para os JSONs
        │   │   └── models/           # Interfaces TypeScript dos dados
        │   ├── shared/               # Componentes reutilizáveis
        │   │   ├── ui/               # Componentes Spartan (button, card, etc)
        │   │   └── charts/           # Wrappers de gráficos ngx-echarts
        │   └── features/             # Cada dashboard é uma feature
        │       ├── home/
        │       ├── arrecadacao/
        │       ├── despesas/
        │       └── socioeconomico/
        └── assets/
            └── data/                 # JSONs consumidos pelo frontend
                ├── arrecadacao.json
                ├── despesas-funcao.json
                └── socioeconomico.json
```

---

## Fluxo de Desenvolvimento

### Pipeline de Dados (Python)

1. O script `main.py` orquestra a execução dos extractors
2. Cada extractor tenta primeiro a API correspondente; se falhar ou for insuficiente, recorre aos arquivos em `data/raw/`
3. Os transformers normalizam, filtram por Varginha e agregam os dados
4. Os JSONs finais são escritos em `frontend/src/assets/data/`
5. O frontend, após `ng build`, carrega esses JSONs como assets estáticos

Exemplo simplificado de uso:

```bash
cd data-pipeline
pip install -r requirements.txt
python main.py
```

### Frontend (Angular)

1. Componentes consomem o serviço `DataService`, que faz `HttpClient.get()` nos JSONs em `/assets/data/`
2. Os dados são repassados aos componentes de gráfico (wrappers de `ngx-echarts`)
3. Estilização via Tailwind + tokens de tema do Spartan UI

Exemplo simplificado de uso:

```bash
cd frontend
npm install
ng serve
```

---

## Deploy e Hospedagem

### Cloudflare Pages

A hospedagem é feita no **Cloudflare Pages**, escolhido pelas seguintes características:

- Free tier com **banda ilimitada** (relevante para um portal público)
- **Deploy automático por push** no branch `main`
- **Preview URLs** para cada Pull Request
- **CDN global** com mais de 300 pontos de presença
- Integração direta com GitHub, sem necessidade de configuração de webhooks

### Configuração de Build

| Campo | Valor |
|---|---|
| Framework preset | Angular |
| Build command | `cd frontend && npm install && npm run build` |
| Build output directory | `frontend/dist/observatorio-varginha/browser` |
| Node version | 20.x |

> **Atenção:** A partir do Angular 17, o build gera os artefatos em `dist/<projeto>/browser/`. Em versões anteriores, era `dist/<projeto>/`. Verificar localmente com `ng build` antes do primeiro deploy.

### GitHub Actions (Opcional)

Workflow agendado (`.github/workflows/update-data.yml`) para reexecutar o pipeline Python periodicamente, fazer commit dos JSONs atualizados e disparar redeploy automático no Cloudflare Pages.

---

## Dashboards Previstos

| Dashboard | Indicadores | Fonte primária |
|---|---|---|
| **Arrecadação e Repasses** | Evolução de IPTU, ISS, FPM, ICMS, Fundeb; arrecadação própria vs. repasses externos | SICONFI (RREO, DCA) |
| **Despesas por Função** | Gasto orçamentário por função (Saúde, Educação, Urbanismo, Segurança); evolução temporal | SICONFI (DCA) |
| **Indicadores Socioeconômicos** | População, PIB municipal, empresas ativas vs. inativas, renda média | IBGE Servicodados + Receita Federal (Dados Abertos) |

Plataformas de referência para inspiração de layout: [Meu Município (Fundação Brava)](https://meumunicipio.org.br/), [Tesouro Transparente](https://www.tesourotransparente.gov.br/), [Observatório Social do Brasil](https://osbrasil.org.br/).

---

## Próximos Passos

1. Criar o repositório no GitHub e a estrutura inicial de pastas
2. Inicializar o projeto Angular (`ng new`) e configurar Tailwind + Spartan UI
3. Implementar o cliente SICONFI em Python e validar a disponibilidade dos dados de Varginha via API
4. Repetir validação para o IBGE Servicodados
5. Decidir, por dashboard, se segue via API ou fallback manual
6. Construir um dashboard piloto (sugestão: Arrecadação) ponta a ponta
7. Iterar nos demais dashboards
8. Configurar o deploy no Cloudflare Pages
9. Preparar a apresentação final do dia 24/06/2026
