import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, throwError } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';
import { ANOS_EXERCICIO, COLUNA_RECEITA_REALIZADA, RECEITAS_COD_CONTA } from '../constants';

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

// Item da DCA-Anexo I-C (Receitas Orçamentárias)
interface DcaReceitaItem {
  cod_conta: string;
  conta: string;
  coluna: string;
  valor: number;
}

// Limite por consulta: evita spinner infinito se a rede travar (ex.: proxy).
const REQUEST_TIMEOUT_MS = 15000;

// DCA-Anexo I-C (Receitas Orçamentárias) de Varginha/MG (id_ente=3170701).
// URL relativa (mesma origem) → sem CORS no browser. Um proxy repassa para a
// SICONFI por baixo: dev em proxy.conf.json, prod em vercel.json. Ambos mapeiam
// /api/siconfi → https://apidatalake.tesouro.gov.br/ords/siconfi/tt.
function dcaReceitasUrl(ano: number): string {
  return `/api/siconfi/dca?an_exercicio=${ano}&no_anexo=DCA-Anexo%20I-C&id_ente=3170701`;
}

type CampoReceita = keyof Omit<ReceitaAnual, 'ano'>;

// Índice reverso cod_conta → campo, derivado do mapa em constants.
const CAMPO_POR_COD_CONTA = new Map<string, CampoReceita>(
  (Object.entries(RECEITAS_COD_CONTA) as [CampoReceita, string][]).map(([campo, cod]) => [cod, campo])
);

function agregarReceita(ano: number, items: DcaReceitaItem[]): ReceitaAnual {
  return items
    .filter((item) => item.coluna === COLUNA_RECEITA_REALIZADA)
    .reduce<ReceitaAnual>(
      (acc, item) => {
        const campo = CAMPO_POR_COD_CONTA.get(item.cod_conta);
        if (campo && item.valor) {
          acc[campo] += item.valor;
        }
        return acc;
      },
      { ano, iptu: 0, iss: 0, fpm: 0, icms: 0, fundeb: 0 }
    );
}

export function fetchArrecadacao(http: HttpClient): Observable<ArrecadacaoData> {
  // Uma requisição por ano de exercício; cada uma já devolve o ReceitaAnual
  // pronto, então o forkJoin só precisa juntar e ordenar a série.
  const requests = ANOS_EXERCICIO.map((ano) =>
    http
      .get<{ items: DcaReceitaItem[] }>(dcaReceitasUrl(ano))
      .pipe(map((res) => agregarReceita(ano, res.items ?? [])))
  );

  return forkJoin(requests).pipe(
    timeout(REQUEST_TIMEOUT_MS),
    map((series) => ({ series: series.sort((a, b) => a.ano - b.ano) })),
    catchError(() =>
      throwError(() => new Error('Não foi possível carregar os dados de arrecadação. Tente novamente mais tarde.'))
    )
  );
}
