import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SICONFI_BASE_URL, VARGINHA_IBGE_CODE, ANOS_EXERCICIO, FUNCOES_ORCAMENTARIAS } from '../constants';

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

interface DcaItem {
  an_exercicio: number;
  no_conta: string;
  cd_funcao?: string;
  vl_despesa_empenhada?: number;
  vl_despesa_liquidada?: number;
}

export function fetchDespesas(): Observable<DespesasData> {
  const http = inject(HttpClient);

  const requests = ANOS_EXERCICIO.map((ano) =>
    http.get<{ items: DcaItem[] }>(
      `${SICONFI_BASE_URL}/dca?an_exercicio=${ano}&no_anexo=DCA-Anexo%20XI&co_esfera=M&co_municipio=${VARGINHA_IBGE_CODE}`
    )
  );

  return forkJoin(requests).pipe(
    map((responses) => {
      const series: DespesaAnual[] = ANOS_EXERCICIO.map((ano, idx) => {
        const items = responses[idx]?.items ?? [];
        const byFuncao = new Map<string, number>();

        for (const item of items) {
          const cod = item.cd_funcao ?? '';
          if (!FUNCOES_ORCAMENTARIAS[cod]) continue;
          const val = item.vl_despesa_liquidada ?? item.vl_despesa_empenhada ?? 0;
          byFuncao.set(cod, (byFuncao.get(cod) ?? 0) + val);
        }

        const funcoes: DespesaFuncao[] = [...byFuncao.entries()].map(([funcao, valor]) => ({
          funcao,
          nome: FUNCOES_ORCAMENTARIAS[funcao],
          valor: +valor.toFixed(0),
        })).sort((a, b) => b.valor - a.valor);

        return { ano, funcoes };
      });
      return { series: series.sort((a, b) => a.ano - b.ano) };
    }),
    catchError(() =>
      throwError(() => new Error('Não foi possível carregar os dados de despesas. Tente novamente mais tarde.'))
    )
  );
}
