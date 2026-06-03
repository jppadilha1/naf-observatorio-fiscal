import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SICONFI_BASE_URL, VARGINHA_IBGE_CODE, ANOS_EXERCICIO } from '../constants';

export interface ReceitaAnual {
  ano: number;
  iptu: number;
  iss: number;
  fpm: number;
  icms: number;
  fundeb: number;
}

export interface ArrecadacaoData {
  series: ReceitaAnual[];
}

interface RreoItem {
  an_exercicio: number;
  no_conta: string;
  vl_periodo_corrente: number;
}

const CONTA_MAP: Record<string, keyof Omit<ReceitaAnual, 'ano'>> = {
  'IPTU': 'iptu',
  'ISSQN': 'iss',
  'IMPOSTO SOBRE SERVIÇOS DE QUALQUER NATUREZA': 'iss',
  'IMPOSTO SOBRE A PROPRIEDADE PREDIAL E TERRITORIAL URBANA': 'iptu',
  'FUNDO DE PARTICIPAÇÃO DOS MUNICÍPIOS': 'fpm',
  'COTA-PARTE DO ICMS': 'icms',
  'TRANSFERÊNCIAS DO FUNDEB': 'fundeb',
};

function matchConta(noConta: string): keyof Omit<ReceitaAnual, 'ano'> | null {
  const upper = noConta.toUpperCase();
  for (const [key, field] of Object.entries(CONTA_MAP)) {
    if (upper.includes(key)) return field;
  }
  return null;
}

export function fetchArrecadacao(): Observable<ArrecadacaoData> {
  const http = inject(HttpClient);

  const requests = ANOS_EXERCICIO.map((ano) =>
    http.get<{ items: RreoItem[] }>(
      `${SICONFI_BASE_URL}/rreo?an_exercicio=${ano}&nr_periodo=6&co_tipo_demonstrativo=RREO&no_anexo=RREO-Anexo%2001&co_esfera=M&co_municipio=${VARGINHA_IBGE_CODE}`
    )
  );

  return forkJoin(requests).pipe(
    map((responses) => {
      const series: ReceitaAnual[] = ANOS_EXERCICIO.map((ano, idx) => {
        const items = responses[idx]?.items ?? [];
        const entry: ReceitaAnual = { ano, iptu: 0, iss: 0, fpm: 0, icms: 0, fundeb: 0 };
        for (const item of items) {
          const field = matchConta(item.no_conta ?? '');
          if (field && item.vl_periodo_corrente) {
            entry[field] += item.vl_periodo_corrente;
          }
        }
        return entry;
      });
      return { series: series.sort((a, b) => a.ano - b.ano) };
    }),
    catchError(() =>
      throwError(() => new Error('Não foi possível carregar os dados de arrecadação. Tente novamente mais tarde.'))
    )
  );
}
