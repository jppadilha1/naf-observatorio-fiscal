import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { empregos } from '../../data/caged';

const COD_IBGE = '3170701';
const ANOS = [2018, 2019, 2020, 2021, 2022];

export interface RendaAnual {
  ano: number;
  rendaPerCapita: number;
}

export interface EmpregoAnual {
  ano: number;
  admissoes: number;
  desligamentos: number;
  saldo: number;
}

export interface EmpresasAnual {
  ano: number;
  ativas: number;
}

export interface SocioeconomicoData {
  renda: RendaAnual[];
  emprego: EmpregoAnual[];
  empresas: EmpresasAnual[];
}

type SidraRow = Record<string, string>;

// SIDRA headers have paired columns: "Variável (Código)" and "Variável".
// Excluding "(Código)" ensures we match the human-readable name column,
// not the numeric code — which would break string filters.
function colKey(header: SidraRow, rotuloContem: string): string {
  return (
    Object.keys(header).find(
      (k) =>
        (header[k] ?? '').includes(rotuloContem) && !(header[k] ?? '').includes('(Código)'),
    ) ?? ''
  );
}

function toNum(v: string): number | null {
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function fetchRenda(http: HttpClient): Observable<RendaAnual[]> {
  // Tabela 5938 | v/37 = "Produto Interno Bruto a preços correntes"
  const url = `https://apisidra.ibge.gov.br/values/t/5938/n6/${COD_IBGE}/v/37/p/all`;
  
  return http.get<SidraRow[]>(url).pipe(
    map((json) => {
      const header = json[0];
      const rows = json.slice(1);
      const kAno = colKey(header, 'Ano');
      const kVal = colKey(header, 'Valor');
      
      return rows
        .filter((r) => ANOS.includes(Number(r[kAno])))
        .map((r) => ({ ano: Number(r[kAno]), rendaPerCapita: toNum(r[kVal])! }))
        .filter((x) => x.rendaPerCapita !== null)
        .sort((a, b) => a.ano - b.ano);
    }),
  );
}

function fetchEmpresas(http: HttpClient): Observable<EmpresasAnual[]> {
  // Retornamos para v/all, pois a tabela 1685 já traz os dados simplificados
  const url = `https://apisidra.ibge.gov.br/values/t/1685/n6/${COD_IBGE}/v/all/p/all`;
  
  return http.get<SidraRow[]>(url).pipe(
    map((json) => {
      const header = json[0];
      const rows = json.slice(1);
      
      const kVar = colKey(header, 'Variável');
      const kAno = colKey(header, 'Ano');
      const kVal = colKey(header, 'Valor');
      
      return rows
        // Filtramos apenas a variável que contém "empresas"
        .filter((r) => String(r[kVar]).toLowerCase().includes('empresas'))
        .filter((r) => ANOS.includes(Number(r[kAno])))
        .map((r) => ({ ano: Number(r[kAno]), ativas: toNum(r[kVal])! }))
        .filter((x) => x.ativas !== null)
        .sort((a, b) => a.ano - b.ano);
    }),
  );
}

export function fetchSocioeconomico(http: HttpClient): Observable<SocioeconomicoData> {
  return forkJoin({
    renda: fetchRenda(http),
    empresas: fetchEmpresas(http),
  }).pipe(
    map(({ renda, empresas }) => ({ renda, emprego: empregos, empresas })),
    catchError(() =>
      throwError(
        () => new Error('Não foi possível carregar os dados socioeconômicos.'),
      ),
    ),
  );
}
