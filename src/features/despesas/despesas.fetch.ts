import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, throwError } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';
import { ANOS_EXERCICIO, COLUNA_DESPESA_LIQUIDADA, FUNCOES_ORCAMENTARIAS } from '../constants';

export interface DespesaFuncao {
  funcao: string;
  nome: string;
  valor: number;
}

export interface DespesaAnual {
  ano: number;
  funcoes: DespesaFuncao[];
}

export interface DespesasData {
  series: DespesaAnual[];
}

// Item da DCA-Anexo I-E (Despesas por Função/Subfunção)
interface DcaDespesaItem {
  cod_conta: string;
  conta: string;
  coluna: string;
  valor: number;
}

// Limite por consulta: evita spinner infinito se a rede travar (ex.: proxy).
const REQUEST_TIMEOUT_MS = 15000;

// URL da DCA-Anexo I-E (Despesas por Função) de Varginha/MG (id_ente=3170701).
// URL montada à mão (sem HttpParams): a query fica explícita e o espaço de
// no_anexo vai codificado como %20, exatamente como a API espera.
function dcaDespesasUrl(ano: number): string {
  return `https://apidatalake.tesouro.gov.br/ords/siconfi/tt/dca?an_exercicio=${ano}&no_anexo=DCA-Anexo%20I-E&id_ente=3170701`;
}

// Linha de função (nível 1): "10 - Saúde". Subfunções têm ponto ("10.301 - ...")
// e por isso não casam — pegamos só o total por função.
const FUNCAO_REGEX = /^(\d{2}) - (.+)$/;

function agregarDespesa(ano: number, items: DcaDespesaItem[]): DespesaAnual {
  // Soma o valor liquidado por código de função orçamentária de interesse.
  const porFuncao = items
    .filter((item) => item.coluna === COLUNA_DESPESA_LIQUIDADA)
    .reduce((acc, item) => {
      const cod = FUNCAO_REGEX.exec(item.conta ?? '')?.[1];
      if (cod && FUNCOES_ORCAMENTARIAS[cod]) {
        acc.set(cod, (acc.get(cod) ?? 0) + (item.valor ?? 0));
      }
      return acc;
    }, new Map<string, number>());

  const funcoes: DespesaFuncao[] = [...porFuncao]
    .map(([funcao, valor]) => ({
      funcao,
      nome: FUNCOES_ORCAMENTARIAS[funcao],
      valor: +valor.toFixed(0),
    }))
    .sort((a, b) => b.valor - a.valor);

  return { ano, funcoes };
}

export function fetchDespesas(http: HttpClient): Observable<DespesasData> {
  // Uma requisição por ano; cada uma já devolve o DespesaAnual agregado.
  const requests = ANOS_EXERCICIO.map((ano) =>
    http
      .get<{ items: DcaDespesaItem[] }>(dcaDespesasUrl(ano))
      .pipe(map((res) => agregarDespesa(ano, res.items ?? [])))
  );

  return forkJoin(requests).pipe(
    timeout(REQUEST_TIMEOUT_MS),
    map((series) => ({ series: series.sort((a, b) => a.ano - b.ano) })),
    catchError(() =>
      throwError(() => new Error('Não foi possível carregar os dados de despesas. Tente novamente mais tarde.'))
    )
  );
}
