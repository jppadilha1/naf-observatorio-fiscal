import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface RendaAnual {
  ano: number;
  rendaPerCapita: number;
}

export interface EmpregAnual {
  ano: number;
  admissoes: number;
  desligamentos: number;
  saldo: number;
}

export interface EmpresasAnual {
  ano: number;
  ativas: number;
  inativas: number;
}

export interface SocioeconomicoMeta {
  municipio: string;
  uf: string;
  codigo_ibge: string;
  fonte: string;
  dataAtualizacao: string;
  aviso: string;
}

export interface SocioeconomicoData {
  _meta: SocioeconomicoMeta;
  renda: RendaAnual[];
  emprego: EmpregAnual[];
  empresas: EmpresasAnual[];
}

export function fetchSocioeconomico(http: HttpClient): Observable<SocioeconomicoData> {
  return http.get<SocioeconomicoData>('/data/socioeconomico.mock.json').pipe(
    catchError(() =>
      throwError(() => new Error('Não foi possível carregar os dados socioeconômicos. Verifique o arquivo de dados.'))
    )
  );
}
